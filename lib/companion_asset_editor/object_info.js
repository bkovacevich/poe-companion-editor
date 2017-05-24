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

}

module.exports = ObjectInfo;
