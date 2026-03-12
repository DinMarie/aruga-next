'use client';

import '../../styles/formstyle.css'; 
import Header from '../../components/Header'; // 1. Import your new component!

export default function FormPage() {
  return (
    <div className="form-wrapper">
      
      {/* 2. Drop it in and pass the specific subtitle for this page! */}
      <Header subtitle="Aruga Project Profiling and Assessment Details" />

      {/* --- MAIN FORM CONTAINER --- */}
      <div className="container">
        <div className="section-title">I. HOUSING, SANITATION AND WATER</div>
        
        <div className="form-section">
          <h3>A. HOUSING CONDITION</h3>
          
          <div className="question">
            <h4>1. What type of construction materials are the roofs and the outer walls made of?</h4>
          </div>
          
          <label className="radio-option">
            <input type="radio" name="q1" /> a. Makeshift/salvaged/improvised materials
          </label>
          <label className="radio-option">
            <input type="radio" name="q1" /> b. Mixed but predominantly makeshift/salvaged/improvised materials
          </label>
          {/* ... Add the rest of your form questions here ... */}
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