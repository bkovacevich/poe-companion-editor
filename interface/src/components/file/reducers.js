'use strict';

let default_state = {
  file_loading:             false,
  filename:                 null,
  companion_asset_editor:   null,
  error:                    null,
};


function file(state=default_state, action) {
  switch(action.type) {
    case 'LOAD_FILE_PENDING':
    case 'SAVE_FILE_PENDING': {
      return Object.assign({}, state, {
        file_loading:  true,
        filename:      null,
      });
    }

    case 'LOAD_FILE_REJECTED':
    case 'SAVE_FILE_REJECTED': {
      return Object.assign({}, state, {
        file_loading:  false,
        error:         action.payload,
      });
    }

    case 'SAVE_FILE_FULFILLED':
    case 'LOAD_FILE_FULFILLED': {
      let { companion_asset_editor, filename } = action.payload;

      return Object.assign({}, state, {
        file_loading:             false,
        filename:                 filename,
        companion_asset_editor:   companion_asset_editor,
        error:                    null,
      });
    }

    case 'CHANGE_STAT': {
      let { stat, value } = action.payload;

      //TODO: Think about moving this into middleware
      state.companion_asset_editor.alterStat(stat, value);

      return state;
    }

    default: {
      return state;
    }
  }
}

exports.file = file;
