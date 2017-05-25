'use strict';

const expect  = require('chai').expect;
const Promise = require('bluebird');

const AssetBuffer = require('../lib/companion_asset_editor/asset_buffer');
const ObjectInfo  = require('../lib/companion_asset_editor/object_info');

function addObjectMetadata(buffer, metadata) {
  buffer.writeInt32LE(metadata.object_id);
  buffer.writeUInt32LE(metadata.individual_data_offset);
  buffer.writeUInt32LE(metadata.size);
  buffer.writeInt32LE(metadata.type_id);
  buffer.writeInt16LE(metadata.class_id);
  buffer.writeInt16LE(metadata.is_destroyed);
}

function addObjectReferences(buffer, object_references) {
  buffer.writeUInt32LE(object_references.number_of_object_references);

  object_references.references.forEach(function(reference) {
    buffer.writeStringNT(reference.asset_path);
    buffer.writeString('aaaaaaaaaaaaaaaa', 'ascii');
    buffer.writeInt32LE(reference.type_id);
    buffer.writeStringNT(reference.file_path, 'utf8');
  });

  buffer.writeStringNT(object_references.identifier);
}

describe('ObjectInfo', function() {
  let buffer;
  let metadata_offset;
  let data_offset;
  let number_of_objects;
  let object_info;

  beforeEach(function() {
    buffer = AssetBuffer.fromArray(new Array(32).fill(1, 0, 32));
  });

  beforeEach(function() {
    metadata_offset   = 32;
    data_offset       = 52;
    number_of_objects = 2;
  });

  beforeEach(function() {
    object_info = new ObjectInfo(buffer, metadata_offset, data_offset, number_of_objects);
  });

  describe('constructor', function() {
    it('sets the buffer, offsets, and number of objects', function() {
      expect(object_info.buffer).to.equal(buffer);

      expect(object_info.metadata_offset).to.equal(32);
      expect(object_info.data_offset).to.equal(52);

      expect(object_info.number_of_objects).to.equal(2);
    });

    it('defaults is_long_ids to false', function() {
      expect(object_info.is_long_ids).to.equal(false);
    });

    context('when is_long_ids is passed in', function() {
      let is_long_ids;
      let long_ids_object_info;

      beforeEach(function() {
        is_long_ids = true;
      });

      beforeEach(function() {
        long_ids_object_info = new ObjectInfo(buffer, metadata_offset, data_offset, number_of_objects, is_long_ids);
      });

      it('uses that value', function() {
        expect(long_ids_object_info.is_long_ids).to.equal(true);
      });
    });
  });

  describe('#loadObjectMetadata', function() {
    let object_info;
    let buffer;

    beforeEach(function() {
      buffer = AssetBuffer.fromArray(new Array(300).fill(1, 0, 32));
    });

    beforeEach(function() {
      let metadata_offset   = 32;
      let data_offset       = 52;
      let number_of_objects = 2;

      object_info = new ObjectInfo(buffer, metadata_offset, data_offset, number_of_objects);
    });

    beforeEach(function() {
      buffer.moveTo(metadata_offset);
      buffer.writeOffset = buffer.readOffset;
    });

    beforeEach(function() {
      let object_metadata = [
        {
          object_id: 1,
          individual_data_offset: 0,
          size: 30,
          type_id: -21,
          class_id: 1,
          is_destroyed: 0,
        },
        {
          object_id: 2,
          individual_data_offset: 30,
          size: 30,
          type_id: 22,
          class_id: 2,
          is_destroyed: 0,
        },
      ];

      object_metadata.forEach(function(metadata) {
        addObjectMetadata(buffer, metadata);
      });
    });

    beforeEach(function() {
      let object_references = {
        number_of_object_references: 1,
        identifier:                  'fake-identifier',
        references: [
          {
            type_id:    -5,
            asset_path: 'fake/asset/path',
            file_path:  'fake/file/path',
          },
        ],
      };

      addObjectReferences(buffer, object_references);
    });

    it('parses the object metadata and saves it on the instance', function() {
      object_info.loadObjectMetadata();

      expect(object_info.object_metadata).to.deep.equal({
        identifier: 'fake-identifier',
        number_of_object_references: 1,
        object_reference_offset: 76,
        object_references: [
          {
            asset_path: 'fake/asset/path',
            file_path:  'fake/file/path',
            type_id: -5,
          },
        ],
        objects: [
          {
            class_id: 1,
            individual_data_offset: 0,
            is_destroyed: 0,
            object_id: 1,
            offset: 52,
            size: 30,
            type_id: -21,
          },
          {
            class_id: 2,
            individual_data_offset: 30,
            is_destroyed: 0,
            object_id: 2,
            offset: 82,
            size: 30,
            type_id: 22,
          },
        ],
      });
    });
  });

  describe('.readType', function() {
    let test_types;
    let buffer;
    let object_type;

    beforeEach(function() {
      test_types = [
        { type: 'bool' },
        { type: 'SInt8' },
        { type: 'UInt8' },
        { type: 'SInt16' },
        { type: 'UInt16' },
        { type: 'UInt32' },
        { type: 'unsigned int' },
        { type: 'SInt32' },
        { type: 'int' },
        { type: 'float' },
        { type: 'string' },
        { type: 'Array', children: [ { type: 'int' }, { type: 'int'} ]},
      ];
    });

    beforeEach(function() {
      object_type = {
        type: 'fake-type',
        align_after_reading: true,
        children: [
          { type: 'string', name: 'fake_string' },
          { type: 'UInt8', name: 'fake_int' },
        ],
      }
    });

    beforeEach(function() {
      buffer = AssetBuffer.fromArray([]);
    });

    beforeEach(function() {
      buffer.writeInt8(0);

      buffer.writeInt8(-1);

      buffer.writeUInt8(2);

      buffer.writeInt16LE(-3);

      buffer.writeUInt16LE(4);

      buffer.writeUInt32LE(5);

      buffer.writeUInt32LE(6);

      buffer.writeInt32LE(-7);
      buffer.writeInt32LE(-8);

      buffer.writeFloatLE(9.00);

      buffer.writeInt32LE(3);
      buffer.writeString('ten');

      buffer.writeInt32LE(1);
      buffer.writeInt32LE(1);

      buffer.writeInt32LE(6);
      buffer.writeString('string');
      buffer.writeInt8(55);
      buffer.writeInt8(0);
      buffer.writeInt16LE(0);
    });

    it('can read sinple types', function() {
      var read_types = [];

      test_types.forEach(function(type) {
        var read_type = ObjectInfo.readType(buffer, type);

        read_types.push(read_type);
      });

      expect(read_types).to.deep.equal([
        { offset: 0, value: 0 },
        { offset: 1,  value: -1 },
        { offset: 2, value: 2 },
        { offset: 3, value: -3 },
        { offset: 5, value: 4 },
        { offset: 7, value: 5 },
        { offset: 11, value: 6 },
        { offset: 15, value: -7 },
        { offset: 19, value: -8 },
        { offset: 23, value: 9 },
        { offset: 27, value: 'ten' },
        {
          offset: 34,
          value: [
            { offset: 34, value: 1 },
            { offset: 38, value: 1 },
          ],
        },
      ]);
    });

    it('can read object types', function() {
      buffer.moveTo(42);

      let object_data = ObjectInfo.readType(buffer, object_type);

      expect(object_data).to.deep.equal({
        offset: 42,
        value: {
          fake_int: {
            offset: 52,
            value: 55,
          },
          fake_string: {
            offset: 42,
            value: 'string',
          },
        },
      });

      expect(buffer.readOffset).to.equal(56);
    });

    context('when the type is unknown', function() {
      let unknown_type = { type: 'unknown-type' };
      it('throws an error', function() {
        expect(ObjectInfo.readType.bind(null, buffer, unknown_type)).to.throw(/Invalid type:.*unknown\-type/);
      });
    });
  });
});
