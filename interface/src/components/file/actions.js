'use strict';

const CompanionAssetEditor = require('../../../../lib/companion_asset_editor');

exports.loadFile  = function(filename) {
  let companion_asset_editor = new CompanionAssetEditor(filename);

  let payload = companion_asset_editor.load()
    .then(() => {
      let sheet = companion_asset_editor.getCharicterSheet();

      return { sheet, companion_asset_editor, filename };
    });

  return {
    type: 'LOAD_FILE',
    payload: payload,
  };
};

exports.saveFile  = function(filename, companion_asset_editor) {
  let payload = companion_asset_editor.saveAs(filename)
    .then(() => {
      return companion_asset_editor.load();
    })
    .then(() => {
      let sheet = companion_asset_editor.getCharicterSheet();

      return { sheet, companion_asset_editor, filename };
    });

  return {
    type: 'SAVE_FILE',
    payload: payload,
  };
};
