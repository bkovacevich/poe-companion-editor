'use strict';

const React       = require('react');
const { connect } = require('react-redux');

class CharicterSheet extends React.Component {
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

      stats.forEach(function(stat) {
        rows.push(
          <tr key={ stat }>
            <td className='stat-title'>{ stat }</td>
            <td className='stat-value'><textbox id={ stat + '-box'} className='stat-box'>{ stat_values[stat.toLowerCase()] }</textbox></td>
          </tr>
        );
      });

      className = 'active';
    } else {
      stats.forEach(function(stat) {
        rows.push(
          <tr key={ stat }>
            <td className='stat-title'>{ stat }</td>
            <td className='stat-value'><textbox id={ stat + '-box'} className='stat-box'></textbox></td>
          </tr>
        );
      });

      className = 'in-active';
    }

    return <table id='charicter-sheet' className={ className }>
        { rows }
      </table>;
  }
}

function mapStateToProps(state) {
  return {
    charicter_sheet: state.loadFile.charicter_sheet,
  }
}

exports.TestCharicterSheet = CharicterSheet;
exports.CharicterSheet     = connect(mapStateToProps)(CharicterSheet);
