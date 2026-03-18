'use client';

import { useRouter } from 'next/navigation';
import Header from '../../components/Header';

export default function AddProfilePage() {
  const router = useRouter();

  // Function to go to the next form page
  const handleNext = () => {
    // Later, you can save state to context or localStorage here before navigating!
    router.push('/form');
  };

  return (
    <div className="addWrapper">
      <Header subtitle="Aruga Project Profiling and Assessment Details" />

      <div className="backButton">
        <button onClick={() => router.push('/table')}>← Back</button>
      </div>

      <div className="container">
        
        {/* TOP ROW */}
        <div className="topRow">
          <div className="fieldGroup">
            <label>Date of Interview:</label>
            <input type="date" id="dateInterview" />
          </div>
          <div className="fieldGroup">
            <label>Time Started:</label>
            <input type="time" id="timeStart" />
          </div>
          <div className="fieldGroup">
            <label>Time Ended:</label>
            <input type="time" id="timeEnd" />
          </div>
        </div>

        {/* INFO SECTION */}
        <div className="infoSection">
          <div className="formRow"><label>Name of Interviewer:</label><input type="text" className="lineInput" /></div>
          <div className="formRow"><label>Household ID No.:</label><input type="text" className="lineInput" /></div>
          <div className="formRow"><label>Region:</label><input type="text" className="lineInput" /></div>
          <div className="formRow"><label>Pantawid Member?</label><input type="text" className="lineInput" /></div>
          <div className="formRow"><label>Province:</label><input type="text" className="lineInput" /></div>
          <div className="formRow"><label>Name of Respondent:</label><input type="text" className="lineInput" /></div>
          <div className="formRow"><label>Address:</label><input type="text" className="lineInput" /></div>
        </div>

        {/* CHILD PROFILE TABLE */}
        <div className="sectionTitle">CHILD WITH DISABILITY PROFILE</div>
        <table className="profileTable">
          <tbody>
            <tr><td className="rCol">R1.</td><td className="labelCol">Name:</td><td><input type="text" /></td></tr>
            <tr><td className="rCol">R2.</td><td className="labelCol">Address:</td><td><input type="text" /></td></tr>
            <tr><td className="rCol">R3.</td><td className="labelCol">Contact Number:</td><td><input type="text" /></td></tr>
            <tr><td className="rCol">R4.</td><td className="labelCol">Date of Birth:</td><td><input type="date" /></td></tr>
            <tr><td className="rCol">R5.</td><td className="labelCol">Religion:</td><td><input type="text" /></td><td className="codeCol">Code: <input type="text" className="codeInput" /></td></tr>
            <tr><td className="rCol">R6.</td><td className="labelCol">IP Membership:</td><td><input type="text" /></td><td className="codeCol">Code: <input type="text" className="codeInput" /></td></tr>
            <tr><td className="rCol">R7.</td><td className="labelCol">Sex:</td><td><input type="text" /></td><td className="codeCol">Code: <input type="text" className="codeInput" /></td></tr>
            <tr><td className="rCol">R8.</td><td className="labelCol">Highest Educational Attainment:</td><td><input type="text" /></td><td className="codeCol">Code: <input type="text" className="codeInput" /></td></tr>
            <tr><td className="rCol">R9.</td><td className="labelCol">Disability / Special Needs:</td><td><input type="text" /></td><td className="codeCol">Code: <input type="text" className="codeInput" /></td></tr>
            <tr><td className="rCol">R10.</td><td className="labelCol">Critical Illness:</td><td><input type="text" /></td><td className="codeCol">Code: <input type="text" className="codeInput" /></td></tr>
          </tbody>
        </table>

        {/* FAMILY SIZE */}
        <div className="familySize">
          <label>H1. Bilang ng Miyembro (Family Size):</label>
          <input type="number" className="familySizeInput" />
        </div>

        {/* FAMILY PROFILE TABLE */}
        <div className="sectionTitle">FAMILY PROFILE</div>
        <table className="familyTable">
          <thead>
            <tr>
              <th style={{ width: '40px' }}></th>
              <th>H2. Name</th>
              <th>H3. Relationship to Head</th>
              <th>H4. Civil Status</th>
              <th>H5. Age</th>
              <th>H6. Sex</th>
              <th>H7. Occupation</th>
              <th>H8. Occupation Class</th>
              <th>H9. Disability / Special Needs</th>
              <th>H10. Critical Illness</th>
              <th>H11. Solo Parent</th>
            </tr>
          </thead>
          <tbody>
            {/* THIS ARRAY CREATES 10 ROWS AUTOMATICALLY! */}
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rowNum) => (
              <tr key={rowNum}>
                <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{rowNum}.</td>
                <td><input type="text" /></td>
                <td><input type="text" /></td>
                <td><input type="text" /></td>
                <td><input type="number" /></td>
                <td><input type="text" /></td>
                <td><input type="text" /></td>
                <td><input type="text" /></td>
                <td><input type="text" /></td>
                <td><input type="text" /></td>
                <td><input type="text" /></td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* NEXT BUTTON */}
        <div className="nextContainer">
          <button className="nextBtn" onClick={handleNext}>NEXT</button>
        </div>

      </div>

      <footer className="footer">
        <p>2026 CSWDO - Biñan City</p>
      </footer>
    </div>
  );
}