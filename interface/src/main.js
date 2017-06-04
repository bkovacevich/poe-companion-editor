'use strict';

const React     = require('react');
const ReactDOM   = require('react-dom');

const Editor = require('./components/editor');

ReactDOM.render(
  <Editor />,
  document.getElementById('application')
);
