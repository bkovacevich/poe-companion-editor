'use strict';

const fs      = require('fs');
const _       = require('lodash');
const Promise = require('bluebird');

const AssetBuffer   = require('./asset_buffer');
const AssetTypeTree = require('./asset_type_tree');
const ObjectInfo    = require('./object_info');

const read      = Promise.promisify(fs.readFile);
const writeFile = Promise.promisify(fs.writeFile);

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

  load() {
    return this.buffer()
      .then(() => {
        return this.parseHeader();
      })
      .then((header) => {
        this.companion_data.header = header;

        return this.parseAssetBundle(header.header_size);
      })
      .then((asset_bundle) => {

        this.companion_data.asset_bundle = asset_bundle;
        this.companion_data.asset_type_tree = new AssetTypeTree(this.asset_buffer, asset_bundle.data_offset);

        return this.companion_data.asset_type_tree.getTypeTree();
      })
      .then((type_tree) => {
        let object_data_offset = this.companion_data.asset_bundle.data_offset + type_tree.data_offset;

        this.companion_data.object_info = new ObjectInfo(
          this.asset_buffer,
          type_tree.object_info_offset,
          object_data_offset,
          type_tree.number_of_objects
        );

        return this.companion_data.object_info.loadObjectMetadata();
      })
      .then(() => {
        let search = {
          type: "CharacterDatabaseString",
          name: "DisplayName",
        };
        let sheet_data_type       = this.companion_data.asset_type_tree.findRootType(search);

        this.companion_data.sheet_data = this.companion_data.object_info.readObject(sheet_data_type);
      });
  }

  getCharicterSheet() {
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
      base_offset:  this.companion_data.sheet_data.raw_data_offset,
    };

    // hack to get the charicter's name
    let progression_root = this.companion_data.asset_type_tree.findRootType({type: 'string', name: 'ProgressionTableName'});
    let progression_data = this.companion_data.object_info.readObject(progression_root);
    sheet.charicter_name = progression_data.value.ProgressionTableName.value;

    relevant_stats.forEach((stat) => {
      sheet.values[stat.name]  = this.companion_data.sheet_data.value[stat.asset_name].value;
      sheet.offsets[stat.name] = this.companion_data.sheet_data.value[stat.asset_name].offset;
      sheet.stat_total += sheet.values[stat.name];
    });

    return sheet;
  }

  alterStat (stat, value) {
    let sheet  = this.getCharicterSheet();

    var offset = sheet.offsets[stat] + sheet.base_offset;

    this.asset_buffer.overwriteInt32LE(value, offset);
  }

  saveAs(new_filename) {
    return this.buffer()
      .then(function(buffer) {
        buffer.moveTo(0);

        return writeFile(new_filename, buffer.toBuffer(), 'binary');
      })
  }
}

module.exports = CompanionAssetEditor;
