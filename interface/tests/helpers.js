'use strict';

const React            = require('react');
const sinon            = require('sinon');
var { createRenderer } = require('react-test-renderer/shallow');

exports.shallowRender = function shallowRender(component) {
  let renderer = createRenderer();
  renderer.render(component);
  return renderer.getRenderOutput();
}

beforeEach(function(){
  if (this.sinon) {
    this.sinon.restore();
  } else {
    this.sinon = sinon.sandbox.create();
  }
});
