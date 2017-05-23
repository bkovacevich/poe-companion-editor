'use strict';

const fs      = require('fs');
const _       = require('lodash');
const Promise = require('bluebird');

const AssetBuffer   = require('./asset_buffer');
const AssetTypeTree = require('./asset_type_tree');

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

  loadObjectInfo(number_of_objects, metadata_offset, root_data_offset, is_long_ids) {
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
          throw new Error('Invalid type: ', JSON.stringify(type, null, 2));
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
        return this._readType(object_buffer, type.type);
      });
  }

  findCharicterSheetObjectInfo (type_id, object_metadata) {
    return _.find(object_metadata.objects, (object) => {
      return (object.type_id == type_id);
    });
  }

  loadAssetTypeTree(offset) {
    this.companion_data.asset_tree = {};

    return this.buffer()
      .then((buffer) => {
        this.companion_data.asset_type_tree = new AssetTypeTree(buffer, offset);

        return this.companion_data.asset_type_tree.getTypeTree();
      });
  }

  findCharicterSheetType(offset) {
    let search = {
      type: "CharacterDatabaseString",
      name: "DisplayName",
    }

    if (this.companion_data.asset_type_tree) {
      return Promise.resolve(this.companion_data.asset_type_tree.findRootType(search));
    }

    return this.loadAssetTypeTree(offset)
      .then(() => {
        return Promise.resolve(this.companion_data.asset_type_tree.findRootType(search));
      });
  }

  getCharicterSheet() {
    let objects;
    let asset_bundle_offset;
    let object_data_offset;
    let type;
    let type_id;
    let raw_data_offset;

    return this.parseHeader()
      .then((header) => {
        let header_size = header.header_size;

        return this.parseAssetBundle(header_size);
      })
      .then((asset_bundle) => {
        asset_bundle_offset = asset_bundle.data_offset;

        return this.loadAssetTypeTree(asset_bundle_offset);
      })
      .then((type_tree) => {
        object_data_offset     = type_tree.data_offset + asset_bundle_offset;

        let number_of_objects  = type_tree.number_of_objects;
        let object_info_offset = type_tree.object_info_offset;
        let is_long_ids        = Boolean(type_tree.is_long_ids);

        return this.loadObjectInfo(number_of_objects, object_info_offset, object_data_offset, is_long_ids);
      })
      .then((object_info) => {
        return this.findCharicterSheetType(asset_bundle_offset)
          .then((result) => {
            type    = result;
            type_id = type.type_id;

            return this.findCharicterSheetObjectInfo(type_id, object_info);
          });
      })
      .then((charicter_sheet_info) => {
        raw_data_offset = charicter_sheet_info.offset;
        return this.readObject(charicter_sheet_info, type);
      })
      .then((sheet_data) => {
        var relevant_stats = [
          {
            name:        'might',
            asset_name:  'BaseMight',
          },
          {
            name:        'constitution',
            asset_name:  'BaseConstitution',
          },
          {
            name:        'dexterity',
            asset_name:  'BaseDexterity',
          },
          {
            name:        'perception',
            asset_name:  'BasePerception',
          },
          {
            name:        'intellect',
            asset_name:  'BaseIntellect',
          },
          {
            name:        'resolve',
            asset_name:  'BaseResolve',
          },
        ];

        var sheet = {
          values:       {},
          offsets:      {},
          stat_total:   0,
          base_offset:  raw_data_offset,
        };

        relevant_stats.forEach((stat) => {
          sheet.values[stat.name]  = sheet_data.value[stat.asset_name].value;
          sheet.offsets[stat.name] = sheet_data.value[stat.asset_name].offset;
          sheet.stat_total += sheet.values[stat.name];
        });

        return sheet;
      });
  }

  alterStats (new_sheet) {
    return this.buffer()
      .then((buffer) => {
        for (let stat in new_sheet.values) {
          var new_value = new_sheet.values[stat];
          var offset    = new_sheet.offsets[stat] + new_sheet.base_offset;

          buffer.overwriteInt32LE(new_value, offset);
        }
      });
  }
}

module.exports = CompanionAssetEditor;
