'use strict';

const { expect }      = require('chai');
const React           = require('react');
const { createStore } = require('redux');

const helpers = require('./helpers');

const { CharicterSheet, TestCharicterSheet } = require('../src/components/charicter_sheet');

describe('.interface.components.CharicterSheet', function() {
  let store;
  let initial_state;
  let reducer;
  let fake_sheet;

  beforeEach(function() {
    fake_sheet  = {
      values: {
        might:         15,
        constitution:  16,
        dexterity:     11,
        perception:    12,
        intellect:     10,
        resolve:       11,
      },
      offsets: {
        might:         124,
        constitution:  128,
        dexterity:     132,
        perception:    136,
        intellect:     140,
        resolve:       144,
      },
      stat_total: 75,
      base_offset: 807616,
    };

    initial_state = {
      loadFile: {
        charicter_sheet: fake_sheet,
      },
    };

    reducer = this.sinon.stub().returns(initial_state);

    store = createStore(reducer);
  });

  context('when rendered with redux', function() {
    let rendered;

    beforeEach(function() {
      rendered = helpers.shallowRender(<CharicterSheet store={ store }/>);
    });

    it('sets charicter sheet property', function() {
      expect(rendered.props.charicter_sheet).to.deep.equal({
        values: {
          might:         15,
          constitution:  16,
          dexterity:     11,
          perception:    12,
          intellect:     10,
          resolve:       11,
        },
        offsets: {
          might:         124,
          constitution:  128,
          dexterity:     132,
          perception:    136,
          intellect:     140,
          resolve:       144,
        },
        stat_total: 75,
        base_offset: 807616,
      });
    });
  });

  context('when rendered without redux', function() {
    let rendered;

    beforeEach(function() {
      rendered = helpers.shallowRender(<TestCharicterSheet charicter_sheet={ fake_sheet }/>);
    });

    it('renders a table', function() {
      expect(rendered.type).to.equal('table');

      expect(rendered.props.id).to.equal('charicter-sheet');
      expect(rendered.props.className).to.equal('active');
      expect(rendered.props.children.type).to.equal('tbody');

      let stat_names  = rendered.props.children.props.children.map(function(child) {return child.props.children[0].props.children});
      let stat_values = rendered.props.children.props.children.map(function(child) {return child.props.children[1].props.children.props.children});;

      expect(stat_names).to.deep.equal([
        'Might',
        'Constitution',
        'Dexterity',
        'Perception',
        'Intellect',
        'Resolve',
      ]);

      expect(stat_values).to.deep.equal([15,16,11,12,10,11]);
    });

    context('when there is no sheet', function() {
      beforeEach(function() {
        rendered = helpers.shallowRender(<TestCharicterSheet />);
      });

      it('renders an inactive sheet', function() {
        expect(rendered.type).to.equal('table');

        expect(rendered.props.id).to.equal('charicter-sheet');
        expect(rendered.props.className).to.equal('in-active');

        let stat_names  = rendered.props.children.props.children.map(function(child) {return child.props.children[0].props.children});
        let stat_values = rendered.props.children.props.children.map(function(child) {return child.props.children[1].props.children.props.children});;

        expect(stat_names).to.deep.equal([
          'Might',
          'Constitution',
          'Dexterity',
          'Perception',
          'Intellect',
          'Resolve',
        ]);

        expect(stat_values).to.deep.equal([undefined, undefined, undefined, undefined, undefined, undefined]);
      });
    });
  });


});
