'use strict';

const { remote }        = require('electron');
const React             = require('react');
const ReactDOM          = require('react-dom');
const {Provider}        = require('react-redux');
const { logger }        = require('redux-logger');
const promiseMiddleware = require('redux-promise-middleware').default;

const { createStore, combineReducers, applyMiddleware } = require('redux');

const { FileBrowser, FileSaver }          = require('../file');
const { CharicterSheet }       = require('../charicter_sheet');
const file_reducers            = require('../file/reducers');
const charicter_sheet_reducers = require('../charicter_sheet/reducers');

let reducers   = combineReducers(Object.assign({}, file_reducers, charicter_sheet_reducers));
let middleware = applyMiddleware(logger, promiseMiddleware());
let store      = createStore(reducers, middleware);

class Editor extends React.Component {
  constructor(store) {
    super(store);

    this.closeWindow = this.closeWindow.bind(this);
  }

  render() {
    return <Provider store={store}>
    <div id='editor'>
      <div className='pure-g'>
        <div className='pure-u-20-24'>
          <FileBrowser />
          <FileSaver />
        </div>
        <div className='pure-u-4-24' id='close-window'>
          <a onClick={ this.closeWindow }><i className='fa fa-window-close-o'></i></a>
        </div>
      </div>
        <CharicterSheet />
      </div>
    </Provider>
  }

  closeWindow() {
    remote.getCurrentWindow().close();
  }
}

module.exports = Editor;
