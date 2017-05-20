'use strict';

const expect               = require('chai').expect;
const CompanionAssetEditor = require('../lib/companion_asset_editor');
const fs                   = require('fs');

describe('lib.companionAssetEditor', function() {
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
  });

  describe('#parseHeader', function() {
    it('parses the header file', function() {
      return asset_editor.parseHeader()
        .catch(function (err) {
          console.error('error:', err.message);
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
});
