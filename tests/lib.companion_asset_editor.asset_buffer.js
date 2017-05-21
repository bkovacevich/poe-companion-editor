'use strict';

const expect      = require('chai').expect;
const Buffer      = require('buffer').Buffer;
const AssetBuffer = require('../lib/companion_asset_editor/asset_buffer');

describe('AssetBuffer', function() {
  let asset_buffer;
  beforeEach(function() {
    let buffer = new Buffer(new Array(8).fill(0x01));

    asset_buffer = new AssetBuffer(buffer);
    asset_buffer.moveTo(0);
  });

  describe('#align', function() {
    beforeEach(function() {
      asset_buffer.moveTo(1);
    });

    it('aligns the buffer to the nearest 32 bit word', function() {

      asset_buffer.align();

      expect(asset_buffer.readOffset).to.equal(4);
    });
  });

  describe('#readBuffer', function() {
    beforeEach(function() {
      asset_buffer.moveTo(4);
    });

    it('returns a AssetBuffer', function() {

      let buffer = asset_buffer.readBuffer(4);

      expect(buffer).to.be.an.instanceOf(AssetBuffer);
    });
  });

  describe('#overwriteInt32LE', function() {
    let new_number;
    let offset;

    function helperDumpBuffer(asset_buffer) {
      asset_buffer.moveTo(0);

      let buffer_data = [];
      while(asset_buffer.readOffset < 8) {
        let data = asset_buffer.readInt32LE();
        buffer_data.push(data);
      }

      return buffer_data;
    }

    beforeEach(function() {
      new_number = 0x0005;
      offset     = 4;
    });

    it('replaces the data at the offset', function() {
      asset_buffer.overwriteInt32LE(new_number, offset);

      let buffer_data = helperDumpBuffer(asset_buffer);

      expect(buffer_data).to.deep.equal([ 16843009, 5 ]);
    });

    it('updates the read Offset', function() {
      asset_buffer.overwriteInt32LE(new_number, offset);

      expect(asset_buffer.readOffset).to.equal(8);
    });

    it('does not alter the length of the buffer', function() {
      asset_buffer.overwriteInt32LE(new_number, offset);

      expect(asset_buffer.length).to.equal(8);
    });

    context('when there is no offset', function() {
      beforeEach(function() {
        offset = undefined;
        asset_buffer.moveTo(4);
      });

      it('uses the current position', function() {
        asset_buffer.overwriteInt32LE(new_number, offset);

        asset_buffer.moveTo(0);
        var buffer_data = [];
        while(asset_buffer.readOffset < 8) {
          let data = asset_buffer.readInt32LE();
          buffer_data.push(data);
        }

        expect(buffer_data).to.deep.equal([ 16843009, 5 ]);
      });
    });
  });
});

