'use strict';

const { expect } = require('chai');

const info_window_middleware = require('../src/components/info_window/middleware');
const uuid                    = require('uuid');

describe('.interface.components.info_window.middleware', function() {

  let store;
  let next;
  let action;

  beforeEach(function() {
    store = {
      dispatch: this.sinon.spy(),
    };

    next = this.sinon.spy();

    action = {
      type: "FAKE_ACTION",
      payload: {},
    };

    this.sinon.stub(uuid, 'v4').returns('fake-uuid');
  });

  it('passes the action through', function() {

    info_window_middleware(store)(next)(action);

    expect(next).to.have.been.calledOnce;
    expect(next.args[0][0]).to.deep.equal(action);

  });

  context('when the action is CHANGE_STAT_FAILURE', function() {
    let error;

    beforeEach(function() {
      error          = 'fake-error';
      action.payload = error;
      action.type    = 'CHANGE_STAT_FAILURE';
    });

    it('dispatches an error action with an unique id', function() {
      info_window_middleware(store)(next)(action);

      expect(store.dispatch).to.have.been.calledOnce;
      expect(store.dispatch.args[0][0]).to.deep.equal({
        type:    'INFO_WINDOW_ALERT',
        payload: {
          id:       'fake-uuid',
          message:  'fake-error',
          type:     'CHANGE_STAT_FAILURE',
          category: 'error',
        },
      });
    });
  });

  context('When the action is a LOAD_FILE_FULFILLED.', function() {
    beforeEach(function() {
      action = {
        type: "LOAD_FILE_FULFILLED",
        payload: {
          filename: 'fake-filename',
        },
      };
    });

    it('dispatches an info action with an unique id and clears errors', function() {
      info_window_middleware(store)(next)(action);

      expect(store.dispatch).to.have.been.calledTwicw;
      expect(store.dispatch.args[0][0]).to.deep.equal({
        type:    'INFO_WINDOW_ALERT',
        payload: {
          id:       'fake-uuid',
          message:  'successfully loaded fake-filename',
          type:     'LOAD_FILE_FULFILLED',
          category: 'info',
        },
      });

      expect(store.dispatch.args[1][0]).to.deep.equal({
        type:    'INFO_WINDOW_CLEAR_TYPE',
        payload: {
          type: 'LOAD_FILE_REJECTED',
        },
      });
    });
  });

  context('when the action is LOAD_FILE_REJECTED', function() {
    beforeEach(function() {
      action = {
        type: "LOAD_FILE_REJECTED",
        payload: new Error('fake-error'),
      };
    });

    it('dispatches an error action with an unique id', function() {
      info_window_middleware(store)(next)(action);

      expect(store.dispatch).to.have.been.calledOnce;
      expect(store.dispatch.args[0][0]).to.deep.equal({
        type:    'INFO_WINDOW_ALERT',
        payload: {
          id:       'fake-uuid',
          message:  'fake-error',
          type:     'LOAD_FILE_REJECTED',
          category: 'error',
        },
      });
    });
  });

  context('When the action is a SAVE_FILE_FULFILLED.', function() {
    beforeEach(function() {
      action = {
        type: "SAVE_FILE_FULFILLED",
        payload: {
          filename: 'fake-filename',
        },
      };
    });

    it('dispatches an info action with an unique id and clears errors', function() {
      info_window_middleware(store)(next)(action);

      expect(store.dispatch).to.have.been.calledTwice;
      expect(store.dispatch.args[0][0]).to.deep.equal({
        type:    'INFO_WINDOW_ALERT',
        payload: {
          id:       'fake-uuid',
          message:  'successfully saved fake-filename',
          type:     'SAVE_FILE_FULFILLED',
          category: 'info',
        },
      });

      expect(store.dispatch.args[1][0]).to.deep.equal({
        type:    'INFO_WINDOW_CLEAR_TYPE',
        payload: {
          type: 'SAVE_FILE_REJECTED',
        },
      });
    });
  });

  context('when the action is SAVE_FILE_REJECTED', function() {
    beforeEach(function() {
      action = {
        type: "SAVE_FILE_REJECTED",
        payload: new Error('fake-error'),
      };
    });

    it('dispatches an error action with an unique id', function() {
      info_window_middleware(store)(next)(action);

      expect(store.dispatch).to.have.been.calledOnce;
      expect(store.dispatch.args[0][0]).to.deep.equal({
        type:    'INFO_WINDOW_ALERT',
        payload: {
          id:       'fake-uuid',
          message:  'fake-error',
          type:     'SAVE_FILE_REJECTED',
          category: 'error',
        },
      });
    });
  });


  context('when an error action is dispatched', function() {
    let error;

    beforeEach(function() {
      error                = new Error('fake-error');
      action.payload       = error;
      action.type          = 'LOAD_FILE_REJECTED';
    });

    it('dispatches a INFO_WINDOW_CLEAR_ID action after 15 seconds', function() {
      var clock = this.sinon.useFakeTimers();

      info_window_middleware(store)(next)(action);

      expect(store.dispatch).to.have.been.calledOnce;

      clock.tick(14000);

      expect(store.dispatch).to.have.been.calledOnce;

      clock.tick(1000);

      expect(store.dispatch).to.have.been.calledTwice;

      expect(store.dispatch.args[1][0]).to.deep.equal({
        type:    'INFO_WINDOW_CLEAR_ID',
        payload: {
          id: 'fake-uuid',
        },
      });

      clock.restore();
    });
  });
});
