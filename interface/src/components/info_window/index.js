'use strict';

const { remote }              = require('electron');
const React                   = require('react');
const { connect }             = require('react-redux');
const path                    = require('path');
const ReactCSSTransitionGroup = require('react-addons-css-transition-group');

class InfoWindow extends React.Component {
  render() {
    let rows = [];

    this.props.alerts.forEach(function(alert, index) {
      rows.push(
        <p key={ `alert-${index}` } className={ alert.category }>
          { alert.message }
        </p>
      );
    });

    return <div id="info-window">
      <ReactCSSTransitionGroup
      transitionName="alerts"
      transitionEnter={false}
      transitionAppear={false}
      transitionLeave={true}
      transitionLeaveTimeout={500}>
        { rows }
      </ReactCSSTransitionGroup>
    </div>;
  }
};

function mapStateToProps(state) {
  return {
    alerts: state.infoReducer,
  };
}

exports.InfoWindow            = connect(mapStateToProps)(InfoWindow);
module.exports.TestInfoWindow = InfoWindow;
