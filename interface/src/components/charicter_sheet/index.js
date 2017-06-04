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
            <td className='stat-value'><input type="text" id={ stat + '-box'} className='stat-box'>{ stat_values[stat.toLowerCase()] }</input></td>
          </tr>
        );
      });

      className = 'active';
    } else {
      stats.forEach(function(stat) {
        rows.push(
          <tr key={ stat }>
            <td className='stat-title'>{ stat }</td>
            <td className='stat-value'><input type="text" id={ stat + '-box'} className='stat-box'></input></td>
          </tr>
        );
      });

      className = 'in-active';
    }

    return <table id='charicter-sheet' className={ className }>
        <tbody>
          { rows }
        </tbody>
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
