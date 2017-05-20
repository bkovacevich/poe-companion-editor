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
      return Promise.resolve(this.asset_buffer);
    }

    return read(this.file_name)
      .then((buffer) => {
        this.asset_buffer = new SmartBuffer(buffer);
        return this.asset_buffer;
      });
  }

  parseHeader () {
    let header = {};

    return this.buffer()
      .then((buffer) => {

        buffer.moveTo(0);

        header.signature                = buffer.readStringNT();
        header.format_version           = buffer.readInt32BE();
        header.unity_version            = buffer.readStringNT();
        header.generator_version        = buffer.readStringNT();

        header.file_size                = buffer.readUInt32BE();
        header.header_size              = buffer.readInt32BE();
        header.file_count               = buffer.readInt32BE();
        header.bundle_count             = buffer.readInt32BE();
        header.bundle_size              = buffer.readInt32BE();
        header.uncompressed_bundle_size = buffer.readUInt32BE();
        header.compressed_file_size     = buffer.readUInt32BE();
        header.asset_header_size        = buffer.readUInt32BE();

        return header;
      });
  }

  parseAssetBundle(offset) {
    let asset = {};

    return this.buffer()
      .then((buffer) => {
        buffer.moveTo(offset);

        asset.number_of_children = buffer.readInt32BE();
        asset.name               = buffer.readStringNT();
        asset.header_size        = buffer.readUInt32BE();
        asset.size               = buffer.readUInt32BE();
        asset.data_offset        = offset + asset.header_size;

        return asset;
      });
  }

  _loadChildAsset(buffer) {
    let child_asset_data = {};

    child_asset_data.type             = buffer.readStringNT();
    child_asset_data.name             = buffer.readStringNT();
    child_asset_data.size             = buffer.readInt32LE();
    child_asset_data.index            = buffer.readInt32LE();
    child_asset_data.is_array         = buffer.readInt32LE();
    child_asset_data.version          = buffer.readInt32LE();
    child_asset_data.flags            = buffer.readInt32LE();
    child_asset_data.number_of_fields = buffer.readUInt32LE();

    child_asset_data.children   = [];

    return child_asset_data;
  }

  _loadChildTree(buffer) {
    let stack = [];
    let root  = this._loadChildAsset(buffer);

    stack.push(root);

    while(stack.length) {
      let parent = stack.pop();

      if(parent.number_of_fields === parent.children.length) {
        continue;
      }

      let child_asset = this._loadChildAsset(buffer);

      parent.children.push(child_asset);

      stack.push(parent);

      if (child_asset.number_of_fields > 0) {
        stack.push(child_asset);
      }
    }

    return root;
  }
  loadAssetTypeTree(offset) {
    this.asset_tree = {};

    return this.buffer()
      .then((buffer) => {
        let readUint = buffer.readUInt32BE.bind(buffer);
        let readInt = buffer.readInt32BE.bind(buffer);

        buffer.moveTo(offset);

        this.asset_tree.header_size = buffer.readUInt32BE();
        this.asset_tree.file_size   = buffer.readUInt32BE();
        this.asset_tree.format      = buffer.readUInt32BE();
        this.asset_tree.data_offset = buffer.readUInt32BE();
        this.asset_tree.endianess   = buffer.readUInt32BE();

        this.asset_tree.version          = buffer.readStringNT();
        this.asset_tree.platform_id      = buffer.readUInt32LE();
        this.asset_tree.number_of_fields = buffer.readUInt32LE();

        this.asset_tree.types = {};

        for(let i = 0; i < this.asset_tree.number_of_fields; i++) {
          let type_id = buffer.readInt32LE();
          this.asset_tree.types[type_id] = this._loadChildTree(buffer);
        }

        this.asset_tree.is_long_ids       = buffer.readUInt32LE();
        this.asset_tree.number_of_objects = buffer.readUInt32LE();

        this.asset_tree.object_info_offset = buffer.readOffset;

        return this.asset_tree;
      });
  }

  loadObjectMetadata(number_of_objects, metadata_offset, root_data_offset, is_long_ids) {
    return this.buffer()
      .then((buffer) => {
        this.object_metadata = {
          objects: [],
        };

        buffer.moveTo(metadata_offset);

        let helper_get_id = () => {
          if(is_long_ids) {
            return buffer.readInt64LE();
          } else {
            return buffer.readInt32LE();
          }
        }

        for(let i = 0; i < number_of_objects; i++) {
          let individual_object_metadata = {};

          individual_object_metadata.object_id = helper_get_id();

          let individual_data_offset = buffer.readUInt32LE();
          individual_object_metadata.offset     = root_data_offset + individual_data_offset;

          individual_object_metadata.size         = buffer.readUInt32LE();
          individual_object_metadata.type_id      = buffer.readInt32LE();
          individual_object_metadata.class_id     = buffer.readInt16LE();
          individual_object_metadata.is_destroyed = buffer.readInt16LE();

          this.object_metadata.objects.push(individual_object_metadata);
        }

        this.object_metadata.number_of_object_references = buffer.readUInt32LE();

        this.object_metadata.object_reference_offset = buffer.readOffset;

        this.object_metadata.object_references = [];

        for (let i = 0; i < this.object_metadata.number_of_object_references; i++) {
          let object_reference = {};

          object_reference.asset_path = buffer.readStringNT();
          let unknown                 = buffer.readString(16, 'utf8');
          object_reference.type_id    = buffer.readInt32LE();
          object_reference.file_path  = buffer.readStringNT();

          this.object_metadata.object_references.push(object_reference);
        }

        this.object_metadata.identifier = buffer.readStringNT();

        return this.object_metadata;

      });
  }
}

module.exports = CompanionAssetEditor;
