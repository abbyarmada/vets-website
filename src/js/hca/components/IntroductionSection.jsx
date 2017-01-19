import React from 'react';

class IntroductionSection extends React.Component {
  render() {
    return (
      <div>
        <div className="usa-grid">
          <div className="usa-width-one-whole">
            <h3>Apply online for health care with the 10-10ez (OMB No. 2900-0091)</h3>
          </div>
        </div>

        <div className="usa-grid">
          <div className="usa-width-one-whole">
            <p>
              Fill out this application with the most accurate information you have. The more accurate it is, the more likely you are to get a rapid response.
            </p>
            <p>
              VA uses the information you submit to determine your eligibility and to provide you with the best service.
            </p>
            <p>
              Federal law provides criminal penalties, including a fine and/or imprisonment for up to 5 years, for concealing a material fact or making a materially false statement. (See <a href="https://www.justice.gov/usam/criminal-resource-manual-903-false-statements-concealment-18-usc-1001" target="_blank">18 U.S.C. 1001</a>)
            </p>
            <div className="usa-alert usa-alert-info">
              <div className="usa-alert-body">
                <strong>Note:</strong> You will not be able to save your progress once you have started the form.
              </div>
            </div>
          </div>
        </div>
        <br/>
      </div>
    );
  }
}

export default IntroductionSection;
