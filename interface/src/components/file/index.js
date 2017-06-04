'use strict';

const { remote } = require('electron');

const React    = require('react');
const { connect }  = require('react-redux');

const file_actions = require('./actions');

class FileBrowser extends React.Component {

  constructor(store) {
    super(store);

    this.openFile = this.openFile.bind(this);
  }

  render() {
    let button_class;

    if (this.props.file_loading) {
      button_class = 'loading';
    } else {
      button_class = 'active';
    }

    return <button id='open-file' className={ button_class } onClick={this.openFile}>Open File</button>;
  }

  openFile() {
    let file_browser_options = {};

    remote.dialog.showOpenDialog(null, file_browser_options, (filename) => {
      this.props.dispatch(file_actions.loadFile(filename));
    });
  }
}

function mapStateToProps(state) {
  return {
    file_loading: state.loadFile.file_loading,
  }
}

exports.TestFileBrowser = FileBrowser;
exports.FileBrowser     = connect(mapStateToProps)(FileBrowser);
