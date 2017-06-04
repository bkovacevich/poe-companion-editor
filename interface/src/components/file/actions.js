'use strict';

exports.loadFile  = function(filename) {
  return {
    type: 'LOAD_FILE',
    payload: filename,
  };
};

exports.loadFileSuccess = function(sheet) {
  return {
    type: 'LOAD_FILE_SUCCESS',
    payload: sheet,
  };
};

exports.loadFileFailure = function(err) {
  return {
    type: 'LOAD_FILE_FAILURE',
    payload: err,
  };
};
