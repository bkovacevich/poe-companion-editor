'use strict';

const uuid = require('uuid');

const DURATION = 15 * 1000;

function dispatchAlert(store, category, type, message) {
  let id = uuid.v4();

  store.dispatch({
    type: 'INFO_WINDOW_ALERT',
    payload: {
      id:       id,
      message:  message,
      type:     type,
      category: category,
    },
  });

  setTimeout(function() {
    store.dispatch({
      type: 'INFO_WINDOW_CLEAR_ID',
      payload: {
        id: id,
      },
    });
  }, DURATION);
}

const handleError = (store) => (next) => (action) => {
  let payload = action.payload ? action.payload : {};

  if(payload.error) {
    let message = payload.error.message || payload.error;

    let error_id = uuid.v4();
    dispatchAlert(store, 'error', action.type, message);
  }

  if(payload.error === null) {
    store.dispatch({
      type: 'INFO_WINDOW_CLEAR_TYPE',
      payload: {
        type: action.type,
      },
    });
  }

  if(action.type === 'LOAD_FILE_REJECTED') {
    let message = payload.message;

    let error_id = uuid.v4();
    dispatchAlert(store, 'error', action.type, message);
  }

  if(action.type === 'SAVE_FILE_REJECTED') {
    let message = payload.message;

    let error_id = uuid.v4();
    dispatchAlert(store, 'error', action.type, message);
  }

  if(action.type === 'LOAD_FILE_FULFILLED') {
    let message = `successfully loaded ${action.payload.filename}`;

    dispatchAlert(store, 'info', action.type, message);

    store.dispatch({
      type: 'INFO_WINDOW_CLEAR_TYPE',
      payload: {
        type: 'LOAD_FILE_REJECTED',
      },
    });
  }

  if(action.type === 'SAVE_FILE_FULFILLED') {
    let message = `successfully saved ${action.payload.filename}`;

    dispatchAlert(store, 'info', action.type, message);

    store.dispatch({
      type: 'INFO_WINDOW_CLEAR_TYPE',
      payload: {
        type: 'SAVE_FILE_REJECTED',
      },
    });
  }

  return next(action);
};

module.exports = handleError;
