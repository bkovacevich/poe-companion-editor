'use strict';

const Promise = require('bluebird');

class ObjectInfo {
  constructor(buffer, metadata_offset, data_offset, number_of_objects, is_long_ids) {
    this.buffer = buffer;

    this.metadata_offset = metadata_offset;
    this.data_offset     = data_offset;

    this.number_of_objects = number_of_objects;

    this.is_long_ids = is_long_ids ? true : false;
  }

  loadObjectMetadata() {
    this.object_metadata = {
      objects: [],
    };

    this.buffer.moveTo(this.metadata_offset);

    let helper_get_id = () => {
      if(this.is_long_ids) {
        return this.buffer.readInt64LE();
      } else {
        return this.buffer.readInt32LE();
      }
    }

    for(let i = 0; i < this.number_of_objects; i++) {
      let individual_object_metadata = {};

      individual_object_metadata.object_id = helper_get_id();

      individual_object_metadata.individual_data_offset = this.buffer.readUInt32LE();
      individual_object_metadata.offset     = this.data_offset + individual_object_metadata.individual_data_offset;

      individual_object_metadata.size         = this.buffer.readUInt32LE();
      individual_object_metadata.type_id      = this.buffer.readInt32LE();
      individual_object_metadata.class_id     = this.buffer.readInt16LE();
      individual_object_metadata.is_destroyed = this.buffer.readInt16LE();

      this.object_metadata.objects.push(individual_object_metadata);
    }

    this.object_metadata.number_of_object_references = this.buffer.readUInt32LE();

    this.object_metadata.object_reference_offset = this.buffer.readOffset;

    this.object_metadata.object_references = [];

    for (let i = 0; i < this.object_metadata.number_of_object_references; i++) {
      let object_reference = {};

      object_reference.asset_path = this.buffer.readStringNT();
      let unknown                 = this.buffer.readString(16, 'ascii');
      object_reference.type_id    = this.buffer.readInt32LE();
      object_reference.file_path  = this.buffer.readStringNT();

      this.object_metadata.object_references.push(object_reference);
    }

    this.object_metadata.identifier = this.buffer.readStringNT();
  }

  static readType(buffer, type) {
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
          let item = this.readType(buffer, sub_type);
          value.push(item);
        });

        break;
      default:
        value = {};

        if(!type.children) {
          throw new Error('Invalid type: ' + JSON.stringify(type, null, 2));
        }

        type.children.forEach((sub_type) => {
          let item_name  = sub_type.name;

          let item_value = this.readType(buffer, sub_type);

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


}

module.exports = ObjectInfo;
