'use strict';

const { remote }  = require('electron');
const React       = require('react');
const { connect } = require('react-redux');
const path        = require('path');
const Promise     = require('bluebird');
const fs          = require('fs');
const os          = require('os');


const file_actions = require('./actions');

function findDefaultPath(home, filename) {
  if (filename) {
    return Promise.resolve(path.dirname(filename));
  }

  switch(os.platform()) {
    case 'win32': {
      return Promise.resolve(`C:\\Program Files\\Steam (x86)\\SteamApps\\Common\\Pillars of Eternity\\PillarsOfEternity_Data\\assetbundles\\prefabs\\objectbundle`);
    }

    case 'darwin': {
      return Promise.resolve(`${home}/Library/Application Support/SteamSteam/Apps/common/Pillars of Eternity/PillarsOfEternity_Data/assetbundles/prefabs/objectbundle`);
    }

    default: {
      var accessPromise = Promise.promisify(fs.access);

      let steam_path   = `${home}/.local/share/Steam`;
      let pillars_path = `SteamApps/common/Pillars of Eternity/PillarsOfEternity_Data/assetbundles/prefabs/objectbundle`;

      return accessPromise(`${steam_path}/${pillars_path}`, fs.constants.R_OK | fs.constants.W_OK)
        .catch((err) => {
          steam_path = `${home}/.steam/steam`;
          return;
        })
        .then(() => {
          return Promise.resolve(`${steam_path}/${pillars_path}`);
        });
    }
  }
}

class FileBrowser extends React.Component {
  constructor(store) {
    super(store);

    this.openFile = this.openFile.bind(this);
    this.buttonEnabled = this.buttonEnabled.bind(this);
  }

  render() {
    let button_class = this.buttonEnabled() ? 'pure-button' : 'pure-button pure-button-disabled';

    return <button id='open-file' className={ button_class } onClick={this.openFile}><i className='fa fa-folder-open-o'></i> Open</button>;
  }

  buttonEnabled() {
    return !this.props.file_loading;
  }

  openFile() {
    if (!this.buttonEnabled()) {
      return;
    }

    let home = remote.app.getPath('home');

    return findDefaultPath(home, this.props.filename)
      .then((default_path) => {
        let file_browser_options = {
          defaultPath: default_path,
        };

        remote.dialog.showOpenDialog(null, file_browser_options, (results) => {

          if (results && results.length) {
            let filename = results[0];
            this.props.dispatch(file_actions.loadFile(filename));
          }
        });
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
    let button_class = this.buttonEnabled() ? 'pure-button' : 'pure-button pure-button-disabled';

    return <button id='save-file' className={ button_class } onClick={this.saveFile}><i className="fa fa-floppy-o"></i> Save</button>;
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

exports.testFindDefaultPath = findDefaultPath;
