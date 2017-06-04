'use strict';

let default_state = {
  file_loading:     false,
  filename:         null,
  charicter_sheet:  null,
  error:            null,
};


function loadFile(state=default_state, action) {
  switch(action.type) {
    case 'LOAD_FILE_PENDING': {
      return Object.assign({}, state, {
        file_loading:  true,
        filename:      null,
      });
    }

    case 'LOAD_FILE_REJECTED': {
      return Object.assign({}, state, {
        file_loading:  false,
        error:         action.payload,
      });
    }

    case 'LOAD_FILE_FULFILLED': {
      let { sheet, filename } = action.payload;

      return Object.assign({}, state, {
        file_loading:    false,
        filename:        filename,
        charicter_sheet: sheet,
        error:           null,
      });
    }
    default: {
      return state;
    }
  }
}

exports.loadFile = loadFile;
