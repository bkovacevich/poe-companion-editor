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

  describe('constructor', function() {
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

  describe('#load', function() {
    let expected_sheet_data;

    beforeEach(function(done) {
      return fs.readFile('./tests/data/eder_sheet_data.json', (err, file_buffer) => {
        expect(err).to.not.exist;

        expected_sheet_data = JSON.parse(file_buffer.toString());

        return done();
      });
    });

    it('gets the current charicter sheet stats', function() {
      return asset_editor.load()
        .catch(function(err) {
          expect(err).to.not.exist();
        })
        .then(function() {
          expect(asset_editor.companion_data.sheet_data).to.deep.equal(expected_sheet_data);
        });
    });
  });

  describe('#getCharicterSheet', function() {
    beforeEach(function() {
      return asset_editor.load();
    });

    it('gets the current charicter sheet stats', function() {
      let sheet = asset_editor.getCharicterSheet()

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

  describe('#alterStats', function() {
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
      return asset_editor.load();
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

  describe('#saveAs', function() {
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
      return asset_editor.load();
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
      let new_asset_editor;
      return asset_editor.saveAs(new_filename)
        .then(function() {
          new_asset_editor = new CompanionAssetEditor(new_filename);

          return new_asset_editor.load();
        })
        .catch(function(err) {
          expect(err).to.not.exist;
        })
        .then(function() {
          let sheet = new_asset_editor.getCharicterSheet();
          expect(sheet).to.deep.equal(new_stats);
        });
    });
  });
});
