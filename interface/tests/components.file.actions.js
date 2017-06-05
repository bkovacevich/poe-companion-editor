'use strict';

const { expect } = require('chai');

const file_actions = require('../src/components/file/actions');

const CompanionAssetEditor = require('../../lib/companion_asset_editor');

describe('.interface.components.file.actions', function() {
  beforeEach(function() {
    this.sinon.stub(CompanionAssetEditor.prototype, 'load').resolves();
    this.sinon.stub(CompanionAssetEditor.prototype, 'getCharicterSheet').returns({ fake: 'sheet' });
  });

  describe('.loadFile', function() {
    it('returns a LOAD_FILE action with a promise', function() {
      let filename = 'fake_filename';

      let action = file_actions.loadFile(filename);

      expect(CompanionAssetEditor.prototype.load).to.have.been.calledOnce;
      expect(CompanionAssetEditor.prototype.load.thisValues[0].file_name).to.equal('fake_filename');

      expect(action.type).to.equal('LOAD_FILE');

      return action.payload
        .catch(function(err) {
          expect(err).to.not.exist();
        })
        .then(function({ sheet, companion_asset_editor, filename }) {
          expect(filename).to.equal('fake_filename');
          expect(companion_asset_editor).to.be.an.instanceOf(CompanionAssetEditor);
          expect(sheet).to.deep.equal({ fake: 'sheet' });
        });
    });
  });

  describe('.saveFile', function() {
    let companion_asset_editor;

    beforeEach(function() {
      companion_asset_editor = {
        load:               this.sinon.stub().resolves({}),
        saveAs:             this.sinon.stub().resolves({}),
        getCharicterSheet:  this.sinon.stub().returns({ fake:  'sheet' }),
      };
    });

    it('returns a SAVE_FILE action with a promise', function() {
      let filename = 'fake_filename';

      let action = file_actions.saveFile(filename, companion_asset_editor);

      expect(companion_asset_editor.saveAs).to.have.been.calledOnce;
      expect(companion_asset_editor.saveAs.args[0][0]).to.equal('fake_filename');

      expect(action.type).to.equal('SAVE_FILE');

      return action.payload
        .catch(function(err) {
          expect(err).to.not.exist();
        })
        .then(function({ sheet, companion_asset_editor, filename }) {
          expect(companion_asset_editor.load).to.have.been.calledOnce;

          expect(filename).to.equal('fake_filename');
          expect(sheet).to.deep.equal({ fake: 'sheet' });
        });
    });
  });
});
