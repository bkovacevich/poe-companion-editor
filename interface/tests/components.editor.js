'use strict';

const { expect } = require('chai');
const React      = require('react');

const helpers = require('./helpers');
const Editor  = require('../src/components/editor');

describe('interface.components.editor', function() {
  context('when rendered', function() {
    let rendered;

    beforeEach(function() {
      rendered = helpers.shallowRender(<Editor />);
    });

    it('sets the initial state of the store', function() {
      let state = rendered.props.store.getState();

      expect(state).to.deep.equal({
        characterSheet: {
          character_sheet: null,
          error:           null,
        },
        file: {
          file_loading:            false,
          filename:                null,
          companion_asset_editor:  null,
          error:                   null,
        },
        infoReducer: [],
      });
    });

    it('renders a character sheet, file browser, and file saver', function() {
      expect(rendered.props.children.props.children[0].props.children[0].props.children[0].type.displayName).to.equal('Connect(FileBrowser)');
      expect(rendered.props.children.props.children[0].props.children[0].props.children[1].type.displayName).to.equal('Connect(FileSaver)');

      expect(rendered.props.children.props.children[1].props.children.type.displayName).to.equal('Connect(CharicterSheet)');
      expect(rendered.props.children.props.children[2].props.children.type.displayName).to.equal('Connect(InfoWindow)');
    });

  });
});
