'use strict';

const React       = require('react');
const { connect } = require('react-redux');

const actions = require('./actions');

class CharicterSheet extends React.Component {
  constructor(store) {
    super(store);

    this.changeStat = this.changeStat.bind(this);
  }
  render() {
    let stats = [
      'Might',
      'Constitution',
      'Dexterity',
      'Perception',
      'Intellect',
      'Resolve',
    ];

    let className;
    let rows = [];

    if (this.props.charicter_sheet) {
      let stat_values = this.props.charicter_sheet.values;

      stats.forEach((stat) => {
        rows.push(
          <tr key={ stat }>
            <td className='stat-title'>{ stat }</td>
            <td className='stat-value'>
              <input onChange={ this.changeStat } type="text" id={ stat + '-box'} className='stat-box' value={ stat_values[stat.toLowerCase()] }></input>
            </td>
          </tr>
        );
      });

      className = 'active';
    } else {
      stats.forEach((stat) => {
        rows.push(
          <tr key={ stat }>
            <td className='stat-title'>{ stat }</td>
            <td className='stat-value'><input onChange={ this.changeStat } type="text" value="" className='inactive-stat-box'></input></td>
          </tr>
        );
      });

      className = 'in-active';
    }

    return <table id='charicter-sheet' className={ className }>
        <tbody>
          { rows }
        </tbody>
        <tfoot>
          <tr>
            <td>Total</td>
            <td>{ this.props.charicter_sheet ? this.props.charicter_sheet.stat_total : '' }</td>
          </tr>
        </tfoot>
      </table>;
  }

  changeStat(event) {
    let value = event.target.value;
    let id    = event.target.id;

    if (!id) {
      return;
    }

    let stat = id.substring(0, id.length - 4).toLowerCase();

    this.props.dispatch(actions.changeStat(stat, value));

  }
}

function mapStateToProps(state) {
  return {
    charicter_sheet: state.charicterSheet.charicter_sheet,
  }
}

exports.TestCharicterSheet = CharicterSheet;
exports.CharicterSheet     = connect(mapStateToProps)(CharicterSheet);
