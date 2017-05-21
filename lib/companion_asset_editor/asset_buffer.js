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

  overwriteInt32LE(new_number, offset) {
    offset = offset || this.readOffset;

    this.moveTo(offset);

    let sub_buffer = SmartBuffer.prototype.readBuffer.call(this, 4);
    sub_buffer.writeInt32LE(new_number);

    this.moveTo(offset + 4);
  }
}

module.exports = AssetBuffer;
