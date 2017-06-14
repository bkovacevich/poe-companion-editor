'use strict';

const { expect } = require('chai');

const { infoReducer } = require('../src/components/info_window/reducers');

describe('interface.components.character_sheet.reducer', function() {
  describe('.infoReducer', function() {
    let initial_state;
    let action;

    context('on a INFO_WINDOW_ALERT event', function() {
      beforeEach(function() {
        initial_state = [{old: 'state'}];

        action = {
          type: 'INFO_WINDOW_ALERT',
          payload: {
            id:        'fake id',
            type:      'FAKE_TYPE',
            message:   'fake message',
            category:  'error',
          },
        };
      });

      it('pushes the message on to the the queue', function() {
        let new_state = infoReducer(initial_state, action);

        expect(new_state).to.deep.equal([
          {
            id:       'fake id',
            type:     'FAKE_TYPE',
            message:  'fake message',
            category: 'error',
          },
          {
            old: 'state',
          }
        ]);
      });

      context('when the same message is in the first place of the queue', function() {
        beforeEach(function() {
          initial_state = [
            { id: 'ID_ONE', message: 'old-fake-message' },
            { id: 'ID_TWO', message: 'another-fake-message' },
            { id: 'ID_THREE', message: 'yet another message' },
          ];

          action = {
            type: 'INFO_WINDOW_ALERT',
            payload: {
              id:        'ID_FOUR',
              message:   'old-fake-message',
            },
          };


        });
        it('updates that messages id with the new one', function() {
          let new_state = infoReducer(initial_state, action);

          expect(new_state).to.deep.equal([
            { id: 'ID_FOUR', message: 'old-fake-message' },
            { id: 'ID_TWO', message: 'another-fake-message' },
            { id: 'ID_THREE', message: 'yet another message' },
          ]);
        });
      });
    });

    context('on an INFO_WINDOW_CLEAR_TYPE action', function() {
      beforeEach(function() {
        initial_state = [
          { type: 'TYPE_ONE' },
          { type: 'TYPE_TWO' },
          { type: 'TYPE_ONE' },
          { type: 'TYPE_THREE' },
        ];

        action = {
          type: 'INFO_WINDOW_CLEAR_TYPE',
          payload: {
            type: 'TYPE_ONE',
          },
        };
      });

      it('removes those types from the queue', function() {
        let new_state = infoReducer(initial_state, action);

        expect(new_state).to.deep.equal([
          { type: 'TYPE_TWO' },
          { type: 'TYPE_THREE' },
        ]);
      });

    });

    context('on an INFO_WINDOW_CLEAR_ID action', function() {
      beforeEach(function() {
        initial_state = [
          { id: 'ID_ONE' },
          { id: 'ID_TWO' },
          { id: 'ID_THREE' },
        ];

        action = {
          type: 'INFO_WINDOW_CLEAR_ID',
          payload: {
            id: 'ID_ONE',
          },
        };
      });

      it('removes those types from the queue', function() {
        let new_state = infoReducer(initial_state, action);

        expect(new_state).to.deep.equal([
          { id: 'ID_TWO' },
          { id: 'ID_THREE' },
        ]);
      });
    });
  });
});
