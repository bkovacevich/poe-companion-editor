'use strict';

const { expect }      = require('chai');
const React           = require('react');
const { createStore } = require('redux');

const helpers = require('./helpers');

const actions = require('../src/components/charicter_sheet/actions');

const MAX_32_BIT_INT = 2147483647;

describe('interface.components.charicter_sheet.actions', function() {
  describe('changeStat', function() {
    let stat;
    let value;

    beforeEach(function() {
      stat  = 'fake-stat';
      value = 10;
    });

    it('returns an alter sheet event', function() {
      let action = actions.changeStat(stat, value);

      expect(action.type).to.equal('CHANGE_STAT');
      expect(action.payload).to.deep.equal({
        stat: 'fake-stat',
        value: 10,
      });
    });

    context('when the value is not a number', function() {
      beforeEach(function() {
        value = 'not-a-number';
      });

      it('reterns an error action', function() {
        let action = actions.changeStat(stat, value);

        expect(action.type).to.equal('CHANGE_STAT_FAILURE');
        expect(action.payload).to.be.an.instanceOf(Error);
        expect(action.payload.message).to.be.contain('Value for stat "fake-stat" is not a number');
      });

      context('but it is falsy', function() {
        beforeEach(function() {
          value = '';
        });

        it('returns an alter sheet event', function() {
          let action = actions.changeStat(stat, value);

          expect(action.type).to.equal('CHANGE_STAT');
          expect(action.payload).to.deep.equal({
            stat: 'fake-stat',
            value: ''
          });
        });
      });
    });

    context('when the value will not fit in a 32-bit integer field', function() {
      beforeEach(function() {
        value = MAX_32_BIT_INT + 1;
      });

      it('reterns an error action', function() {
        let action = actions.changeStat(stat, value);

        expect(action.type).to.equal('CHANGE_STAT_FAILURE');
        expect(action.payload).to.be.an.instanceOf(Error);
        expect(action.payload.message).to.be.contain(`Value must be able to fit in a signed 32 bit intiger (max size of ${MAX_32_BIT_INT})`);
      });
    });
  });
});
