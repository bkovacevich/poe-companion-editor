'use strict';

const expect      = require('chai').expect;
const Buffer      = require('buffer').Buffer;
const AssetBuffer = require('../lib/asset_buffer');

describe('AssetBuffer', function() {
  let asset_buffer;
  beforeEach(function() {
    let buffer = new Buffer(new Array(8).fill(0x01));

    asset_buffer = new AssetBuffer(buffer);
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
});

