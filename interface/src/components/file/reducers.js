'use strict';

let default_state = {
  file_loading:     false,
  filename:         null,
  charicter_sheet:  null,
  error:            null,
};


function loadFile(state=default_state, action) {
  switch(action.type) {
    case 'LOAD_FILE': {
      return Object.assign({}, state, {
        file_loading:  true,
        filename:      action.payload,
      });
    }

    case 'LOAD_FILE_FAILURE': {
      return Object.assign({}, state, {
        file_loading:  false,
        filename:      null,
        error:         action.payload,
      });
    }

    case 'LOAD_FILE_SUCCESS': {
      return Object.assign({}, state, {
        file_loading:  false,
        charicter_sheet: action.payload,
      });
    }
    default: {
      return state;
    }
  }
}

exports.loadFile = loadFile;
