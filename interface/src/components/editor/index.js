'use strict';

const React                  = require('react');
const ReactDOM               = require('react-dom');
const {Provider}             = require('react-redux');
const { logger }             = require('redux-logger');
const promiseMiddleware      = require('redux-promise-middleware').default;

const { createStore, combineReducers, applyMiddleware } = require('redux');

const { FileBrowser } = require('../file');
const file_reducers   = require('../file/reducers');

let reducers   = combineReducers(file_reducers);
let middleware = applyMiddleware(logger, promiseMiddleware());
let store      = createStore(reducers, middleware);

class Editor extends React.Component {
  render() {
    return <Provider store={store}>
      <div id='editor'>
        <FileBrowser />
      </div>
    </Provider>
  }
}

module.exports = Editor;
