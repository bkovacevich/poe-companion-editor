'use strict';

const { expect }      = require('chai');
const React           = require('react');
const { createStore } = require('redux');

const helpers = require('./helpers');

const { InfoWindow, TestInfoWindow } = require('../src/components/info_window');

describe('InfoWindow', function() {
  let store;
  let initial_state;
  let reducer;

  beforeEach(function() {
    initial_state = [
      {
        message: 'fake-error',
        category: 'error',
      },
      {
        message: 'fake-info',
        category: 'info',
      },
    ];


    reducer = this.sinon.stub().returns({
      infoReducer: initial_state,
    });

    store = createStore(reducer);
  });


  context('when rendered with redux', function() {
    let rendered;

    beforeEach(function() {
      rendered = helpers.shallowRender(<InfoWindow store={ store }/>);
    });

    it('sets messages props', function() {
      expect(rendered.props.alerts).to.deep.equal([
        {
          message: 'fake-error',
          category: 'error',
        },
        {
          message: 'fake-info',
          category: 'info',
        },
      ]);
    });
  });

  context('when rendered without redux', function() {
    let rendered;

    beforeEach(function() {
      rendered = helpers.shallowRender(<TestInfoWindow alerts={ [] } />);
    });

    it('renders a text box', function() {
      let textarea = helpers.findAllWithType(rendered, 'div');
      expect(textarea).to.have.length(1);

      expect(textarea[0].props.id).to.equal('info-window');
    });

    context('and there are messages', function() {
      beforeEach(function() {
        rendered = helpers.shallowRender(<TestInfoWindow alerts={ initial_state }/>);
      });

      it('renders paragraphs', function() {
        let paragraphs = helpers.findAllWithType(rendered, 'p');
        expect(paragraphs[0].props.className).to.equal('error');
        expect(paragraphs[1].props.className).to.equal('info');
      });
    });
  });
});
