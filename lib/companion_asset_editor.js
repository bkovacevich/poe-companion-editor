'use strict';

const Promise     = require('bluebird');
const fs          = require('fs');
const SmartBuffer = require('smart-buffer').SmartBuffer;

let read = Promise.promisify(fs.readFile);

class CompanionAssetEditor {

  constructor (file) {
    this.file_name = file;
  }

  buffer() {
    if (this.asset_buffer) {
      this.asset_buffer.moveTo(0);

      return Promise.resolve(this.asset_buffer);
    }

    return read(this.file_name)
      .then((buffer) => {
        console.log('read');
        this.asset_buffer = new SmartBuffer(buffer);
        return this.asset_buffer;
      });
  }

  parseHeader () {
    let header = {};

    return this.buffer()
      .then((buffer) => {

        header.signature = buffer.readStringNT();
        header.format_version = buffer.readInt32BE();
        header.unity_version = buffer.readStringNT();
        header.generator_version = buffer.readStringNT();

        header.file_size = buffer.readUInt32BE();
        header.header_size = buffer.readInt32BE();
        header.file_count = buffer.readInt32BE();
        header.bundle_count = buffer.readInt32BE();
        header.bundle_size = buffer.readInt32BE();
        header.uncompressed_bundle_size = buffer.readUInt32BE();
        header.compressed_file_size = buffer.readUInt32BE();
        header.asset_header_size = buffer.readUInt32BE();

        buffer.skip(5);

        header.identifier = buffer.readStringNT();

        return header;
      });
  }

}

module.exports = CompanionAssetEditor;
