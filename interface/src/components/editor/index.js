'use strict';

const React                  = require('react');
const ReactDOM               = require('react-dom');
const {Provider}             = require('react-redux');
const { logger }             = require('redux-logger');
const promiseMiddleware      = require('redux-promise-middleware').default;

const { createStore, combineReducers, applyMiddleware } = require('redux');

const { FileBrowser }          = require('../file');
const { CharicterSheet }       = require('../charicter_sheet');
const file_reducers            = require('../file/reducers');
const charicter_sheet_reducers = require('../charicter_sheet/reducers');

let reducers   = combineReducers(Object.assign({}, file_reducers, charicter_sheet_reducers));
let middleware = applyMiddleware(logger, promiseMiddleware());
let store      = createStore(reducers, middleware);

class Editor extends React.Component {
  render() {
    return <Provider store={store}>
      <div id='editor'>
        <CharicterSheet />
        <FileBrowser />
      </div>
    </Provider>
  }
}

module.exports = Editor;
