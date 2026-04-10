'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

function PrintProfileContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const docId = searchParams.get('id');
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!docId) {
      alert("No Profile ID found.");
      setLoading(false);
      return;
    }
    const fetchProfile = async () => {
      try {
        const docSnap = await getDoc(doc(db, "profiles", docId));
        if (docSnap.exists()) setData(docSnap.data());
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [docId]);

  const formatAnswer = (mainKey: string, specifyKey: string) => {
    if (!data) return "N/A";
    let ans = data[mainKey] || "N/A";
    let spec = data[specifyKey] || "";
    return spec.trim() !== "" ? `${ans} - ${spec}` : ans;
  };

  const getEnrollmentString = () => {
    if (!data) return "";
    let str = data.currently_enrolled || "";
    if (data.currently_enrolled === "Yes" && data.enrolled_grade) str += ` (Grade: ${data.enrolled_grade})`;
    else if (data.currently_enrolled === "No" && data.not_enrolled_reason) str += ` (Reason: ${data.not_enrolled_reason})`;
    return str;
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading printable form...</div>;
  if (!data) return <div style={{ padding: '40px', textAlign: 'center' }}>Profile not found.</div>;

  return (
    <div className="fullDetailsWrapper">
      <style dangerouslySetInnerHTML={{__html: `
        .fullDetailsWrapper, .fullDetailsWrapper * { box-sizing: border-box; font-family: Arial, sans-serif; }
        .fullDetailsWrapper { background-color: #e5e7eb; display: flex; flex-direction: column; align-items: center; padding: 20px; gap: 20px; min-height: 100vh; }
        .fullDetailsWrapper .page { width: 8.5in; min-height: 13in; background: white; padding: 0.5in 0.6in; box-shadow: 0 4px 6px rgba(0,0,0,0.1); position: relative; margin-bottom: 20px; }
        .fullDetailsWrapper h2.section-title { background-color: #a48ca3; color: white; text-align: center; padding: 6px; font-size: 13px; margin: 0; text-transform: uppercase; font-weight: bold; border: 1px solid #000; border-bottom: none; }
        .fullDetailsWrapper h3.subsection-title { font-size: 13px; font-weight: bold; margin: 20px 0 10px 0; text-transform: uppercase; }
        .fullDetailsWrapper table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 15px; }
        .fullDetailsWrapper th, .fullDetailsWrapper td { border: 1px solid #000; padding: 5px 8px; vertical-align: middle; }
        .fullDetailsWrapper .code-col { text-align: right; width: 60px; }
        .fullDetailsWrapper .q-block { margin-top: 15px; font-size: 12px; }
        .fullDetailsWrapper .question { font-weight: normal; margin-bottom: 8px; margin-left: 20px; }
        .fullDetailsWrapper .options { margin-left: 45px; display: flex; flex-direction: column; gap: 8px; }
        .fullDetailsWrapper .family-size-header { border: 1px solid #000; border-top: none; border-bottom: none; padding: 10px; font-weight: bold; font-size: 13px; }
        .fullDetailsWrapper .write-lines { display: flex; flex-direction: column; gap: 20px; margin-top: 10px; }
        .fullDetailsWrapper .logo-container { display: flex; justify-content: flex-start; align-items: center; gap: 15px; margin-bottom: 20px; }
        .fullDetailsWrapper .main-logo { height: 60px; width: auto; display: block; }
        .fullDetailsWrapper .bagong-logo { margin-top: -26px; }
        .floating-controls { position: fixed; bottom: 30px; right: 30px; display: flex; gap: 15px; z-index: 1000; }
        .floating-btn { padding: 12px 24px; border: none; border-radius: 50px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.2); color: white; }
        @media print {
            body { background: none; padding: 0; margin: 0; }
            .fullDetailsWrapper { background: none; padding: 0; display: block; min-height: auto; }
            .fullDetailsWrapper .page { box-shadow: none; margin: 0; padding: 0.5in; page-break-after: always; width: 100%; }
            .floating-controls { display: none !important; }
        }
      `}} />

      {/* Floating Action Buttons */}
      <div className="floating-controls">
        <button onClick={() => router.push(`/fulldetails?id=${docId}`)} className="floating-btn" style={{ backgroundColor: '#2a1b3c' }}>
            ← Back to Edit
        </button>
        <button onClick={() => window.print()} className="floating-btn" style={{ backgroundColor: '#1a73e8' }}>
            🖨️ Print Form
        </button>
      </div>

      {/* PAGE 1 */}
      <div className="page">
        <div className="logo-container">
          <img src="/dswd.png" alt="DSWD Logo" className="main-logo" />
          <img src="/bagongpilipinas.png" alt="Bagong Pilipinas" className="main-logo bagong-logo" />
        </div>
        <table className="header-info">
          <tbody>
            <tr>
              <td colSpan={2} width="40%">Date of Interview: {data.dateInterview}</td>
              <td width="30%">Time Started: {data.timeStart}</td>
              <td width="30%">Time Ended: {data.timeEnd}</td>
            </tr>
            <tr><td colSpan={4}>Name of Interviewer: {data.interviewer_name}</td></tr>
            <tr><td colSpan={2}>Household ID No.: {data.household_id}</td><td colSpan={2}>Region: {data.region}</td></tr>
            <tr><td colSpan={2}>Pantawid Member? {data.pantawid_member}</td><td colSpan={2}>Province: {data.province}</td></tr>
            <tr><td colSpan={2}>Name of Respondent: {data.respondent_name}</td><td colSpan={2}>Address: {data.address}</td></tr>
          </tbody>
        </table>

        <h2 className="section-title">CHILD WITH DISABILITY PROFILE</h2>
        <table>
          <tbody>
            <tr><td width="30">R1.</td><td width="200">Name:</td><td>{data.r1_name || data.name}</td><td className="code-col"></td></tr>
            <tr><td>R2.</td><td>Address:</td><td>{data.r2_address || data.address}</td><td className="code-col"></td></tr>
            <tr><td>R3.</td><td>Contact Number:</td><td>{data.r3_contact || data.contact}</td><td className="code-col"></td></tr>
            <tr><td>R4.</td><td>Date of Birth:</td><td>{data.r4_dob || data.birthday}</td><td className="code-col"></td></tr>
            <tr><td>R5.</td><td>Religion:</td><td>{data.r5_religion || data.religion}</td><td className="code-col">Code: {data.r5_religion_code}</td></tr>
            <tr><td>R6.</td><td>IP Membership:</td><td>{data.r6_ip || data.ip}</td><td className="code-col">Code: {data.r6_ip_code}</td></tr>
            <tr><td>R7.</td><td>Sex:</td><td>{data.r7_sex || data.sex}</td><td className="code-col">Code: {data.r7_sex_code}</td></tr>
            <tr><td>R8.</td><td>Highest Ed. Attainment:</td><td>{data.r8_educational_attainment || data.educational_attainment}</td><td className="code-col">Code: {data.r8_education_code}</td></tr>
            <tr><td>R9.</td><td>Disability/Special Needs:</td><td>{data.r9_disability || data.disability}</td><td className="code-col">Code: {data.r9_disability_code}</td></tr>
            <tr><td>R10.</td><td>Critical Illness:</td><td>{data.r10_illness || data.illness}</td><td className="code-col">Code: {data.r10_illness_code}</td></tr>
          </tbody>
        </table>

        <h2 className="section-title">FAMILY PROFILE</h2>
        <div className="family-size-header">
          H1. Bilang ng Miyembro (Family Size): <span style={{ display: 'inline-block', borderBottom: '1px solid #000', width: '50px', textAlign: 'center' }}>{data.h1_family_size || data.family_size}</span>
        </div>
        <table style={{ textAlign: 'center' }}>
          <thead>
            <tr style={{ fontWeight: 'bold', backgroundColor: '#fff' }}>
              <td width="20"></td><td width="120">H2. Name</td><td>H3. Relationship</td><td>H4. Civil Status</td><td>H5. Age</td><td>H6. Sex</td><td>H7. Occupation</td><td>H8. Occ. Class</td><td>H9. Disability</td><td>H10. Illness</td><td>H11. Solo Parent</td>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 10 }).map((_, i) => {
              const idx = i + 1;
              const famName = data[`fam_${idx}_name`];
              if (!famName && idx !== 1) return null;
              return (
                <tr key={idx}>
                  <td>{idx}</td><td>{famName || ''}</td><td>{data[`fam_${idx}_relationship`] || ''}</td><td>{data[`fam_${idx}_civil_status`] || ''}</td><td>{data[`fam_${idx}_age`] || ''}</td><td>{data[`fam_${idx}_sex`] || ''}</td><td>{data[`fam_${idx}_occupation`] || ''}</td><td>{data[`fam_${idx}_occ_class`] || ''}</td><td>{data[`fam_${idx}_disability`] || ''}</td><td>{data[`fam_${idx}_illness`] || ''}</td><td>{data[`fam_${idx}_solo_parent`] || ''}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <h2 className="section-title">I. HOUSING, SANITATION AND WATER</h2>
        <h3 className="subsection-title">A. HOUSING CONDITION</h3>
        <div className="q-block"><div className="question">1. Construction materials?</div><div className="options"><div>{data.housing_material}</div></div></div>
        <div className="q-block"><div className="question">2. Tenure status?</div><div className="options"><div>{formatAnswer("house_lot", "house_lot_other")}</div></div></div>
        <div className="q-block"><div className="question">3. Modifications for child?</div><div className="options"><div>{formatAnswer("modification", "modification_specify")}</div></div></div>
        <div className="q-block"><div className="question">4. Main source of electricity?</div><div className="options"><div>{formatAnswer("main_source_of_electricity", "electricity_specify")}</div></div></div>
        <h3 className="subsection-title">B. WATER SUPPLY</h3>
        <div className="q-block"><div className="question">5. Main source of water?</div><div className="options"><div>{formatAnswer("water_supply", "water_supply_specify")}</div></div></div>
      </div>

      {/* PAGE 2 */}
      <div className="page">
        <div className="logo-container">
          <img src="/dswd.png" alt="DSWD Logo" className="main-logo" />
          <img src="/bagongpilipinas.png" alt="Bagong Pilipinas" className="main-logo bagong-logo" />
        </div>
        <h3 className="subsection-title">C. SANITATION</h3>
        <div className="q-block"><div className="question">6. Toilet facility?</div><div className="options"><div>{formatAnswer("sanitation", "sanitation_specify")}</div></div></div>
        <div className="q-block"><div className="question">7. Toilet accessible?</div><div className="options"><div>{data.accessible_toilet}</div></div></div>
        <div className="q-block"><div className="question">8. Garbage disposal?</div><div className="options"><div>{formatAnswer("garbage_disposal", "garbage_disposal_specify")}</div></div></div>

        <h2 className="section-title">II. HEALTH</h2>
        <h3 className="subsection-title">A. GENERAL HEALTH</h3>
        <div className="q-block"><div className="question">1. Received vaccinations?</div><div className="options"><div>{data.received_vaccination}</div></div></div>
        <div className="q-block"><div className="question">2. Ongoing conditions?</div><div className="options"><div>{formatAnswer("health_condition", "health_condition_specify")}</div></div></div>

        <h3 className="subsection-title">B. HEALTH EXPENSES</h3>
        <table style={{ width: '90%', margin: '15px auto', textAlign: 'center' }}>
            <tbody>
              <tr style={{ fontWeight: 'bold', backgroundColor: '#e5e5e5' }}><td colSpan={2}>AREAS OF CONCERNS</td><td width="20%">TOTAL</td><td width="20%">REMARKS</td></tr>
              <tr><td colSpan={2} style={{ textAlign: 'left' }}>FOOD</td><td>{data.food_total}</td><td>{data.food_remarks}</td></tr>
              <tr><td rowSpan={3} width="25%" style={{ textAlign: 'left' }}>MEDICINE</td><td style={{ textAlign: 'left' }}>• MAINTENANCE</td><td>{data.maint_total}</td><td>{data.maint_remarks}</td></tr>
              <tr><td style={{ textAlign: 'left' }}>• VITAMINS</td><td>{data.vitamins_total}</td><td>{data.vitamins_remarks}</td></tr>
              <tr><td style={{ textAlign: 'left' }}>• OTHER MEDICINES</td><td>{data.othermed_total}</td><td>{data.othermed_remarks}</td></tr>
              <tr><td colSpan={2} style={{ textAlign: 'left' }}>THERAPY</td><td>{data.therapy_total}</td><td>{data.therapy_remarks}</td></tr>
              <tr><td colSpan={2} style={{ textAlign: 'left' }}>HYGIENE</td><td>{data.hygiene_total}</td><td>{data.hygiene_remarks}</td></tr>
              <tr><td colSpan={2} style={{ textAlign: 'left' }}>OTHER HEALTH</td><td>{data.otherhealth_total}</td><td>{data.otherhealth_remarks}</td></tr>
              <tr><td colSpan={2} style={{ textAlign: 'right', fontWeight: 'bold' }}>OVER-ALL TOTAL</td><td style={{ fontWeight: 'bold' }}>{data.overall_total}</td><td></td></tr>
            </tbody>
        </table>

        <h3 className="subsection-title">C. ACCESS TO HEALTH SERVICES</h3>
        <div className="q-block"><div className="question">4. Availed services?</div><div className="options"><div>{formatAnswer("health_services", "health_services_specify")}</div></div></div>
        <div className="q-block"><div className="question">5. Facility accessible?</div><div className="options"><div>{data.facility_accessible}</div></div></div>
        <div className="q-block"><div className="question">6. Barriers to access?</div><div className="options"><div>{formatAnswer("barriers_accessing_healthcare_services", "barriers_healthcare_specify")}</div></div></div>
      </div>

      {/* PAGE 3 */}
      <div className="page">
        <div className="logo-container">
          <img src="/dswd.png" alt="DSWD Logo" className="main-logo" />
          <img src="/bagongpilipinas.png" alt="Bagong Pilipinas" className="main-logo bagong-logo" />
        </div>
        <h2 className="section-title">III. EDUCATION</h2>
        <h3 className="subsection-title">A. EDUCATIONAL STATUS</h3>
        <div className="q-block"><div className="question">1. Currently enrolled?</div><div className="options"><div>{getEnrollmentString()}</div></div></div>

        <h3 className="subsection-title">B. SCHOOL ACCESSIBILITY</h3>
        <div className="q-block"><div className="question">2. Physical accessibility?</div><div className="options"><div>{formatAnswer("physical_accessibility_features", "physical_accessibility_specify")}</div></div></div>
        <div className="q-block"><div className="question">3. SPED programs?</div><div className="options"><div>{formatAnswer("special_education_programs", "sped_programs_specify")}</div></div></div>
        <div className="q-block"><div className="question">4. Learning support?</div><div className="options"><div>{formatAnswer("received_learning_support", "learning_support_specify")}</div></div></div>

        <h3 className="subsection-title">C. LEARNING MATERIALS</h3>
        <div className="q-block"><div className="question">5. Accessible materials?</div><div className="options"><div>{formatAnswer("accessible_learning_materials", "learning_materials_specify")}</div></div></div>
        <div className="q-block"><div className="question">6. Assistive technology?</div><div className="options"><div>{formatAnswer("assistive_technology", "assistive_tech_specify")}</div></div></div>

        <h2 className="section-title">IV. ECONOMIC CAPACITY</h2>
        <h3 className="subsection-title">A. FAMILY INCOME</h3>
        <div className="q-block"><div className="question">1. Primary income source?</div><div className="options"><div>{data.income_source}</div></div></div>
        <div className="q-block"><div className="question">2. Monthly income?</div><div className="options"><div>{data.monthly_income}</div></div></div>

        <h3 className="subsection-title">B. EMPLOYMENT</h3>
        <div className="q-block">
          <div className="question">3. Parents employed?</div><div className="options"><div>{formatAnswer("employed_or_entrepreurial_activities", "employment_specify")}</div></div>
          <div className="options"><div style={{ marginTop: '5px' }}>Reason for unemployment: {formatAnswer("reason_for_unemployment", "unemployment_reason_specify")}</div></div>
        </div>

        <h2 className="section-title">V. SERVICE AVAILMENT</h2>
        <h3 className="subsection-title">A. SOCIAL SERVICES</h3>
        <div className="q-block"><div className="question">1. Financial assistance?</div><div className="options"><div>{formatAnswer("financial_assistance", "financial_assistance_specify")}</div></div></div>
        <div className="q-block"><div className="question">2. Aware of services?</div><div className="options"><div>{formatAnswer("social_services", "social_services_specify")}</div></div></div>
        <div className="q-block"><div className="question">3. Availed services?</div><div className="options"><div>{formatAnswer("availed_any_services", "availed_services_specify")}</div></div></div>
      </div>

      {/* PAGE 4 */}
      <div className="page">
        <div className="logo-container">
          <img src="/dswd.png" alt="DSWD Logo" className="main-logo" />
          <img src="/bagongpilipinas.png" alt="Bagong Pilipinas" className="main-logo bagong-logo" />
        </div>
        <h3 className="subsection-title">B. BARRIERS TO SERVICE AVAILMENT</h3>
        <div className="q-block"><div className="question">4. Challenges faced?</div><div className="options"><div>{formatAnswer("challenges_faced", "challenges_faced_specify")}</div></div></div>

        <h2 className="section-title" style={{ marginTop: '30px' }}>VI. GENERAL OBSERVATIONS AND RECOMMENDATIONS</h2>
        <div style={{ margin: '20px 0 10px 20px', fontWeight: 'bold', fontSize: '12px' }}>A. STRENGTHS:</div>
        <div className="write-lines" style={{ margin: '0 20px' }}>{data.strengths}</div>
        <div style={{ margin: '30px 0 10px 20px', fontWeight: 'bold', fontSize: '12px' }}>B. ASSESSMENT:</div>
        <div className="write-lines" style={{ margin: '0 20px' }}>{data.assessment}</div>
        <div style={{ margin: '30px 0 10px 20px', fontWeight: 'bold', fontSize: '12px' }}>C. RECOMMENDED ACTIONS:</div>
        <div className="write-lines" style={{ margin: '0 20px' }}>{data.recommended}</div>
      </div>
    </div>
  );
}

export default function PrintPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Loading Form...</div>}>
      <PrintProfileContent />
    </Suspense>
  );
}