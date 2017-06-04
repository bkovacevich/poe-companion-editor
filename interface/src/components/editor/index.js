'use strict';

const React      = require('react');
const ReactDOM   = require('react-dom');
const {Provider} = require('react-redux');

const { createStore, combineReducers } = require('redux');

const { FileBrowser } = require('../file');
const file_reducers = require('../file/reducers');

let reducers = combineReducers(file_reducers);

let store = createStore(reducers);

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
