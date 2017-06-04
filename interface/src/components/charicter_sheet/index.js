'use strict';

const React = require('react');

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
            <td className='stat-title'>{ stat }</td><td className='stat-value'>{ stat_values[stat.toLowerCase()] }</td>
          </tr>
        );
      });

      className = 'active';
    } else {
      stats.forEach(function(stat) {
        rows.push(
          <tr key={ stat }>
            <td className='stat-title'>{ stat }</td><td className='stat-value'></td>
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

exports.TestCharicterSheet = CharicterSheet;
