'use strict';

const expect               = require('chai').expect;
const Promise              = require('bluebird');
const fs                   = require('fs');

const CompanionAssetEditor = require('../lib/companion_asset_editor');

const unlink = Promise.promisify(fs.unlink);

describe('CompanionAssetEditor', function() {
  let companion_file_name;
  let asset_editor;

  beforeEach(function() {
    companion_file_name = 'tests/data/companion_eder.unity3d';
    asset_editor = new CompanionAssetEditor(companion_file_name);
  });

  describe('.constructor', function() {
    it('sets the file name', function() {
      expect(asset_editor.file_name).to.equal(companion_file_name);
    });

    it('initializes companion_data', function() {
      expect(asset_editor.companion_data).to.deep.equal({});
    });
  });

  describe('#parseHeader', function() {
    it('parses the header file', function() {
      return asset_editor.parseHeader()
        .catch(function (err) {
          expect(err).to.not.exist;
        })
        .then(function(header) {
          expect(header).to.deep.equal({
            signature:                 'UnityRaw',
            format_version:            3,
            unity_version:             '3.x.x',
            generator_version:         '4.7.0f1',
            file_size:                 816036,
            header_size:               60,
            file_count:                1,
            bundle_count:              1,
            uncompressed_bundle_size:  815976,
            bundle_size:               815976,
            compressed_file_size:      816036,
            asset_header_size:         52,
          });
        });
    });
  });

  describe('#parseAssetBundle', function() {
    let offset;

    beforeEach(function() {
      offset = 60;
    });

    it('resolves the asset bundle metadata', function() {
      return asset_editor.parseAssetBundle(offset)
        .catch(function(err) {
          expect(err).to.not.exist;
        })
        .then(function(asset) {
          expect(asset).to.deep.equal({
            number_of_children:  1,
            name:                'CAB-1e289d4e73b9aa94a91e38b848e98389',
            header_size:         52,
            size:                815924,
            data_offset:         112,
          });
        });
    });
  });

  describe('#loadAssetTypeTree', function() {
    let offset;
    let expected;

    beforeEach(function(done) {
      offset = 112;

      return fs.readFile('./tests/data/eder_asset_tree.json', (err, file_buffer) => {
        expect(err).to.not.exist;

        expected = JSON.parse(file_buffer.toString());

        return done();
      });
    });

    it('resolves the asset data', function() {
      return asset_editor.loadAssetTypeTree(offset)
        .catch(function(err) {
          expect(err).to.not.exist;
        })
        .then(function(asset_data) {
          expect(asset_data).to.deep.equal(expected);
        });
    });
  });

  describe('#loadObjectInfo', function() {
    let offset;
    let number_of_objects;
    let object_data_offset;
    let is_long_ids;

    let expected;

    beforeEach(function() {
      offset             = 223126;
      number_of_objects  = 440;
      is_long_ids        = false;
      object_data_offset = 232160;
    });

    beforeEach(function(done) {
      return fs.readFile('./tests/data/eder_object_metadata.json', (err, file_buffer) => {
        expect(err).to.not.exist;

        expected = JSON.parse(file_buffer.toString());

        return done();
      });
    });

    it('loads object info', function() {
      return asset_editor.loadObjectInfo(number_of_objects, offset, object_data_offset, is_long_ids)
        .catch(function(err) {
         expect(err).to.not.exist();
        })
        .then(function(object_metadata) {
          expect(object_metadata).to.deep.equal(expected);
        });
    });
  });

  describe('#findCharicterSheetType', function() {
    let asset_tree;
    let expected_sheet_type;
    let offset;

    beforeEach(function() {
      offset = 112;

      return asset_editor.loadAssetTypeTree(offset)
        .catch(function(err) {
          expect(err).to.not.exist;
        })
        .then(function(result) {
          asset_tree = result;
        });
    });

    beforeEach(function(done) {
      return fs.readFile('./tests/data/eder_sheet_type.json', (err, file_buffer) => {
        expect(err).to.not.exist;

        expected_sheet_type = JSON.parse(file_buffer.toString());

        return done();
      });
    });

    it('searches the asset type tree for the charicter sheet', function() {
      return asset_editor.findCharicterSheetType(offset)
        .catch(function(err) {
          expect(err).to.not.exist();
        })
        .then(function(charicter_sheet_type) {
          expect(charicter_sheet_type.type).to.deep.equal(expected_sheet_type);
          expect(charicter_sheet_type.type_id).to.deep.equal("-20");
        });
    });
  });

  describe('#findCharicterSheetObjectInfo', function() {
    let object_metadata;
    let type_id;

    beforeEach(function() {
      type_id = "-20"
    });

    beforeEach(function() {
      let number_of_objects  = 440;
      let offset             = 223126;
      let object_data_offset = 232160 ;
      let is_long_ids        = false;

      return asset_editor.loadObjectInfo(number_of_objects, offset, object_data_offset, is_long_ids)
        //.catch(function(err) {
        //  expect(err).to.not.exist();
        //})
        .then(function(results) {
          object_metadata = results;
        });
    });

    it('gets the charicter sheet object metadata', function() {
      let charicter_sheet_object = asset_editor.findCharicterSheetObjectInfo(type_id, object_metadata);

      expect(charicter_sheet_object).to.deep.equal({
        object_id:               415,
        offset:                  807504,
        individual_data_offset:  575344,
        size:                    696,
        type_id:                 -20,
        class_id:                114,
        is_destroyed:            0,
      });
    });

  });

  describe('#readObjectData', function() {
    let object_metadata;
    let type;
    let type_id;
    let expected_sheet_data;

    beforeEach(function() {
      let offset = 112;

      return asset_editor.findCharicterSheetType(offset)
        .catch(function(err) {
          expect(err).to.not.exist;
        })
        .then(function(charicter_sheet_type) {
          type    = charicter_sheet_type;
          type_id = charicter_sheet_type.type_id;
        })
        .then(function() {
          let number_of_objects  = 440;
          let offset             = 223126;
          let object_data_offset = 232160 + 112;
          let is_long_ids        = false;

          return asset_editor.loadObjectInfo(number_of_objects, offset, object_data_offset, is_long_ids)
        })
        .then(function(results) {
          object_metadata = asset_editor.findCharicterSheetObjectInfo(type_id, results);
        });
    });

    beforeEach(function(done) {
      return fs.readFile('./tests/data/eder_sheet_data.json', (err, file_buffer) => {
        expect(err).to.not.exist;

        expected_sheet_data = JSON.parse(file_buffer.toString());

        return done();
      });
    });

    it('reads the object data', function() {
      return asset_editor.readObject(object_metadata, type)
        .catch(function(err) {
          expect(err).to.not.exist();
        })
        .then(function(object_data) {
          expect(object_data).to.deep.equal(expected_sheet_data);
        });
    });
  });

  describe('#getCharicterSheet', function() {
    it('gets the current charicter sheet stats', function() {
      return asset_editor.getCharicterSheet()
        .catch(function(err) {
          expect(err).to.not.exist();
        })
        .then(function(sheet) {
          expect(sheet).to.deep.equal({
            values: {
              might:         15,
              constitution:  16,
              dexterity:     11,
              perception:    12,
              intellect:     10,
              resolve:       11,
            },
            offsets: {
              might:         124,
              constitution:  128,
              dexterity:     132,
              perception:    136,
              intellect:     140,
              resolve:       144,
            },
            stat_total: 75,
            base_offset: 807616,
          });
        });
    });
  });

  describe('.alterStats', function() {
    let new_stats;

    beforeEach(function() {
      new_stats = {
        values: {
          might:         16,
          constitution:  10,
          dexterity:     10,
          perception:    3,
          intellect:     18,
          resolve:       18,
        },
        offsets: {
          might:         124,
          constitution:  128,
          dexterity:     132,
          perception:    136,
          intellect:     140,
          resolve:       144,
        },
        stat_total:  75,
        base_offset: 807616,
      };
    });

    beforeEach(function() {
      return asset_editor.getCharicterSheet();
    });

    it('updates the buffer with the new stats', function() {
      return asset_editor.alterStats(new_stats)
        .then(function() {
          return asset_editor.getCharicterSheet();
        })
        .then(function(sheet) {
          expect(sheet).to.deep.equal(new_stats);
        });
    });
  });

  describe('.saveAs', function() {
    let new_filename = 'tests/data/companion_eder_new.unity3d';
    let new_stats;

    beforeEach(function() {
      return unlink(new_filename)
        .catch(function(err) {
          if(!/ENOENT/.test(err.message)) {
            throw err;
          }
        });
    });

    beforeEach(function() {
      return asset_editor.getCharicterSheet();
    });

    beforeEach(function() {
      new_stats = {
        values: {
          might:         16,
          constitution:  10,
          dexterity:     10,
          perception:    3,
          intellect:     18,
          resolve:       18,
        },
        offsets: {
          might:         124,
          constitution:  128,
          dexterity:     132,
          perception:    136,
          intellect:     140,
          resolve:       144,
        },
        stat_total:  75,
        base_offset: 807616,
      };

      return asset_editor.alterStats(new_stats);
    });

    afterEach(function() {
      return unlink(new_filename);
    });

    it('saves the current buffer', function() {
      return asset_editor.saveAs(new_filename)
        .then(function() {
          let new_asset_editor = new CompanionAssetEditor(new_filename);

          return new_asset_editor.getCharicterSheet();
        })
        .catch(function(err) {
          expect(err).to.not.exist;
        })
        .then(function(sheet) {
          expect(sheet).to.deep.equal(new_stats);
        });
    });
  });
});
