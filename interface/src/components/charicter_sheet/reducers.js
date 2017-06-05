'use strict';

const _ = require('lodash');

const initial_state = {
  charicter_sheet: null,
  error:           null,
};

function charicterSheet(state=initial_state, action) {
  switch (action.type) {
    case 'LOAD_FILE_FULFILLED': {
      return Object.assign({}, state, {
        charicter_sheet: action.payload.sheet,
      });
    }

    case 'CHANGE_STAT': {
      let { stat, value } = action.payload;

      let next_state = _.cloneDeep(state);

      let new_total = state.charicter_sheet.stat_total - state.charicter_sheet.values[stat] + (value || 0);

      next_state.charicter_sheet.values[stat] = value;
      next_state.charicter_sheet.stat_total   = new_total;

      return Object.assign({}, state, next_state);
    }

    case 'CHANGE_STAT_FAILURE': {
      return Object.assign({}, state, {
        error: action.payload,
      });
    }
  }

  return state;
}

exports.charicterSheet = charicterSheet;
