'use strict';

const CompanionAssetEditor = require('../../../../lib/companion_asset_editor');

exports.loadFile  = function(filename) {
  let editor = new CompanionAssetEditor(filename);

  let payload = editor.load()
    .then(() => {
      let sheet = editor.getCharicterSheet();

      return { sheet, filename };
    });

  return {
    type: 'LOAD_FILE',
    payload: payload,
  };
};
