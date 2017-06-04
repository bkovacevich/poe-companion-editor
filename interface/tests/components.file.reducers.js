'use strict';

const { expect } = require('chai');

const file_reducers = require('../src/components/file/reducers');

describe('interface.components.file.reducers', function() {
  describe('.loadFile', function() {
    let state;
    let action;

    beforeEach(function() {
      state = {
        file_loading:    false,
        filename:        null,
        charicter_sheet: null,
        error:           null,
      };
    });

    context('on a LOAD_FILE event', function() {
      beforeEach(function() {
        action = {
          type:    'LOAD_FILE',
          payload: 'fake_filename',
        };
      });

      it('sets the state for filename and file_loading on LOAD_FILE', function() {
        let new_state = file_reducers.loadFile(state, action);

        expect(new_state).to.deep.equal({
          filename:        'fake_filename',
          file_loading:    true,
          charicter_sheet: null,
          error:           null,
        });
      });
    });

    context('on a LOAD_FILE_FAILURE event', function() {
      beforeEach(function() {
        state.filename     = 'fake_filename';
        state.file_loading = true;

        action = {
          type:    'LOAD_FILE_FAILURE',
          payload: 'fake_error',
        };
      });

      it('sets the state for filename and file_loading on LOAD_FILE', function() {
        let new_state = file_reducers.loadFile(state, action);

        expect(new_state).to.deep.equal({
          filename:        null,
          file_loading:    false,
          charicter_sheet: null,
          error:           'fake_error',
        });
      });
    });

    context('on a LOAD_FILE_SUCCESS event', function() {
      beforeEach(function() {
        state.filename     = 'fake_filename';
        state.file_loading = true;

        action = {
          type:    'LOAD_FILE_SUCCESS',
          payload: { fake: 'sheet' },
        };
      });

      it('sets the state for filename and file_loading on LOAD_FILE', function() {
        let new_state = file_reducers.loadFile(state, action);

        expect(new_state).to.deep.equal({
          filename:        'fake_filename',
          file_loading:    false,
          charicter_sheet: { fake: 'sheet' },
          error:           null,
        });
      });
    });
  });
});
