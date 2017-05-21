'use strict';

const _       = require('lodash');
const Promise = require('bluebird');

class AssetTypeTree  {

  constructor(buffer, tree_offset) {
    this.buffer      = buffer;
    this.tree_offset = tree_offset;
  }

  searchTreeByType(search_string) {
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

  load() {
    this.type_tree = {};

    this.buffer.moveTo(this.tree_offset);

    this.type_tree.header_size = this.buffer.readUInt32BE();
    this.type_tree.file_size   = this.buffer.readUInt32BE();
    this.type_tree.format      = this.buffer.readUInt32BE();
    this.type_tree.data_offset = this.buffer.readUInt32BE();
    this.type_tree.endianess   = this.buffer.readUInt32BE();

    this.type_tree.version          = this.buffer.readStringNT();
    this.type_tree.platform_id      = this.buffer.readUInt32LE();
    this.type_tree.number_of_fields = this.buffer.readUInt32LE();

    this.type_tree.types = {};

    for(let i = 0; i < this.type_tree.number_of_fields; i++) {
      let type_id = this.buffer.readInt32LE();
      this.type_tree.types[type_id] = this._loadChildTree(this.buffer);
    }

    this.type_tree.is_long_ids       = this.buffer.readUInt32LE();
    this.type_tree.number_of_objects = this.buffer.readUInt32LE();

    this.type_tree.object_info_offset = this.buffer.readOffset;

    return this.type_tree;
  }

  getTypeTree() {
    if (this.type_tree) {
      return this.type_tree;
    }

    this.load();
    return this.type_tree;
  }

  findRootType(search_object) {
    if(!this.type_tree) {
      this.load();
    }

    let helperFindInChildren = (children) => {
      let has_matching_data = _.some(children, (child) => {

        let all_fields_match = true;

        Object.keys(search_object).forEach((field) => {
          if(child[field] !== search_object[field]) {
            all_fields_match = false;
          }
        });

        return all_fields_match;

      });


      if (has_matching_data) {
        return true;
      }

      return _.some(children, (child) => {
        return helperFindInChildren(child.children)
      });
    }

    let found_type_id;
    for (let type_id in this.type_tree.types) {
      let type = this.type_tree.types[type_id];

      if (helperFindInChildren(type.children)) {
        found_type_id = type_id;
        break;
      }
    }

    return {
      type:    this.type_tree.types[found_type_id],
      type_id: found_type_id,
    };
  }
}
module.exports = AssetTypeTree;
