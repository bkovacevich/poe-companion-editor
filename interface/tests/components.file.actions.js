'use strict';

const { expect } = require('chai');

const file_actions = require('../src/components/file/actions');

const charicter_editor = require('../../lib/companion_asset_editor');

describe('.interface.components.file.actions', function() {
  beforeEach(function() {
    this.sinon.stub(charicter_editor.prototype, 'load').resolves();
    this.sinon.stub(charicter_editor.prototype, 'getCharicterSheet').returns({ fake: 'sheet' });
  });

  describe('.loadFile', function() {
    it('returns a LOAD_FILE action with a promise', function() {
      let filename = 'fake_filename';

      let action = file_actions.loadFile(filename);

      expect(charicter_editor.prototype.load).to.have.been.calledOnce;
      expect(charicter_editor.prototype.load.thisValues[0].file_name).to.equal('fake_filename');

      expect(action.type).to.equal('LOAD_FILE');

      return action.payload
        .catch(function(err) {
          expect(err).to.not.exist();
        })
        .then(function({ sheet, filename }) {
          expect(filename).to.equal('fake_filename');
          expect(sheet).to.deep.equal({ fake: 'sheet' });
        });
    });
  });
});
