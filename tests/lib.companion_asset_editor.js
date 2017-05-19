'use strict';

const expect = require('chai').expect;
const CompanionAssetEditor = require('../lib/companion_asset_editor');

describe('lib.companionAssetEditor', function() {

  describe('#parseHeader', function() {
    let companion_file_name;
    let asset_editor;

    beforeEach(function() {
      companion_file_name = 'tests/data/companion_eder.unity3d';
      asset_editor = new CompanionAssetEditor(companion_file_name);
    });

    it('parses the header file', function() {
      return asset_editor.parseHeader()
        .catch(function (err) {
          console.error('error:', err.message);
          expect(err).to.not.exist;
        })
        .then(function(header) {
          expect(header).to.deep.equal({
            signature: 'UnityRaw',
            format_version: 3,
            unity_version: '3.x.x',
            generator_version: '4.7.0f1',
            file_size: 816036,
            header_size: 60,
            file_count: 1,
            bundle_count: 1,
            uncompressed_bundle_size: 815976,
            bundle_size: 815976,
            compressed_file_size: 816036,
            asset_header_size: 52,
            identifier: 'CAB-1e289d4e73b9aa94a91e38b848e98389',
          });
        });
    });
  });
});
