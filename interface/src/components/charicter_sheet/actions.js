'use strick';

const MAX_32_BIT_INT = 2147483647;

exports.changeStat = function(stat, value) {
  if (value && isNaN(Number(value)) ) {
    return {
      type: 'CHANGE_STAT_FAILURE',
      payload: new Error(`Value for stat "${stat}" is not a number: ${value}`),
    }
  }

  if (value) {
    value = Number(value);
  }

  if (Math.abs(value) > MAX_32_BIT_INT) {
    return {
      type: 'CHANGE_STAT_FAILURE',
      payload: new Error(`Value must be able to fit in a signed 32 bit intiger (max size of ${MAX_32_BIT_INT})`),
    }
  }

  return {
    type: 'CHANGE_STAT',
    payload: { stat, value },
  };
}
