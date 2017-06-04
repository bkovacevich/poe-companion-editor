'use strict';

const { expect } = require('chai');

const file_actions = require('../src/components/file/actions');

describe('.interface.components.file.actions', function() {
  describe('.loadFile', function() {
    it('returns a LOAD_FILE action', function() {
      let filename = 'fake_filename';

      let action = file_actions.loadFile(filename);

      expect(action).to.deep.equal({
        type:    'LOAD_FILE',
        payload: 'fake_filename',
      });
    });
  });

  describe('.loadFileSuccess', function() {
    it('returns a LOAD_FILE_SUCCESS action', function() {
      let sheet = { fake: 'sheet' };

      let action = file_actions.loadFileSuccess(sheet);

      expect(action).to.deep.equal({
        type:    'LOAD_FILE_SUCCESS',
        payload: { fake: 'sheet' },
      });
    });
  });

  describe('.loadFileSuccess', function() {
    it('returns a LOAD_FILE_SUCCESS action', function() {
      let err = 'fake_error';

      let action = file_actions.loadFileFailure(err);

      expect(action).to.deep.equal({
        type:    'LOAD_FILE_FAILURE',
        payload: 'fake_error',
      });
    });
  });
});
