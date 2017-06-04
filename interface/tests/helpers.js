'use strict';

const React            = require('react');
var { createRenderer } = require('react-test-renderer/shallow');

exports.shallowRender = function shallowRender(component) {
  let renderer = createRenderer();
  renderer.render(component);
  return renderer.getRenderOutput();
}
