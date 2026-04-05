'use client';

/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';

// Adjust this path if your firebase config is located elsewhere
import { db } from '../../lib/firebase'; 


function ProfileContent() {
  const searchParams = useSearchParams();
  const docId = searchParams.get('id');
  
  // Using 'any' bypasses strict TypeScript property checking so data.dateInterview doesn't throw an error
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!docId) {
      alert("No Profile ID found. Please open this page from the table.");
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        // 'docId as string' prevents TS from complaining that docId might be null
        const docRef = doc(db, "profiles", docId as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setData(docSnap.data());
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error getting document:", error);
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
    if (spec && spec.trim() !== "") {
      ans += ` - ${spec}`;
    }
    return ans;
  };

  const getEnrollmentString = () => {
    if (!data) return "";
    let enrollmentStr = data.currently_enrolled || "";
    if (data.currently_enrolled === "Yes" && data.enrolled_grade) {
        enrollmentStr += ` (Grade: ${data.enrolled_grade})`;
    } else if (data.currently_enrolled === "No" && data.not_enrolled_reason) {
        enrollmentStr += ` (Reason: ${data.not_enrolled_reason})`;
    }
    return enrollmentStr;
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading profile data...</div>;
  if (!data) return <div style={{ padding: '40px', textAlign: 'center' }}>Profile not found.</div>;

  return (
 <div className="fullDetailsWrapper">
      {/* PAGE 1 */}
      <div className="page">
        <div className="logo-container">
          <img src="/dswd.png" alt="DSWD Logo" className="main-logo" />
          <img src="/bagongpilipinas.png" alt="Bagong Pilipinas Logo" className="main-logo bagong-logo" />
        </div>
          
        <table className="header-info">
          <tbody>
            <tr>
              <td colSpan={2} width="40%">Date of Interview: {data.dateInterview}</td>
              <td width="30%">Time Started: {data.timeStart}</td>
              <td width="30%">Time Ended: {data.timeEnd}</td>
            </tr>
            <tr>
              <td colSpan={4}>Name of Interviewer: {data.interviewer_name}</td>
            </tr>
            <tr>
              <td colSpan={2}>Household ID No.: {data.household_id}</td>
              <td colSpan={2}>Region: {data.region}</td>
            </tr>
            <tr>
              <td colSpan={2}>Pantawid Member? {data.pantawid_member}</td>
              <td colSpan={2}>Province: {data.province}</td>
            </tr>
            <tr>
              <td colSpan={2}>Name of Respondent: {data.respondent_name}</td>
              <td colSpan={2}>Address: {data.address}</td>
            </tr>
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
            <tr><td>R8.</td><td>Highest Educational Attainment:</td><td>{data.r8_educational_attainment || data.educational_attainment}</td><td className="code-col">Code: {data.r8_education_code}</td></tr>
            <tr><td>R9.</td><td>Disability/Special Needs:</td><td>{data.r9_disability || data.disability}</td><td className="code-col">Code: {data.r9_disability_code}</td></tr>
            <tr><td>R10.</td><td>Critical Illness:</td><td>{data.r10_illness || data.illness}</td><td className="code-col">Code: {data.r10_illness_code}</td></tr>
          </tbody>
        </table>

        <h2 className="section-title">FAMILY PROFILE</h2>
        <div className="family-size-header">
          H1. Bilang ng Miyembro (Family Size): 
          <span style={{ display: 'inline-block', borderBottom: '1px solid #000', width: '50px', textAlign: 'center' }}>
            {data.h1_family_size || data.family_size}
          </span>
        </div>
        <table style={{ textAlign: 'center' }}>
          <thead>
            <tr style={{ fontWeight: 'bold', backgroundColor: '#fff' }}>
              <td width="20"></td>
              <td width="120">H2. Name</td>
              <td>H3.<br/>Relationship to<br/>the Head of<br/>the Family</td>
              <td>H4. Civil<br/>Status</td>
              <td>H5. Age</td>
              <td>H6. Sex</td>
              <td>H7.<br/>Occupation</td>
              <td>H8.<br/>Occupation Class</td>
              <td>H9.<br/>Disability/Sp<br/>ecial Needs</td>
              <td>H10. Critical<br/>Illness</td>
              <td>H11. Solo<br/>Parent</td>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 10 }).map((_, i) => {
              const index = i + 1;
              const famName = data[`fam_${index}_name`];
              
              if (!famName && index !== 1) return null;

              return (
                <tr key={index}>
                  <td>{index}</td>
                  <td>{famName || ''}</td>
                  <td>{data[`fam_${index}_relationship`] || ''}</td>
                  <td>{data[`fam_${index}_civil_status`] || ''}</td>
                  <td>{data[`fam_${index}_age`] || ''}</td>
                  <td>{data[`fam_${index}_sex`] || ''}</td>
                  <td>{data[`fam_${index}_occupation`] || ''}</td>
                  <td>{data[`fam_${index}_occ_class`] || ''}</td>
                  <td>{data[`fam_${index}_disability`] || ''}</td>
                  <td>{data[`fam_${index}_illness`] || ''}</td>
                  <td>{data[`fam_${index}_solo_parent`] || ''}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <h2 className="section-title">I. HOUSING, SANITATION AND WATER</h2>
        
        <h3 className="subsection-title">A. HOUSING CONDITION</h3>
        <div className="q-block">
          <div className="question">1. What type of construction materials are the roofs and the outer walls made of?</div>
          <div className="options"><div className="option-row">{data.housing_material}</div></div>
        </div>
        <div className="q-block">
          <div className="question">2. What is the tenure status of the house and lot does the family have?</div>
          <div className="options"><div className="option-row">{formatAnswer("house_lot", "house_lot_other")}</div></div>
        </div>
        <div className="q-block">
          <div className="question">3. Are there any modifications in the house to accommodate the child's disability?</div>
          <div className="options"><div className="option-row">{formatAnswer("modification", "modification_specify")}</div></div>
        </div>
        <div className="q-block">
          <div className="question">4. What is the main source of electricity in the dwelling place?</div>
          <div className="options"><div className="option-row">{formatAnswer("main_source_of_electricity", "electricity_specify")}</div></div>
        </div>

        <h3 className="subsection-title">B. WATER SUPPLY</h3>
        <div className="q-block">
          <div className="question">5. What is your family's main source of water supply?</div>
          <div className="options"><div className="option-row">{formatAnswer("water_supply", "water_supply_specify")}</div></div>
        </div>
      </div>

      {/* PAGE 2 */}
      <div className="page">
        <div className="logo-container">
          <img src="/dswd.png" alt="DSWD Logo" className="main-logo" />
          <img src="/bagongpilipinas.png" alt="Bagong Pilipinas Logo" className="main-logo bagong-logo" />
        </div>

        <h3 className="subsection-title">C. SANITATION</h3>
        <div className="q-block">
          <div className="question">6. What is the main type of toilet facility the family uses?</div>
          <div className="options"><div className="option-row">{formatAnswer("sanitation", "sanitation_specify")}</div></div>
        </div>
        <div className="q-block">
          <div className="question">7. Is the toilet accessible for the child?</div>
          <div className="options"><div className="option-row">{data.accessible_toilet}</div></div>
        </div>
        <div className="q-block">
          <div className="question">8. What is the main system of garbage disposal adopted by the family?</div>
          <div className="options"><div className="option-row">{formatAnswer("garbage_disposal", "garbage_disposal_specify")}</div></div>
        </div>
        <br />

        <h2 className="section-title">II. HEALTH</h2>
        
        <h3 className="subsection-title">A. GENERAL HEALTH</h3>
        <div className="q-block">
          <div className="question">1. Has the child received all recommended vaccinations?</div>
          <div className="options"><div className="option-row">{data.received_vaccination}</div></div>
        </div>
        <div className="q-block">
          <div className="question">2. Does the child have any ongoing health conditions?</div>
          <div className="options"><div className="option-row">{formatAnswer("health_condition", "health_condition_specify")}</div></div>
        </div>

        <h3 className="subsection-title">B. HEALTH EXPENSES</h3>
        <div className="q-block">
          <div className="question">3. Please provide the corresponding health expenses in a month for each of the following areas, as applicable:</div>
          <table style={{ width: '90%', margin: '15px auto', textAlign: 'center' }}>
            <tbody>
              <tr style={{ fontWeight: 'bold', backgroundColor: '#e5e5e5' }}>
                <td colSpan={2}>AREAS OF CONCERNS</td>
                <td width="20%">TOTAL<br /><span style={{ fontSize: '9px' }}>(PER MONTH)</span></td>
                <td width="20%">REMARKS</td>
              </tr>
              <tr>
                <td colSpan={2} style={{ textAlign: 'left' }}>FOOD (E.G. MILK, COOKIES, OATMEAL, ETC)</td>
                <td>{data.food_total}</td><td>{data.food_remarks}</td>
              </tr>
              <tr>
                <td rowSpan={3} width="25%" style={{ textAlign: 'left' }}>MEDICINE</td>
                <td style={{ textAlign: 'left' }}>• MAINTENANCE</td>
                <td>{data.maint_total}</td><td>{data.maint_remarks}</td>
              </tr>
              <tr>
                <td style={{ textAlign: 'left' }}>• VITAMINS</td>
                <td>{data.vitamins_total}</td><td>{data.vitamins_remarks}</td>
              </tr>
              <tr>
                <td style={{ textAlign: 'left' }}>• OTHER RELATED MEDICINES</td>
                <td>{data.othermed_total}</td><td>{data.othermed_remarks}</td>
              </tr>
              <tr>
                <td colSpan={2} style={{ textAlign: 'left' }}>THERAPY (PHYSICAL, OCCUPATIONAL, SPEECH)</td>
                <td>{data.therapy_total}</td><td>{data.therapy_remarks}</td>
              </tr>
              <tr>
                <td colSpan={2} style={{ textAlign: 'left' }}>HYGIENE-RELATED NEEDS</td>
                <td>{data.hygiene_total}</td><td>{data.hygiene_remarks}</td>
              </tr>
              <tr>
                <td colSpan={2} style={{ textAlign: 'left' }}>OTHER HEALTH NEEDS</td>
                <td>{data.otherhealth_total}</td><td>{data.otherhealth_remarks}</td>
              </tr>
              <tr>
                <td colSpan={2} style={{ textAlign: 'right', fontWeight: 'bold' }}>OVER-ALL TOTAL</td>
                <td style={{ fontWeight: 'bold' }}>{data.overall_total}</td><td></td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="subsection-title">C. ACCESS TO HEALTH SERVICES</h3>
        <div className="q-block">
          <div className="question">4. Has the child availed health services in the past 6 months?</div>
          <div className="options"><div className="option-row">{formatAnswer("health_services", "health_services_specify")}</div></div>
        </div>
        <div className="q-block">
          <div className="question">5. Is the health facility accessible for the child?</div>
          <div className="options"><div className="option-row">{data.facility_accessible}</div></div>
        </div>
        <div className="q-block">
          <div className="question">6. Are there any barriers to accessing health care services?</div>
          <div className="options"><div className="option-row">{formatAnswer("barriers_accessing_healthcare_services", "barriers_healthcare_specify")}</div></div>
        </div>
      </div>

      {/* PAGE 3 */}
      <div className="page">
        <div className="logo-container">
          <img src="/dswd.png" alt="DSWD Logo" className="main-logo" />
          <img src="/bagongpilipinas.png" alt="Bagong Pilipinas Logo" className="main-logo bagong-logo" />
        </div>

        <h2 className="section-title">III. EDUCATION</h2>
        
        <h3 className="subsection-title">A. EDUCATIONAL STATUS</h3>
        <div className="q-block">
          <div className="question">1. Is the child currently enrolled in school?</div>
          <div className="options"><div className="option-row">{getEnrollmentString()}</div></div>
        </div>

        <h3 className="subsection-title">B. SCHOOL ACCESSIBILITY</h3>
        <div className="q-block">
          <div className="question">2. Is the school equipped with physically accessibility features (ramps, handrails, and grab bars, etc?)</div>
          <div className="options"><div className="option-row">{formatAnswer("physical_accessibility_features", "physical_accessibility_specify")}</div></div>
        </div>
        <div className="q-block">
          <div className="question">3. Are there special education programs available?</div>
          <div className="options"><div className="option-row">{formatAnswer("special_education_programs", "sped_programs_specify")}</div></div>
        </div>
        <div className="q-block">
          <div className="question">4. Does the child receive any learning support (special education teacher, assistant, etc.)</div>
          <div className="options"><div className="option-row">{formatAnswer("received_learning_support", "learning_support_specify")}</div></div>
        </div>

        <h3 className="subsection-title">C. LEARNING MATERIALS</h3>
        <div className="q-block">
          <div className="question">5. Are there accessible learning materials available for the child (braille, audio books, etc.)?</div>
          <div className="options"><div className="option-row">{formatAnswer("accessible_learning_materials", "learning_materials_specify")}</div></div>
        </div>
        <div className="q-block">
          <div className="question">6. Does the child have access to assistive technology (hearing aids, communication devices, etc)?</div>
          <div className="options"><div className="option-row">{formatAnswer("assistive_technology", "assistive_tech_specify")}</div></div>
        </div>
        <br />
        <h2 className="section-title">IV. ECONOMIC CAPACITY</h2>
        
        <h3 className="subsection-title">A. FAMILY INCOME</h3>
        <div className="q-block">
          <div className="question">1. What is the primary source of income for the family?</div>
          <div className="options"><div className="option-row">{data.income_source}</div></div>
        </div>
        <div className="q-block">
          <div className="question">2. How much is the approximate monthly of the family?</div>
          <div className="options"><div className="option-row">{data.monthly_income}</div></div>
        </div>

        <h3 className="subsection-title">B. EMPLOYMENT</h3>
        <div className="q-block">
          <div className="question">3. Are the parents/guardians employed or have entrepreneurial activities?</div>
          <div className="options"><div className="option-row">{formatAnswer("employed_or_entrepreurial_activities", "employment_specify")}</div></div>
          <div className="options">
            <div className="option-row" style={{ marginTop: '5px' }}>
              If not, reason for unemployment: {formatAnswer("reason_for_unemployment", "unemployment_reason_specify")}
            </div>
          </div>
        </div>
        <br />

        <h2 className="section-title">V. SERVICE AVAILMENT</h2>
        
        <h3 className="subsection-title">A. SOCIAL SERVICES</h3>
        <div className="q-block">
          <div className="question">1. Does the family receive any form of financial assistance (government subsidies, medical assistance)?</div>
          <div className="options"><div className="option-row">{formatAnswer("financial_assistance", "financial_assistance_specify")}</div></div>
        </div>
        <div className="q-block">
          <div className="question">2. Is the family aware of available social services for children with disabilities?</div>
          <div className="options"><div className="option-row">{formatAnswer("social_services", "social_services_specify")}</div></div>
        </div>
        <div className="q-block">
          <div className="question">3. Has the family availed of any services (therapy, financial support, special education program, etc.)</div>
          <div className="options"><div className="option-row">{formatAnswer("availed_any_services", "availed_services_specify")}</div></div>
        </div>
      </div>

      {/* PAGE 4 */}
      <div className="page">
        <div className="logo-container">
          <img src="/dswd.png" alt="DSWD Logo" className="main-logo" />
          <img src="/bagongpilipinas.png" alt="Bagong Pilipinas Logo" className="main-logo bagong-logo" />
        </div>

        <h3 className="subsection-title">B. BARRIERS TO SERVICE AVAILMENT</h3>
        <div className="q-block">
          <div className="question">4. What are the challenges faced in availing these services?</div>
          <div className="options"><div className="option-row">{formatAnswer("challenges_faced", "challenges_faced_specify")}</div></div>
        </div>

        <h2 className="section-title" style={{ marginTop: '30px' }}>VI. GENERAL OBSERVATIONS AND RECOMMENDATIONS</h2>
        
        <div style={{ margin: '20px 0 10px 20px', fontWeight: 'bold', fontSize: '12px' }}>A. STRENGTHS: (e.g., supportive family, strong community network)</div>
        <div className="write-lines" style={{ margin: '0 20px' }}>{data.strengths}</div>

        <div style={{ margin: '30px 0 10px 20px', fontWeight: 'bold', fontSize: '12px' }}>B. ASSESSMENT</div>
        <div className="write-lines" style={{ margin: '0 20px' }}>{data.assessment}</div>

        <div style={{ margin: '30px 0 10px 20px', fontWeight: 'bold', fontSize: '12px' }}>C. Recommended Actions/Interventions:</div>
        <div className="write-lines" style={{ margin: '0 20px' }}>{data.recommended}</div>
      </div>

      <button 
        onClick={() => window.print()} 
        className="no-print"
        style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            backgroundColor: '#0056b3',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '50px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            fontWeight: 'bold',
            zIndex: 1000
        }}
      >
        Print Form
      </button>

    </div>
  );
}

export default function FullDetailsPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Loading Form...</div>}>
      <ProfileContent />
    </Suspense>
  );
}