'use strict';

const { expect }      = require('chai');
const React           = require('react');
const { createStore } = require('redux');


const helpers = require('./helpers');

const { FileBrowser, TestFileBrowser } = require('../src/components/file');

describe('interface.components.file', function() {
  let store;
  let initial_state;
  let reducer;

  beforeEach(function() {
    initial_state = {
      loadFile: {
        file_loading: false,
      },
    };

    reducer = this.sinon.stub().returns(initial_state);

    store = createStore(reducer);
  });

  context('when rendered with redux', function() {
    let rendered;

    beforeEach(function() {
      rendered = helpers.shallowRender(<FileBrowser store={ store }/>);
    });

    it('sets file loading on the props', function() {
      expect(rendered.props.file_loading).to.equal(false);
    });
  });

  context('when rendered without redux', function() {
    let rendered;

    beforeEach(function() {
      rendered = helpers.shallowRender(<TestFileBrowser />);
    });

    it('renders a button', function() {
      expect(rendered.type).to.equal('button');

      expect(rendered.props.id).to.equal('open-file');
      expect(rendered.props.className).to.equal('active');
    });

    context('and the file is currently loading', function() {
      beforeEach(function() {
        rendered = helpers.shallowRender(<TestFileBrowser file_loading={ true }/>);
      });

      it('uses the loading class', function() {
        expect(rendered.props.className).to.equal('loading');
      });
    });
  });

  //TODO: Figure out how to mock showOpenDialog and test openFile
});
