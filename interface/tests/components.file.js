'use strict';

const { expect }      = require('chai');
const React           = require('react');
const { createStore } = require('redux');


const helpers = require('./helpers');

const { FileBrowser, TestFileBrowser, TestFileSaver, FileSaver } = require('../src/components/file');

describe('interface.components.file', function() {
  let store;
  let initial_state;
  let reducer;

  beforeEach(function() {
    initial_state = {
      file: {
        file_loading:            false,
        filename:                'fake-filename',
        companion_asset_editor:  { fake: 'asset-editor' },
      },
    };

    reducer = this.sinon.stub().returns(initial_state);

    store = createStore(reducer);
  });

  describe('FileBrowser', function() {
    context('when rendered with redux', function() {
      let rendered;

      beforeEach(function() {
        rendered = helpers.shallowRender(<FileBrowser store={ store }/>);
      });

      it('sets file loading and filename props', function() {
        expect(rendered.props.file_loading).to.equal(false);
        expect(rendered.props.filename).to.equal('fake-filename');
      });
    });

    context('when rendered without redux', function() {
      let rendered;

      beforeEach(function() {
        rendered = helpers.shallowRender(<TestFileBrowser file_loading={ false }/>);
      });

      it('renders a button', function() {
        expect(rendered.type).to.equal('button');

        expect(rendered.props.id).to.equal('open-file');
        expect(rendered.props.className).to.equal('pure-button');
      });

      context('and the file is currently loading', function() {
        beforeEach(function() {
          rendered = helpers.shallowRender(<TestFileBrowser file_loading={ true }/>);
        });

        it('uses the inactive class', function() {
          expect(rendered.props.className).to.equal('pure-button pure-button-disabled');
        });
      });
    });
  });

  describe('FileSaver', function() {
    context('when rendered with redux', function() {
      let rendered;

      beforeEach(function() {
        rendered = helpers.shallowRender(<FileSaver store={ store }/>);
      });

      it('sets file loading, filename, and asset editor props', function() {
        expect(rendered.props.file_loading).to.equal(false);
        expect(rendered.props.filename).to.equal('fake-filename');
        expect(rendered.props.companion_asset_editor).to.deep.equal({ fake: 'asset-editor' });
      });
    });

    context('when rendered without redux', function() {
      let rendered;

      beforeEach(function() {
        rendered = helpers.shallowRender(<TestFileSaver file_loading={ false} filename={ 'fake-filename' } />);
      });

      it('renders a button', function() {
        expect(rendered.type).to.equal('button');

        expect(rendered.props.id).to.equal('save-file');
        expect(rendered.props.className).to.equal('pure-button');
      });

      context('and the file is currently loading', function() {
        beforeEach(function() {
          rendered = helpers.shallowRender(<TestFileSaver file_loading={ true } filename={ 'fake-filename' } />);
        });

        it('uses the inactive class', function() {
          expect(rendered.props.className).to.equal('pure-button pure-button-disabled');
        });
      });

      context('and the has not been loaded', function() {
        beforeEach(function() {
          rendered = helpers.shallowRender(<TestFileSaver file_loading={ false } />);
        });

        it('uses the inactive class', function() {
          expect(rendered.props.className).to.equal('pure-button pure-button-disabled');
        });
      });
    });

  });


  //TODO: Figure out how to mock showOpenDialog and test openFile
});
