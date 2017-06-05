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
        charicterSheet: {
          charicter_sheet: null,
          error:           null,
        },
        loadFile: {
          file_loading:            false,
          filename:                null,
          companion_asset_editor:  null,
          error:                   null,
        },
      });
    });

    it('renders an editor div', function() {
      expect(rendered.props.children.type).to.equal("div");
      expect(rendered.props.children.props.id).to.equal("editor");
    });

    it('renders a charicter sheet', function() {
      expect(rendered.props.children.props.children[0].type.displayName).to.equal('Connect(CharicterSheet)');
    });

    it('renders a file browser', function() {
      expect(rendered.props.children.props.children[1].type.displayName).to.equal('Connect(FileBrowser)');
    });

  });
});
