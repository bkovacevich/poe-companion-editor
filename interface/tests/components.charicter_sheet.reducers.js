'use strict';

const { expect } = require('chai');

const charicter_sheet_reducer = require('../src/components/charicter_sheet/reducers');

describe('interface.components.charicter_sheet.reducer', function() {
  let action;
  let state;

  context('on a LOAD_FILE_FULFILLED event', function() {
    let sheet;
    let filename;

    beforeEach(function() {
      sheet = { fake: 'sheet' };

      filename = 'fake-filename';

      action = {
        type:    'LOAD_FILE_FULFILLED',
        payload: { sheet, filename },
      };
    });

    it('sets the charicter_sheet', function() {
      let new_state = charicter_sheet_reducer.charicterSheet(state, action);

      expect(new_state).to.deep.equal({
        charicter_sheet: { fake: 'sheet' },
        error:           null,
      });
    });
  });

  context('on a CHANGE_STAT event', function() {
    let sheet;

    beforeEach(function() {
      sheet = {
        values: {
          might:         15,
          constitution:  16,
          dexterity:     11,
          perception:    12,
          intellect:     10,
          resolve:       11,
        },
        stat_total: 75,
      };

      state = {
        error: null,
        charicter_sheet: sheet,
      }

      action = {
        type: 'CHANGE_STAT',
        payload: {
          stat:  'might',
          value: 18,
        },
      };
    });

    it('updates the stat and total', function() {
      let new_state = charicter_sheet_reducer.charicterSheet(state, action);

      expect(new_state).to.deep.equal({
        charicter_sheet: {
          values: {
            might:         18,
            constitution:  16,
            dexterity:     11,
            perception:    12,
            intellect:     10,
            resolve:       11,
          },
          stat_total: 78,
        },
        error: null,
      });
    });

    context('when value is empty', function() {
      beforeEach(function() {
        action.payload.value = '';
      });

      it('treats it as a zero', function() {
        let new_state = charicter_sheet_reducer.charicterSheet(state, action);

        expect(new_state).to.deep.equal({
          charicter_sheet: {
            values: {
              might:         '',
              constitution:  16,
              dexterity:     11,
              perception:    12,
              intellect:     10,
              resolve:       11,
            },
            stat_total: 60,
          },
          error: null,
        });
      });
    });
  });

  context('on a CHANGE_STAT_FAILURE event', function() {
    beforeEach(function() {
      state = {
        error: null,
        charicter_sheet: { fake: 'sheet' },
      };

      action = {
        type:    'CHANGE_STAT_FAILURE',
        payload: new Error('Fake Error'),
      };
    });

    it('sets the error in the state', function() {
      let new_state = charicter_sheet_reducer.charicterSheet(state, action);

      expect(new_state).to.deep.equal({
        charicter_sheet: { fake: 'sheet' },
        error:           new Error('Fake Error'),
      });
    });
  });
});
