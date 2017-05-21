'use strict';

const fs          = require('fs');
const AssetBuffer = require('./asset_buffer');
const _           = require('lodash');
const Promise     = require('bluebird');

let read = Promise.promisify(fs.readFile);

class CompanionAssetEditor {

  constructor (file) {
    this.file_name      = file;
    this.companion_data = {};
  }

  buffer() {
    if (this.asset_buffer) {
      return Promise.resolve(this.asset_buffer);
    }

    return read(this.file_name)
      .then((buffer) => {
        this.asset_buffer = new AssetBuffer(buffer);
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

    child_asset_data.align_after_reading = Boolean(child_asset_data.flags & 0x4000);

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
    this.companion_data.asset_tree = {};

    return this.buffer()
      .then((buffer) => {
        let readUint = buffer.readUInt32BE.bind(buffer);
        let readInt = buffer.readInt32BE.bind(buffer);

        buffer.moveTo(offset);

        this.companion_data.asset_tree.header_size = buffer.readUInt32BE();
        this.companion_data.asset_tree.file_size   = buffer.readUInt32BE();
        this.companion_data.asset_tree.format      = buffer.readUInt32BE();
        this.companion_data.asset_tree.data_offset = buffer.readUInt32BE();
        this.companion_data.asset_tree.endianess   = buffer.readUInt32BE();

        this.companion_data.asset_tree.version          = buffer.readStringNT();
        this.companion_data.asset_tree.platform_id      = buffer.readUInt32LE();
        this.companion_data.asset_tree.number_of_fields = buffer.readUInt32LE();

        this.companion_data.asset_tree.types = {};

        for(let i = 0; i < this.companion_data.asset_tree.number_of_fields; i++) {
          let type_id = buffer.readInt32LE();
          this.companion_data.asset_tree.types[type_id] = this._loadChildTree(buffer);
        }

        this.companion_data.asset_tree.is_long_ids       = buffer.readUInt32LE();
        this.companion_data.asset_tree.number_of_objects = buffer.readUInt32LE();

        this.companion_data.asset_tree.object_info_offset = buffer.readOffset;

        return this.companion_data.asset_tree;
      });
  }

  loadObjectMetadata(number_of_objects, metadata_offset, root_data_offset, is_long_ids) {
    return this.buffer()
      .then((buffer) => {
        this.companion_data.object_metadata = {
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

          individual_object_metadata.individual_data_offset = buffer.readUInt32LE();
          individual_object_metadata.offset     = root_data_offset + individual_object_metadata.individual_data_offset;

          individual_object_metadata.size         = buffer.readUInt32LE();
          individual_object_metadata.type_id      = buffer.readInt32LE();
          individual_object_metadata.class_id     = buffer.readInt16LE();
          individual_object_metadata.is_destroyed = buffer.readInt16LE();

          this.companion_data.object_metadata.objects.push(individual_object_metadata);
        }

        this.companion_data.object_metadata.number_of_object_references = buffer.readUInt32LE();

        this.companion_data.object_metadata.object_reference_offset = buffer.readOffset;

        this.companion_data.object_metadata.object_references = [];

        for (let i = 0; i < this.companion_data.object_metadata.number_of_object_references; i++) {
          let object_reference = {};

          object_reference.asset_path = buffer.readStringNT();
          let unknown                 = buffer.readString(16, 'utf8');
          object_reference.type_id    = buffer.readInt32LE();
          object_reference.file_path  = buffer.readStringNT();

          this.companion_data.object_metadata.object_references.push(object_reference);
        }

        this.companion_data.object_metadata.identifier = buffer.readStringNT();

        return this.companion_data.object_metadata;

      });
  }

  _readType(buffer, type) {
    let value;
    let offset = buffer.readOffset;

    switch(type.type) {
      case "bool":
        value = buffer.readInt8();
        break;
      case "SInt8":
        value = buffer.readInt8();
        break;
      case "UInt8":
        value = buffer.readUInt8();
        break;
      case "SInt16":
        value = buffer.readInt16LE();
        break;
      case "UInt16":
        value = buffer.readUInt16LE();
        break;
      case "SInt64":
        value = buffer.readInt64LE();
        break;
      case "UInt64":
        value = buffer.readUInt64LE();
        break;
      case 'UInt32':
      case "unsigned int":
        value = buffer.readUInt32LE();
        break;
      case "SInt32":
      case "int":
        value = buffer.readInt32LE();
        break;
      case "float":
        value = buffer.readFloatLE();
        break;
      case "string":
        let size = buffer.readInt32LE();
        value = buffer.readString(size);
        break;
      case "Array":
        value = [];

        type.children.forEach((sub_type) => {
          let item = this._readType(buffer, sub_type);
          value.push(item);
        });
      default:
        value = {};

        if(!type.children) {
          console.error('invalid type:', JSON.stringify(type, null, 2));
          throw new Error('Invalid type!');
        }

        type.children.forEach((sub_type) => {
          let item_name  = sub_type.name;

          let item_value = this._readType(buffer, sub_type);

          value[item_name] = item_value;
        });

        break;
    }

    if (type.align_after_reading) {
      buffer.align();
    }

    return {
      value:   value,
      offset:  offset,
    };
  }

  readObject(object_metadata, type) {
    return this.buffer()
      .then((buffer) => {
        buffer.moveTo(object_metadata.offset);

        var object_buffer = buffer.readBuffer(type.size);
        return this._readType(object_buffer, type.sheet_type);
      });
  }

  findCharicterSheetType(asset_tree) {
    let helper_is_sheet_type = (children) => {

      let has_charicter_sheet = _.some(children, (child) => {
        return child.type === 'CharacterDatabaseString';
      });


      if (has_charicter_sheet) {
        return true;
      }

      return _.some(children, (child) => {
        return helper_is_sheet_type(child.children)
      });
    }

    let sheet_type_id;
    for (let type_id in asset_tree.types) {
      let type = asset_tree.types[type_id];

      if (helper_is_sheet_type(type.children)) {
        sheet_type_id = type_id;
        break;
      }
    }

    return {
      sheet_type: asset_tree.types[sheet_type_id],
      type_id:    sheet_type_id,
    };
  }

  findCharicterSheetObjectMetadata (type_id, object_metadata) {
    return _.find(object_metadata.objects, (object) => {
      return (object.type_id == type_id);
    });
  }
}

module.exports = CompanionAssetEditor;
