'use strict';

const _ = require('lodash');

const initial_state = [];

exports.infoReducer = function infoReducer(state=initial_state, action) {

  switch(action.type) {
    case 'INFO_WINDOW_ALERT': {
      let new_state = [...state];

      if (new_state.length && new_state[0].message === action.payload.message) {
        new_state[0].id = action.payload.id;
      } else {
        new_state.push(action.payload);
      }

      return new_state;
    }

    case 'INFO_WINDOW_CLEAR_TYPE': {
      let type_to_remove = action.payload.type;

      return _.filter(state, function(message) {
        return (message.type !== type_to_remove);
      });
    }

    case 'INFO_WINDOW_CLEAR_ID': {
      let id_to_remove = action.payload.id;

      return _.filter(state, function(message) {
        return (message.id !== id_to_remove);
      });
    }

    default:
      return state;
  }
};
