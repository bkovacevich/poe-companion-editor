'use strict';

const { remote }  = require('electron');
const React       = require('react');
const { connect } = require('react-redux');
const path        = require('path');

const file_actions = require('./actions');

class FileBrowser extends React.Component {
  constructor(store) {
    super(store);

    this.openFile = this.openFile.bind(this);
    this.buttonEnabled = this.buttonEnabled.bind(this);
  }

  render() {
    let button_class = this.buttonEnabled() ? 'active' : 'inactive';

    return <button id='open-file' className={ button_class } onClick={this.openFile}>Open File</button>;
  }

  buttonEnabled() {
    return !this.props.file_loading;
  }

  openFile() {
    if (!this.buttonEnabled()) {
      return;
    }

    let file_browser_options = {};
    if (this.props.filename) {
      file_browser_options.defaultPath = path.dirname(this.props.filename);
    }

    remote.dialog.showOpenDialog(null, file_browser_options, (results) => {

      if (results && results.length) {
        let filename = results[0];
        this.props.dispatch(file_actions.loadFile(filename));
      }
    });
  }
}

class FileSaver  extends React.Component {
  constructor(store) {
    super(store);

    this.saveFile = this.saveFile.bind(this);
    this.buttonEnabled = this.buttonEnabled.bind(this);
  }

  render() {
    let button_class = this.buttonEnabled() ? 'active' : 'inactive';

    return <button id='save-file' className={ button_class } onClick={this.saveFile}>Save File</button>;
  }

  buttonEnabled() {
    return (!this.props.file_loading && this.props.filename);
  }

  saveFile() {
    if (!this.buttonEnabled()) {
      return;
    }

    let file_browser_options = {
      defaultPath: this.props.filename,
    };

    remote.dialog.showSaveDialog(null, file_browser_options, (filename) => {
      let companion_asset_editor = this.props.companion_asset_editor;

      if (filename) {
        this.props.dispatch(file_actions.saveFile(filename, companion_asset_editor));
      }
    });
  }
}

function mapFileBrowserStateToProps(state) {
  return {
    file_loading:   state.file.file_loading,
    filename:       state.file.filename,
  }
}

function mapFileSaverStateToProps(state) {
  return {
    file_loading:            state.file.file_loading,
    filename:                state.file.filename,
    companion_asset_editor:  state.file.companion_asset_editor,
  }
}

exports.TestFileBrowser = FileBrowser;
exports.FileBrowser     = connect(mapFileBrowserStateToProps)(FileBrowser);

exports.TestFileSaver = FileSaver;
exports.FileSaver     = connect(mapFileSaverStateToProps)(FileSaver);
