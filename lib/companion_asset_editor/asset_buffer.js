'use strict';

const SmartBuffer = require('smart-buffer').SmartBuffer;

class AssetBuffer extends SmartBuffer {
  align () {
    let offset = this.readOffset;

    let bytes_left = offset % 4;

    this.moveTo(offset + (4 - bytes_left));
  }

  readBuffer(bytes) {
    var buffer = SmartBuffer.prototype.readBuffer.call(this, bytes);

    return new AssetBuffer(buffer);
  }
}

module.exports = AssetBuffer;
