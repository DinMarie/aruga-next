'use client';

import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import styles from '../../styles/addstyle.module.css';

export default function AddProfilePage() {
  const router = useRouter();

  // Function to go to the next form page
  const handleNext = () => {
    // Later, you can save state to context or localStorage here before navigating!
    router.push('/form');
  };

  return (
    <div className={styles.addWrapper}>
      <Header subtitle="Aruga Project Profiling and Assessment Details" />

      <div className={styles.backButton}>
        <button onClick={() => router.push('/table')}>← Back</button>
      </div>

      <div className={styles.container}>
        
        {/* TOP ROW */}
        <div className={styles.topRow}>
          <div className={styles.fieldGroup}>
            <label>Date of Interview:</label>
            <input type="date" id="dateInterview" />
          </div>
          <div className={styles.fieldGroup}>
            <label>Time Started:</label>
            <input type="time" id="timeStart" />
          </div>
          <div className={styles.fieldGroup}>
            <label>Time Ended:</label>
            <input type="time" id="timeEnd" />
          </div>
        </div>

        {/* INFO SECTION */}
        <div className={styles.infoSection}>
          <div className={styles.formRow}><label>Name of Interviewer:</label><input type="text" className={styles.lineInput} /></div>
          <div className={styles.formRow}><label>Household ID No.:</label><input type="text" className={styles.lineInput} /></div>
          <div className={styles.formRow}><label>Region:</label><input type="text" className={styles.lineInput} /></div>
          <div className={styles.formRow}><label>Pantawid Member?</label><input type="text" className={styles.lineInput} /></div>
          <div className={styles.formRow}><label>Province:</label><input type="text" className={styles.lineInput} /></div>
          <div className={styles.formRow}><label>Name of Respondent:</label><input type="text" className={styles.lineInput} /></div>
          <div className={styles.formRow}><label>Address:</label><input type="text" className={styles.lineInput} /></div>
        </div>

        {/* CHILD PROFILE TABLE */}
        <div className={styles.sectionTitle}>CHILD WITH DISABILITY PROFILE</div>
        <table className={styles.profileTable}>
          <tbody>
            <tr><td className={styles.rCol}>R1.</td><td className={styles.labelCol}>Name:</td><td><input type="text" /></td></tr>
            <tr><td className={styles.rCol}>R2.</td><td className={styles.labelCol}>Address:</td><td><input type="text" /></td></tr>
            <tr><td className={styles.rCol}>R3.</td><td className={styles.labelCol}>Contact Number:</td><td><input type="text" /></td></tr>
            <tr><td className={styles.rCol}>R4.</td><td className={styles.labelCol}>Date of Birth:</td><td><input type="date" /></td></tr>
            <tr><td className={styles.rCol}>R5.</td><td className={styles.labelCol}>Religion:</td><td><input type="text" /></td><td className={styles.codeCol}>Code: <input type="text" className={styles.codeInput} /></td></tr>
            <tr><td className={styles.rCol}>R6.</td><td className={styles.labelCol}>IP Membership:</td><td><input type="text" /></td><td className={styles.codeCol}>Code: <input type="text" className={styles.codeInput} /></td></tr>
            <tr><td className={styles.rCol}>R7.</td><td className={styles.labelCol}>Sex:</td><td><input type="text" /></td><td className={styles.codeCol}>Code: <input type="text" className={styles.codeInput} /></td></tr>
            <tr><td className={styles.rCol}>R8.</td><td className={styles.labelCol}>Highest Educational Attainment:</td><td><input type="text" /></td><td className={styles.codeCol}>Code: <input type="text" className={styles.codeInput} /></td></tr>
            <tr><td className={styles.rCol}>R9.</td><td className={styles.labelCol}>Disability / Special Needs:</td><td><input type="text" /></td><td className={styles.codeCol}>Code: <input type="text" className={styles.codeInput} /></td></tr>
            <tr><td className={styles.rCol}>R10.</td><td className={styles.labelCol}>Critical Illness:</td><td><input type="text" /></td><td className={styles.codeCol}>Code: <input type="text" className={styles.codeInput} /></td></tr>
          </tbody>
        </table>

        {/* FAMILY SIZE */}
        <div className={styles.familySize}>
          <label>H1. Bilang ng Miyembro (Family Size):</label>
          <input type="number" className={styles.familySizeInput} />
        </div>

        {/* FAMILY PROFILE TABLE */}
        <div className={styles.sectionTitle}>FAMILY PROFILE</div>
        <table className={styles.familyTable}>
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
        <div className={styles.nextContainer}>
          <button className={styles.nextBtn} onClick={handleNext}>NEXT</button>
        </div>

      </div>

      <footer className={styles.footer}>
        <p>2026 CSWDO - Biñan City</p>
      </footer>
    </div>
  );
}