import React from 'react';

import { getLabel } from '../../utils/helpers';
import { employmentPeriodTiming } from '../../utils/options-for-select';

export default class EmploymentHistoryReview extends React.Component {
  render() {
    return (
      <div>
        <table className="review usa-table-borderless">
          <tbody>
            <tr>
              <td>Have you held a license or journeyman rating to practice a profession??</td>
              <td>{this.props.data.hasNonMilitaryJobs.value === 'Y' ? 'Yes' : 'No'}</td>
            </tr>
          </tbody>
        </table>
        {this.props.data.nonMilitaryJobs.map((period, index) => {
          return (<table key={index} className="review usa-table-borderless">
            <thead>
              <tr>
                <td scope="col">Principal occupation - {period.name.value}</td>
                <td scope="col"></td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>When was this period of employment?</td>
                <td>{getLabel(employmentPeriodTiming, period.postMilitaryJob.value)}</td>
              </tr>
              <tr>
                <td>Number of months worked:</td>
                <td>{period.months.value}</td>
              </tr>
              <tr>
                <td>Licenses or rating:</td>
                <td>{period.licenseOrRating.value}</td>
              </tr>
            </tbody>
          </table>
          );
        })}
      </div>
    );
  }
}

EmploymentHistoryReview.propTypes = {
  data: React.PropTypes.object.isRequired
};