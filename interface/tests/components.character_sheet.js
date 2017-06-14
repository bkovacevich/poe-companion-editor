'use strict';

const { expect }      = require('chai');
const React           = require('react');
const { createStore } = require('redux');

const helpers = require('./helpers');

const actions = require('../src/components/character_sheet/actions');

const { CharicterSheet, TestCharicterSheet } = require('../src/components/character_sheet');
const { renderIntoDocument, scryRenderedDOMComponentsWithClass, scryRenderedDOMComponentsWithTag, scryRenderedComponentsWithType } = require('react-dom/test-utils');

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
      character_name: 'Eder',
    };

    initial_state = {
      characterSheet: {
        character_sheet: fake_sheet,
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

    it('sets character sheet property', function() {
      expect(rendered.props.character_sheet).to.deep.equal({
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
        character_name: 'Eder',
      });
    });
  });

  context('when rendered without redux', function() {
    let rendered;


    beforeEach(function() {
      rendered = helpers.shallowRender(<TestCharicterSheet character_sheet={ fake_sheet }/>);
    });

    it('renders a table', function() {
      expect(rendered.type).to.equal('table');

      expect(rendered.props.id).to.equal('character-sheet');
      let footer      = helpers.findAllWithType(rendered, 'tfoot')[0];
      let footer_data = helpers.findAllWithType(footer, 'td');
      expect(helpers.listChildValues(footer_data)).to.deep.equal(['Total', 75]);

      let header      = helpers.findAllWithType(rendered, 'thead')[0];
      let header_data = helpers.findAllWithType(header, 'th');
      expect(helpers.listChildValues(header_data)).to.deep.equal(['Character', 'Eder']);

      let body        = helpers.findAllWithType(rendered, 'table')[0];
      let body_fields = helpers.findAllWithClass(body, 'stat-title');
      let body_values = helpers.findAllWithClass(body, 'stat-box');

      expect(helpers.listChildValues(body_fields)).to.deep.equal([
        'Might',
        'Constitution',
        'Dexterity',
        'Perception',
        'Intellect',
        'Resolve',
      ]);

      expect(helpers.listChildValues(body_values)).to.deep.equal([15,16,11,12,10,11]);
    });

    context('when there is no sheet', function() {
      beforeEach(function() {
        rendered = helpers.shallowRender(<TestCharicterSheet />);
      });

      it('renders an inactive sheet', function() {
        expect(rendered.type).to.equal('table');

        expect(rendered.props.id).to.equal('character-sheet');

        let footer      = helpers.findAllWithType(rendered, 'tfoot')[0];
        let footer_data = helpers.findAllWithType(footer, 'td');
        expect(helpers.listChildValues(footer_data)).to.deep.equal(['Total', '']);

        let header      = helpers.findAllWithType(rendered, 'thead')[0];
        let header_data = helpers.findAllWithType(header, 'th');
        expect(helpers.listChildValues(header_data)).to.deep.equal(['Character', '']);

        let body        = helpers.findAllWithType(rendered, 'table')[0];
        let body_fields = helpers.findAllWithClass(body, 'stat-title');

        expect(helpers.listChildValues(body_fields)).to.deep.equal([
          'Might',
          'Constitution',
          'Dexterity',
          'Perception',
          'Intellect',
          'Resolve',
        ]);
      });
    });

  });

  describe('#changeStat', function() {
    let event;
    let character_sheet;

    beforeEach(function() {
      event = {
        target: {
          id:        'Might-box',
          className: 'stat-box',
          value:     10,
        }
      };

      character_sheet = new TestCharicterSheet(store);
    });

    beforeEach(function() {
      this.sinon.spy(actions, 'changeStat');
      this.sinon.stub(character_sheet.props, 'dispatch').returns();
    });

    it('dispatches a change stat action', function() {

      character_sheet.changeStat(event);

      expect(actions.changeStat).to.have.been.calledOnce;
      expect(actions.changeStat.args[0]).to.deep.equal([
        'might',
        10,
      ]);

      expect(character_sheet.props.dispatch).to.have.been.calledOnce;
      expect(character_sheet.props.dispatch.args[0]).to.deep.equal([
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
        character_sheet.changeStat(event);

        expect(actions.changeStat).to.not.have.been.called;
        expect(character_sheet.props.dispatch).to.not.have.been.called;
      });
    });
  });
});
