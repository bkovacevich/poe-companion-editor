'use strict';

const { expect }      = require('chai');
const React           = require('react');
const { createStore } = require('redux');

const helpers = require('./helpers');

const actions = require('../src/components/charicter_sheet/actions');

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
      charicterSheet: {
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
      expect(rendered.props.children[0].type).to.equal('thead');
      expect(rendered.props.children[1].type).to.equal('tbody');
      expect(rendered.props.children[2].type).to.equal('tfoot');

      expect(rendered.props.children[2].props.children.props.children[0].props.children).to.equal('Total');
      expect(rendered.props.children[2].props.children.props.children[1].props.children).to.equal(75);

      let stat_names  = rendered.props.children[1].props.children.map(function(child) {return child.props.children[0].props.children});
      let stat_values = rendered.props.children[1].props.children.map(function(child) {return child.props.children[1].props.children.props.value});

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

        expect(rendered.props.children[0].type).to.equal('thead');

        expect(rendered.props.children[1].type).to.equal('tbody');

        expect(rendered.props.children[2].props.children.props.children[0].props.children).to.equal('Total');
        expect(rendered.props.children[2].props.children.props.children[1].props.children).to.equal('');

        let stat_names  = rendered.props.children[1].props.children.map(function(child) {return child.props.children[0].props.children});
        let stat_values = rendered.props.children[1].props.children.map(function(child) {return child.props.children[1].props.children.props.value});

        expect(stat_names).to.deep.equal([
          'Might',
          'Constitution',
          'Dexterity',
          'Perception',
          'Intellect',
          'Resolve',
        ]);

        expect(stat_values).to.deep.equal(['', '', '', '', '', '']);
      });
    });

  });

  describe('#changeStat', function() {
    let event;
    let charicter_sheet;

    beforeEach(function() {
      event = {
        target: {
          id:        'Might-box',
          className: 'stat-box',
          value:     10,
        }
      };

      charicter_sheet = new TestCharicterSheet(store);
    });

    beforeEach(function() {
      this.sinon.spy(actions, 'changeStat');
      this.sinon.stub(charicter_sheet.props, 'dispatch').returns();
    });

    it('dispatches a change stat action', function() {

      charicter_sheet.changeStat(event);

      expect(actions.changeStat).to.have.been.calledOnce;
      expect(actions.changeStat.args[0]).to.deep.equal([
        'might',
        10,
      ]);

      expect(charicter_sheet.props.dispatch).to.have.been.calledOnce;
      expect(charicter_sheet.props.dispatch.args[0]).to.deep.equal([
        {
          type:    'CHANGE_STAT',
          payload: {
            stat:  "might",
            value: 10,
          },
        },
      ]);
    });

    context('when id is null', function() {
      beforeEach(function() {
        event.target.id = undefined;
      });

      it('does nothing', function() {
        charicter_sheet.changeStat(event);

        expect(actions.changeStat).to.not.have.been.called;
        expect(charicter_sheet.props.dispatch).to.not.have.been.called;
      });
    });
  });
});
