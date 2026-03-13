'use client';

import Header from '../../components/Header';
import styles from '../../styles/formstyle.module.css'; 

export default function FormPage() {
  return (
    <div className={styles.formWrapper}>
      <Header subtitle="Aruga Project Profiling and Assessment Details" />

      <div className={styles.container}>
        <div className={styles.sectionTitle}>I. HOUSING, SANITATION AND WATER</div>
        <div className={styles.formSection}>
          <h3>A. HOUSING CONDITION</h3>
          <div className={styles.question}><h4>1. What type of construction materials are the roofs and the outer walls made of?</h4></div>
          <label className={styles.radioOption}><input type="radio" name="q1" /> a. Makeshift/salvaged/improvised materials</label>
          <label className={styles.radioOption}><input type="radio" name="q1" /> b. Mixed but predominantly makeshift</label>
          
          <div className={styles.question}><h4>2. What is the tenure status of the house?</h4></div>
          <label className={styles.radioOption}><input type="radio" name="q2" /> a. Own house and lot</label>
          <label className={styles.radioOption}><input type="radio" name="q2" /> g. Others: <input type="text" /></label>
        </div>

        <div className={styles.sectionTitle}>II. HEALTH</div>
        <div className={styles.formSection}>
          <h4>3. Please provide health expenses:</h4>
          <table>
            <tbody>
              <tr><th colSpan={2}>AREAS OF CONCERNS</th><th>TOTAL</th><th>REMARKS</th></tr>
              <tr><td colSpan={2}>FOOD</td><td><input type="text" /></td><td><input type="text" /></td></tr>
              <tr><td rowSpan={3}>MEDICINE</td><td>• MAINTENANCE</td><td><input type="text" /></td><td><input type="text" /></td></tr>
            </tbody>
          </table>
        </div>

        <div className={styles.submitContainer}>
          <button type="submit" className={styles.submitBtn}>SUBMIT</button>
        </div>
      </div>

      <footer className={styles.footer}><p>2026 CSWDO - Biñan City</p></footer>
    </div>
  );
}