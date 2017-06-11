'use strict';

const React                                 = require('react');
const sinon                                 = require('sinon');
const { createRenderer }                    = require('react-test-renderer/shallow');
const { findAllWithType, findAllWithClass } = require('react-shallow-testutils');

exports.shallowRender = function shallowRender(component) {
  let renderer = createRenderer();
  renderer.render(component);
  return renderer.getRenderOutput();
}

exports.findAllWithType  = findAllWithType;
exports.findAllWithClass = findAllWithClass;

exports.listChildValues  = function(elements) {
  return elements.map(function(element) {
    return (element.props.children != null) ? element.props.children : element.props.value;
  });
};

beforeEach(function(){
  if (this.sinon) {
    this.sinon.restore();
  } else {
    this.sinon = sinon.sandbox.create();
  }
});
