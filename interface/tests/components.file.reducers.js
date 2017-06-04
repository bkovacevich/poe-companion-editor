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
        filename:        'fake-filename',
        charicter_sheet: null,
        error:           null,
      };
    });

    context('on a LOAD_FILE_PENDING event', function() {
      beforeEach(function() {
        action = {
          type:    'LOAD_FILE_PENDING',
          payload: 'fake_payload',
        };
      });

      it('sets the state for filename and file_loading', function() {
        let new_state = file_reducers.loadFile(state, action);

        expect(new_state).to.deep.equal({
          filename:        null,
          file_loading:    true,
          charicter_sheet: null,
          error:           null,
        });
      });
    });

    context('on a LOAD_FILE_REJECTED event', function() {
      beforeEach(function() {
        state.file_loading = true;
        state.filename     = null,

        action = {
          type:    'LOAD_FILE_REJECTED',
          payload: 'fake_error',
        };
      });

      it('sets the state for file_loading and error', function() {
        let new_state = file_reducers.loadFile(state, action);

        expect(new_state).to.deep.equal({
          filename:        null,
          file_loading:    false,
          charicter_sheet: null,
          error:           'fake_error',
        });
      });
    });

    context('on a LOAD_FILE_FULFILLED event', function() {
      beforeEach(function() {
        state.filename     = null;
        state.file_loading = true;
        state.error        = 'fake-error';

        let sheet = { fake: 'sheet' };
        let filename = 'new_fake_filename';

        action = {
          type:    'LOAD_FILE_FULFILLED',
          payload: { sheet, filename },
        };
      });

      it('sets the state for filename, file_loading and charicter_sheet', function() {
        let new_state = file_reducers.loadFile(state, action);

        expect(new_state).to.deep.equal({
          filename:        'new_fake_filename',
          file_loading:    false,
          charicter_sheet: { fake: 'sheet' },
          error:           null,
        });
      });
    });
  });
});
