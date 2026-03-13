'use client';

import { useState } from 'react';
import Header from '../../components/Header';
import styles from '../../styles/profilestyle.module.css';

export default function ProfilePage() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleSave = () => alert("Record Updated Successfully!");
  const confirmDelete = () => {
    setShowDeleteModal(false);
    alert("Record Deleted Successfully!");
  };

  return (
    <div className={styles.profileWrapper}>
      <Header subtitle="Aruga Project Profiling and Assessment Details" />

      <div className={styles.container} style={{ marginTop: '90px' }}>
        <div className={styles.containerRight}>
          <button className={styles.updateBtn} onClick={handleSave}>UPDATE</button>
          <button className={styles.deleteBtn} onClick={() => setShowDeleteModal(true)}>DELETE</button>
        </div>

        <div className={styles.topRow}>
          <div className={styles.fieldGroup}><label>Date of Interview:</label><input type="date" id="dateInterview" /></div>
          <div className={styles.fieldGroup}><label>Time Started:</label><input type="time" id="timeStart" /></div>
          <div className={styles.fieldGroup}><label>Time Ended:</label><input type="time" id="timeEnd" /></div>
        </div>

        <div className={styles.infoSection}>
          <div className={styles.formRow}><label>Name of Interviewer:</label><input type="text" className={styles.lineInput} /></div>
          <div className={styles.formRow}><label>Household ID No.:</label><input type="text" className={styles.lineInput} /></div>
          <div className={styles.formRow}><label>Region:</label><input type="text" className={styles.lineInput} /></div>
          <div className={styles.formRow}><label>Pantawid Member?</label><input type="text" className={styles.lineInput} /></div>
          <div className={styles.formRow}><label>Province:</label><input type="text" className={styles.lineInput} /></div>
          <div className={styles.formRow}><label>Name of Respondent:</label><input type="text" className={styles.lineInput} /></div>
          <div className={styles.formRow}><label>Address:</label><input type="text" className={styles.lineInput} /></div>
        </div>

        <div className={styles.sectionTitle}>CHILD WITH DISABILITY PROFILE</div>
        <table className={styles.profileTable}>
          <tbody>
            <tr><td>R1.</td><td>Name:</td><td><input type="text" /></td><td></td></tr>
            <tr><td>R2.</td><td>Address:</td><td><input type="text" /></td><td></td></tr>
            <tr><td>R3.</td><td>Contact Number:</td><td><input type="text" /></td><td></td></tr>
            <tr><td>R4.</td><td>Date of Birth:</td><td><input type="date" /></td><td></td></tr>
            <tr><td>R5.</td><td>Religion:</td><td><input type="text" /></td><td>Code: <input type="text" /></td></tr>
            <tr><td>R6.</td><td>IP Membership:</td><td><input type="text" /></td><td>Code: <input type="text" /></td></tr>
            <tr><td>R7.</td><td>Sex:</td><td><input type="text" /></td><td>Code: <input type="text" /></td></tr>
            <tr><td>R8.</td><td>Highest Educational Attainment:</td><td><input type="text" /></td><td>Code: <input type="text" /></td></tr>
            <tr><td>R9.</td><td>Disability / Special Needs:</td><td><input type="text" /></td><td>Code: <input type="text" /></td></tr>
            <tr><td>R10.</td><td>Critical Illness:</td><td><input type="text" /></td><td>Code: <input type="text" /></td></tr>
          </tbody>
        </table>

        <div className={styles.familySize}>
          <label>H1. Bilang ng Miyembro (Family Size):</label>
          <input type="number" className={styles.familySizeInput} />
        </div>

        <div className={styles.sectionTitle}>FAMILY PROFILE</div>
        <table className={styles.familyTable}>
          <thead>
            <tr>
              <th style={{ width: '40px' }}></th>
              <th>H2. Name</th>
              <th>H3. Relationship to the Head of the Family</th>
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
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rowNum) => (
              <tr key={rowNum}>
                <td>{rowNum}.</td>
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
      </div>

      <div className={styles.modal} style={{ display: showDeleteModal ? 'flex' : 'none' }}>
        <div className={styles.modalBox}>
          <p>Are you sure you want to<br />delete the record?</p>
          <div className={styles.modalButtons}>
            <button className={styles.yesBtn} onClick={confirmDelete}>Yes</button>
            <button className={styles.noBtn} onClick={() => setShowDeleteModal(false)}>No</button>
          </div>
        </div>
      </div>

      <footer className={styles.footer}><p>2026 CSWDO - Biñan City</p></footer>
    </div>
  );
}