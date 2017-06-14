'use strict';

const { remote }        = require('electron');
const React             = require('react');
const ReactDOM          = require('react-dom');
const {Provider}        = require('react-redux');
const { logger }        = require('redux-logger');
const promiseMiddleware = require('redux-promise-middleware').default;

const { createStore, combineReducers, applyMiddleware } = require('redux');

const { FileBrowser, FileSaver } = require('../file');
const file_reducers              = require('../file/reducers');

const { CharicterSheet }       = require('../character_sheet');
const character_sheet_reducers = require('../character_sheet/reducers');

const { InfoWindow }         = require('../info_window')
const info_window_reducers   = require('../info_window/reducers')
const info_window_middleware = require('../info_window/middleware')

let reducers   = combineReducers(Object.assign({}, file_reducers, character_sheet_reducers, info_window_reducers));
let middleware = applyMiddleware(logger, promiseMiddleware(), info_window_middleware);
let store      = createStore(reducers, middleware);

class Editor extends React.Component {
  constructor(store) {
    super(store);

    this.closeWindow = this.closeWindow.bind(this);
  }

  render() {
    return <Provider store={store}>
    <div id='editor'>
      <div className='pure-g' id='menu-bar'>
        <div className='pure-u-20-24'>
          <FileBrowser />
          <FileSaver />
        </div>
        <div className='pure-u-4-24' id='close-window'>
          <a className="close-button" onClick={ this.closeWindow }><i className='fa fa-window-close-o'></i></a>
        </div>
      </div>
      <div className='pure-u-12-24' id='sheet-container'>
        <CharicterSheet />
      </div>
      <div className='pure-u-12-24' id='info-window-container'>
        <InfoWindow />
      </div>
    </div>
    </Provider>
  }

  closeWindow() {
    remote.getCurrentWindow().close();
  }
}

module.exports = Editor;
