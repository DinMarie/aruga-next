'use client';

import Header from '../../components/Header';
import '../../styles/formstyle.css'; 

export default function FormPage() {
  return (
    <div className="form-wrapper">
      
      <Header subtitle="Aruga Project Profiling and Assessment Details" />

      <div className="container" style={{ marginTop: '90px' }}>
        
        {/* I. HOUSING, SANITATION AND WATER */}
        <div className="section-title">I. HOUSING, SANITATION AND WATER</div>
        <div className="form-section">
          <h3>A. HOUSING CONDITION</h3>
          <p className="question"><h4>1. What type of construction materials are the roofs and the outer walls made of?</h4></p>
          <label className="radio-option"><input type="radio" name="q1" /> a. Makeshift/salvaged/improvised materials</label>
          <label className="radio-option"><input type="radio" name="q1" /> b. Mixed but predominantly makeshift/salvaged/improvised materials</label>
          <label className="radio-option"><input type="radio" name="q1" /> c. Light materials such as bamboo/sawali/cogon/nipa but not sturdy and durable</label>
          <label className="radio-option"><input type="radio" name="q1" /> d. Mixed but predominantly light materials</label>
          <label className="radio-option"><input type="radio" name="q1" /> e. Strong materials such as concrete/brick/stone</label>
          <label className="radio-option"><input type="radio" name="q1" /> f. Bamboo/sawali/cogon/nipa but sturdy and durable</label>

          <p className="question2"><h4>2. What is the tenure status of the house and lot does the family have?</h4></p>
          <label className="radio-option"><input type="radio" name="q2" /> a. Own house and lot</label>
          <label className="radio-option"><input type="radio" name="q2" /> b. Own house, rent-free lot without consent of owner</label>
          <label className="radio-option"><input type="radio" name="q2" /> c. Own house, rent-free lot with the consent of the owner</label>
          <label className="radio-option"><input type="radio" name="q2" /> d. Rent-free house and lot without consent of owner</label>
          <label className="radio-option"><input type="radio" name="q2" /> e. Rent-free house and lot with consent of owner</label>
          <label className="radio-option"><input type="radio" name="q2" /> f. Rented house and lot for less than three years</label>
          <label className="radio-option">
              <input type="radio" name="q2" /> g. Own house, rented lot for less than three years &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <input type="text" name="code-box" />
          </label>

          <p className="question3"><h4>3. Are there any modifications in the house to accommodate the child’s disability?</h4></p>
          <label className="radio-option">
              <input type="radio" name="h1" /> a. Yes. Specify: &nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;
              <input type="text" name="code-box" />
          </label>
          <label className="radio-option"><input type="radio" name="h1" /> b. No</label>

          <p className="question4"><h4>4. What is the main source of electricity in the dwelling place?</h4></p>
          <label className="radio-option"><input type="radio" name="h2" /> a. Electric Company</label>
          <label className="radio-option"><input type="radio" name="h2" /> b. Generator</label>
          <label className="radio-option"><input type="radio" name="h2" /> c. Solar</label>
          <label className="radio-option"><input type="radio" name="h2" /> d. Battery</label>
          <label className="radio-option">
              <input type="radio" name="h2" /> h. Others, specify: &nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;
              <input type="text" name="code-box" />
          </label>
          <label className="radio-option"><input type="radio" name="h2" /> f. none</label>

          <h3>B. WATER SUPPLY</h3>
          <p className="question"><h4>5. What is your family’s main source of water supply?</h4></p>
          <label className="radio-option"><input type="radio" name="a1" /> a. Unprotected spring, lake, river, rain, dug well</label>
          <label className="radio-option"><input type="radio" name="a1" /> b. Commercial sources, e.g., tanker, truck, peddler (except bottled water)</label>
          <label className="radio-option"><input type="radio" name="a1" /> c. Source of safe drinking water but the time to collect water including the time to walk to the water source, collect it and return is longer than 30 minutes.</label>
          <label className="radio-option"><input type="radio" name="a1" /> d. Own use of faucet community water system (gripo)</label>
          <label className="radio-option"><input type="radio" name="a1" /> e. Shared faucet community water system</label>
          <label className="radio-option"><input type="radio" name="a1" /> f. Own use tubed/piped deep well</label>
          <label className="radio-option"><input type="radio" name="a1" /> g. Shared tubed/ piped deep well, tubed/piped shallow well</label>
          <label className="radio-option">
              <input type="radio" name="a1" /> i. Others, specify: &nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;
              <input type="text" name="code-box" />
          </label>

          <h3>C. SANITATION</h3>
          <p className="question"><h4>6. What is the main type of toilet facility the family uses? </h4></p>
          <label className="radio-option"><input type="radio" name="b1" /> a. Water-sealed, sewer septic tank, used exclusively by the family</label>
          <label className="radio-option"><input type="radio" name="b1" /> b. Water-sealed, sewer septic tank, shared with other families</label>
          <label className="radio-option"><input type="radio" name="b1" /> c. Closed-pit</label>
          <label className="radio-option"><input type="radio" name="b1" /> d. Open pit</label>
          <label className="radio-option">
              <input type="radio" name="b1" /> e. Others (pail system, and others), specify: &nbsp;&nbsp;&nbsp;
              <input type="text" name="code-box" />
          </label>
          <label className="radio-option"><input type="radio" name="b1" /> f. Own use tubed/piped deep well</label>
          <label className="radio-option"><input type="radio" name="b1" /> g. Shared tubed/ piped deep well, tubed/piped shallow well</label>

          <p className="question"><h4>7. Is the toilet accessible for the child?? </h4></p>
          <label className="radio-option"><input type="radio" name="b2" /> a. Yes</label>
          <label className="radio-option"><input type="radio" name="b2" /> b. No</label>

          <p className="question"><h4>8. What is the main system of garbage disposal adopted by the family? </h4></p>
          <label className="radio-option"><input type="radio" name="c1" /> a. Garbage collection</label>
          <label className="radio-option"><input type="radio" name="c1" /> b. Burning</label>
          <label className="radio-option"><input type="radio" name="c1" /> c. Composting</label>
          <label className="radio-option"><input type="radio" name="c1" /> d. Recycling</label>
          <label className="radio-option"><input type="radio" name="c1" /> e. Waste Segregation</label>
          <label className="radio-option"><input type="radio" name="c1" /> f. Pit with cover</label>
          <label className="radio-option"><input type="radio" name="c1" /> g. Pit without cover</label>
          <label className="radio-option"><input type="radio" name="c1" /> h. Throwing of garbage in rivers, vacant lots, etc.</label>
          <label className="radio-option">
              <input type="radio" name="c1" /> i. Others, specify: &nbsp;&nbsp;&nbsp;
              <input type="text" name="code-box" />
          </label>
        </div>

        {/* II. HEALTH */}
        <div className="section-title">II. HEALTH</div>
        <div className="form-section">
          <h3>A. GENERAL HEALTH</h3>
          <p className="question"><h4>1. Has the child received all recommended vaccinations?</h4></p>
          <label className="radio-option"><input type="radio" name="d1" /> a. Yes</label>
          <label className="radio-option"><input type="radio" name="d1" /> b. No</label>

          <div className="question"> 
            <h4>2.Does the child have any ongoing health conditions? </h4>
            <label className="radio-option"><input type="radio" name="d2" /> a. Yes. Specify: <input type="text" name="code-box" /></label>
            <label className="radio-option"><input type="radio" name="d2" /> b. No  &nbsp;&nbsp;&nbsp;</label>
          </div>

          <h4>3. Please provide the corresponding health expenses in a month for each of the following areas as applicable:</h4>
          <table className="health-table">
            <tbody>
              <tr>
                <th colSpan={2}>AREAS OF CONCERNS</th>
                <th>TOTAL<br/>(PER MONTH)</th>
                <th>REMARKS</th>
              </tr>
              <tr>
                <td colSpan={2}>FOOD (E.G. MILK, COOKIES, OATMEAL, ETC)</td>
                <td><input type="text" name="food_total" /></td>
                <td><input type="text" name="food_remarks" /></td>
              </tr>
              <tr>
                <td rowSpan={3}>MEDICINE</td>
                <td>• MAINTENANCE</td>
                <td><input type="text" name="maint_total" /></td>
                <td><input type="text" name="maint_remarks" /></td>
              </tr>
              <tr>
                <td>• VITAMINS</td>
                <td><input type="text" name="vitamins_total" /></td>
                <td><input type="text" name="vitamins_remarks" /></td>
              </tr>
              <tr>
                <td>• OTHER RELATED MEDICINES</td>
                <td><input type="text" name="othermed_total" /></td>
                <td><input type="text" name="othermed_remarks" /></td>
              </tr>
              <tr>
                <td colSpan={2}>THERAPY (PHYSICAL, OCCUPATIONAL, SPEECH)</td>
                <td><input type="text" name="therapy_total" /></td>
                <td><input type="text" name="therapy_remarks" /></td>
              </tr>
              <tr>
                <td colSpan={2}>HYGIENE RELATED NEEDS</td>
                <td><input type="text" name="hygiene_total" /></td>
                <td><input type="text" name="hygiene_remarks" /></td>
              </tr>
              <tr>
                <td colSpan={2}>OTHER HEALTH NEEDS</td>
                <td><input type="text" name="otherhealth_total" /></td>
                <td><input type="text" name="otherhealth_remarks" /></td>
              </tr>
              <tr>
                <td colSpan={2}><b>OVER-ALL TOTAL</b></td>
                <td><input type="text" name="overall_total" /></td>
                <td></td>
              </tr>
            </tbody>
          </table>

          <h3>C. ACCESS TO HEALTH SERVICES</h3>
          <div className="question">
            <h4>1. Has the child availed health services in the past 6 months?</h4>
            <label className="radio-option"><input type="radio" name="d3" /> Yes, What health services availed?: <input type="text" name="code-box" /></label>
            <label className="radio-option"><input type="radio" name="d3" /> No</label>
          </div>

          <p className="question"><h4>5. Is the health facility accessible for the child?</h4></p>
          <label className="radio-option"><input type="radio" name="d4" /> a. Yes</label>
          <label className="radio-option"><input type="radio" name="d4" /> b. No</label>

          <div className="question">
            <h4>6. Are there any barriers to accessing health care services (e.g., transportation , consultation, fees, etc.) </h4>
            <label className="radio-option"><input type="radio" name="d5" /> Yes, Specify?: <input type="text" name="code-box" /></label>
            <label className="radio-option"><input type="radio" name="d5" /> No</label>
          </div>
        </div>

        {/* III. EDUCATION */}
        <div className="section-title">III. EDUCATION</div>
        <div className="form-section">
          <h3>A. Educational Status</h3>
          <p className="question"><h4>1. Is the child currently enrolled in school?</h4></p>
          <label className="radio-option"><input type="radio" name="d6" /> a. Yes. Grade/Year Level: <input type="text" name="code-box" /></label>
          <label className="radio-option"><input type="radio" name="d6" /> b. No. Why not? <input type="text" name="code-box" /></label>

          <h3>B. School Accessibility</h3>
          <div className="question">
            <h4>2. Is the school equipped with physically accessibility features (ra,ps, handrails, and grab bars, etc?)</h4>
            <label className="radio-option"><input type="radio" name="d7" /> Yes, Specify: <input type="text" name="code-box" /></label>
            <label className="radio-option"><input type="radio" name="d7" /> No</label>
            <label className="radio-option"><input type="radio" name="d7" /> Not Applicable</label>
          </div>

          <p className="question"><h4>3. Are there special education programs available?</h4></p>
          <label className="radio-option"><input type="radio" name="d8" /> a. Yes. Specify: <input type="text" name="code-box" /></label>
          <label className="radio-option"><input type="radio" name="d8" /> No</label>
          <label className="radio-option"><input type="radio" name="d8" /> Not Applicable</label>

          <div className="question">
            <h4>4. Are teachers trained in special education?</h4>
            <label className="radio-option"><input type="radio" name="d8_1" /> a. Yes. Specify: <input type="text" name="code-box" /></label>
            <label className="radio-option"><input type="radio" name="d8_1" /> No</label>
            <label className="radio-option"><input type="radio" name="d8_1" /> Not Applicable</label>
          </div>

          <h3>C. Learning Materials</h3>
          <div className="question">
            <h4>5. Are there accessible learning materials availble for the child (braille, audio books, etc.)?</h4>
            <label className="radio-option"><input type="radio" name="d9" /> Yes, Speicfy: <input type="text" name="code-box" /></label>
            <label className="radio-option"><input type="radio" name="d9" /> No</label>
            <label className="radio-option"><input type="radio" name="d9_na" /> Not Applicable</label>
          </div>

          <div className="question">
            <h4>6. Does the child have access to assistive technology (hearing aids, communication devices, etc)?</h4>
            <label className="radio-option"><input type="radio" name="d10" /> Yes, Specify: <input type="text" name="code-box" /></label>
            <label className="radio-option"><input type="radio" name="d10" /> No</label>
            <label className="radio-option"><input type="radio" name="d10_na" /> Not Applicable</label>
          </div>
        </div>

        {/* IV. ECONOMIC CAPACITY */}
        <div className="section-title">IV. ECONOMIC CAPACITY</div>
        <div className="form-section">
          <h3>A. Family Income</h3>
          <h4>1. What is the primary source of income for the family?</h4>
          <input type="text" className="line-input" name="income_source" />
        </div>

        <div className="submit-container">
          <button type="submit" className="submit-btn">SUBMIT</button>
        </div>

      </div>

      <footer className="footer">
        <p>2026 CSWDO - Biñan City</p>
      </footer>

    </div>
  );
}