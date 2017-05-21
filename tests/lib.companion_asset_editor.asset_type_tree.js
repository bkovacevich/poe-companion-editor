'use strict';

const chai          = require('chai');
const AssetTypeTree = require('../lib/companion_asset_editor/asset_type_tree');
const AssetBuffer   = require('../lib/companion_asset_editor/asset_buffer');
const sinon         = require('sinon');
const sinon_chai    = require('sinon-chai');

const expect = chai.expect;

chai.use(sinon_chai);

function buildAssetType(buffer, asset_node_data) {
  buffer.writeStringNT(asset_node_data.type);
  buffer.writeStringNT(asset_node_data.name);
  buffer.writeInt32LE(asset_node_data.size);
  buffer.writeInt32LE(asset_node_data.index);
  buffer.writeInt32LE(asset_node_data.is_array);
  buffer.writeInt32LE(asset_node_data.version);

  let flags = 0x000;
  if (asset_node_data.align_after_reading) {
    let flags = 0x4000;
  }
  buffer.writeInt32LE(flags);

  buffer.writeUInt32LE(asset_node_data.number_of_fields);
};

function buildTreeHeader(buffer, header_data) {
  buffer.writeUInt32BE(header_data.header_size);
  buffer.writeUInt32BE(header_data.file_size);
  buffer.writeUInt32BE(header_data.format);
  buffer.writeUInt32BE(header_data.data_offset);
  buffer.writeUInt32BE(header_data.endianess);

  buffer.writeStringNT(header_data.version);
  buffer.writeUInt32LE(header_data.platform_id);
  buffer.writeUInt32LE(header_data.number_of_fields);
}

function buildTreeFooter(buffer, footer_data) {
  buffer.writeUInt32LE(footer_data.is_long_ids);
  buffer.writeUInt32LE(footer_data.number_of_objects);
}

function buidTypeRoot(buffer, type_root_data) {
  buffer.writeInt32LE(type_root_data.type_id);
}

describe('AssetTypeTree', function() {
  let header_data;
  let type_data;
  let footer_data;

  beforeEach(function() {
    header_data = {
      header_size: 41,
      file_size: 0,
      format: 10,
      data_offset: 500,
      endianess: 0,

      version: 'fake-version',
      platform_id: 10,
      number_of_fields: 2,
    };
  });

  beforeEach(function() {
    type_data = [
      {
        type_id: -21,
        children: [
          {
            type: 'fake_root_type_1',
            name: 'fake_root_name_1',
            size: -1,
            index: 1,
            is_array: 0,
            version: 1,
            align_after_reading: false,
            number_of_fields: 2,
          },
          {
            type: 'fake_child_type_1',
            name: 'fake_child_name_1',
            size: 10,
            index: 1,
            is_array: 0,
            version: 1,
            align_after_reading: false,
            number_of_fields: 0,
          },
          {
            type: 'fake_child_type_2',
            name: 'fake_child_name_2',
            size: 20,
            index: 2,
            is_array: 0,
            version: 2,
            align_after_reading: true,
            number_of_fields: 0,
          },
        ],
      },
      {
        type_id: 15,
        children: [
          {
            type: 'fake_root_type_2',
            name: 'fake_root_name_2',
            size: 10,
            index: 2,
            is_array: 0,
            version: 3,
            align_after_reading: false,
            number_of_fields: 0,
          },
        ],
      },
    ];
  });

  beforeEach(function() {
    footer_data = {
      is_long_ids: 0,
      number_of_objects: 20,
    };
  });

  context('constructor', function() {
    let buffer;
    let tree_offset;

    beforeEach(function() {
      buffer      = AssetBuffer.fromSize(16);
      tree_offset = 12;
    });

    it('sets the buffer', function() {
      var asset_type_tree = new AssetTypeTree(buffer, tree_offset);

      expect(asset_type_tree.buffer).to.be.an.instanceOf(AssetBuffer);

    });

    it('sets the tree offset', function() {
      var asset_type_tree = new AssetTypeTree(buffer, tree_offset);

      expect(asset_type_tree.tree_offset).to.equal(12);
    });
  });

  describe('#load', function() {
    let buffer;
    let offset;
    let asset_type_tree;

    beforeEach(function() {
      offset = 4;

      let buffer_data = [];

      buffer = AssetBuffer.fromArray(buffer_data);

      buffer.writeInt32LE(0x0001);

      buffer.moveTo(offset);
    });

    beforeEach(function() {
      buildTreeHeader(buffer, header_data);
    });

    beforeEach(function() {
      type_data.forEach(function(type) {
        buidTypeRoot(buffer, {
          type_id: type.type_id,
        });

        type.children.forEach(function(child) {
          buildAssetType(buffer, child);
        });
      });
    });

    beforeEach(function() {
      buildTreeFooter(buffer, footer_data);
    });

    beforeEach(function() {
      asset_type_tree = new AssetTypeTree(buffer, offset);
    });

    beforeEach(function() {
      buffer.moveTo(256);
    });

    it('loads the type tree from the buffer and saves the state', function() {
      asset_type_tree.load();

      expect(asset_type_tree.type_tree).to.deep.equal({
        header_size:         41,
        is_long_ids:         0,
        number_of_objects:   20,
        object_info_offset:  297,
        file_size:           0,
        format:              10,
        data_offset:         500,
        endianess:           0,
        version:             'fake-version',
        platform_id:         10,
        number_of_fields:    2,
        types: {
          "15": {
            type:                 'fake_root_type_2',
            name:                 'fake_root_name_2',
            size:                 10,
            index:                2,
            is_array:             0,
            version:              3,
            flags:                0,
            number_of_fields:     0,
            align_after_reading:  false,
            children:             [],
          },
          "-21": {
            type:                 'fake_root_type_1',
            name:                 'fake_root_name_1',
            size:                 -1,
            index:                1,
            is_array:             0,
            version:              1,
            flags:                0,
            number_of_fields:     2,
            align_after_reading:  false,
            children: [
              {
                type:                 'fake_child_type_1',
                name:                 'fake_child_name_1',
                size:                 10,
                index:                1,
                is_array:             0,
                version:              1,
                flags:                0,
                number_of_fields:     0,
                align_after_reading:  false,
                children:             [],
              },
              {
                type:                 'fake_child_type_2',
                name:                 'fake_child_name_2',
                size:                 20,
                index:                2,
                is_array:             0,
                version:              2,
                flags:                0,
                number_of_fields:     0,
                align_after_reading:  false,
                children:             [],
              }
            ],
          },
        },
      });
    });
  });

  describe('#getTypeTree', function() {
    let type_tree;
    let asset_type_tree;

    beforeEach(function() {
      type_tree = {
        fake: 'tree',
      };

      let buffer = AssetBuffer.fromArray([]);
      let offset = 0;
      asset_type_tree = new AssetTypeTree(buffer, offset);

      sinon.stub(asset_type_tree, 'load').callsFake(function() {
        this.type_tree = type_tree;
      });
    });

    it('loads the type tree and returns it', function() {
      let type_tree = asset_type_tree.getTypeTree();

      expect(asset_type_tree.load).to.have.been.calledOnce;

      expect(type_tree).to.deep.equal({
        fake: 'tree',
      });
    });

    context('when the type tree is already set', function() {
      beforeEach(function() {
        asset_type_tree.type_tree = {
          fake: 'tree',
        };
      });

      it('does not load the type tree', function() {
        let type_tree = asset_type_tree.getTypeTree();

        expect(asset_type_tree.load).to.not.have.been.called;

        expect(type_tree).to.deep.equal({
          fake: 'tree',
        });
      });
    });
  });

  describe('#findRootType', function() {
    let asset_type_tree;
    let type_tree_data;

    beforeEach(function() {
      let buffer = AssetBuffer.fromArray([]);
      let offset = 0;
      asset_type_tree = new AssetTypeTree(buffer, offset);
    });

    beforeEach(function() {
      type_tree_data = {
        types: {
          1: {
            children: [
              {
                type: 'fake-type',
                name: 'fake',
                children: []
              },
              {
                type: 'fake-type',
                children: [
                  {
                    type: 'fake-type',
                    name: 'fake-name',
                  }
                ],
              },
            ],
          },
          2: {
            type: 'fake-type',
            name: 'fake-name',
            children: [],
          }
        },
      };

      asset_type_tree.type_tree = type_tree_data;
    });

    it('returns the first matching type', function() {
      let found_type = asset_type_tree.findRootType({
        type: 'fake-type',
        name: 'fake-name',
      });

      expect(found_type).to.deep.equal({
        type_id: "1",
        type: {
          children: [
            {
              type: 'fake-type',
              name: 'fake',
              children: []
            },
            {
              type: 'fake-type',
              children: [
                {
                  type: 'fake-type',
                  name: 'fake-name',
                }
              ],
            },
          ],
        },
      });
    });

    context('when the type tree has not been loaded', function() {
      beforeEach(function() {
        delete asset_type_tree.type_tree;
      });

      beforeEach(function() {
        sinon.stub(asset_type_tree, 'load').callsFake(function() {
          this.type_tree = type_tree_data;
        });
      });
      it('loads it', function() {
        let found_type = asset_type_tree.findRootType({
          type: 'fake-type',
          name: 'fake-name',
        });

        expect(asset_type_tree.load).to.have.been.calledOnce;
      });
    });
  });
});
