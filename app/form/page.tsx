'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc } from "firebase/firestore"; 
import { db } from '../../lib/firebase';
import Header from '../../components/Header';

export default function FormPage() {
  const router = useRouter();

  // 1. STATE TO HOLD ALL FORM DATA (Matches your Firebase Structure)
  const [formData, setFormData] = useState({
    // Housing
    construction_materials: '',
    tenure_status: '',
    tenure_other: '',
    has_disability_modifications: '',
    disability_modification_details: '',
    electricity_supply: '',
    electricity_other: '',
    water_supply: '',
    water_other: '',
    toilet_facility: '',
    toilet_other: '',
    toilet_accessible: '',
    garbage_disposal: '',
    garbage_other: '',

    // Health General
    vaccinations_completed: '',
    has_ongoing_conditions: '',
    ongoing_condition_details: '',
    
    // Health Expenses
    food_total: '', food_remarks: '',
    maint_total: '', maint_remarks: '',
    vitamins_total: '', vitamins_remarks: '',
    othermed_total: '', othermed_remarks: '',
    therapy_total: '', therapy_remarks: '',
    hygiene_total: '', hygiene_remarks: '',
    otherhealth_total: '', otherhealth_remarks: '',
    overall_total: '',

    // Health Access
    services_availed: '',
    services_details: '',
    is_facility_accessible: '',
    has_access_barriers: '',
    access_barrier_details: '',

    // Education
    is_currently_enrolled: '',
    grade_level: '',
    reason_not_enrolled: '',
    is_school_accessible: '',
    school_accessibility_details: '',
    has_sped: '',
    sped_details: '',
    has_accessible_materials: '',
    accessible_materials_details: '',
    has_assistive_technology: '',
    assistive_technology_details: '',

    // Economic
    primary_source_of_income: '',
    minimum_wage: '',
    employed: '',
    what_employment: '',
    unemployment_reason: [], // Checkboxes are arrays
    unemployment_other: '',

    // Service Availment
    financial_assistance: '',
    what_assistance: '',
    aware_social_services: '',
    which_social_services: '',
    availed_services: '',
    what_services: '',
    challenges_in_services: [],
    challenges_other: '',

    // General
    strengths: '',
    assessment: '',
    recommended: ''
  });

  // 2. HANDLE STANDARD INPUTS (Text & Radio)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. HANDLE CHECKBOX ARRAYS (For multiple selections)
  const handleCheckboxArray = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const value = e.target.value;
    setFormData((prev: any) => {
      const list = prev[fieldName] as string[];
      if (list.includes(value)) {
        return { ...prev, [fieldName]: list.filter((item) => item !== value) };
      } else {
        return { ...prev, [fieldName]: [...list, value] };
      }
    });
  };

  // 4. SUBMIT TO FIREBASE
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Structure based exactly on your database map
      const newEntry = {
        "Housing Condition": {
          construciton_materials: formData.construction_materials,
          tenure_status: formData.tenure_status === 'g' ? formData.tenure_other : formData.tenure_status,
          has_disability_modifications: formData.has_disability_modifications === 'Yes',
          disability_modification_details: formData.disability_modification_details,
          electricity_supply: formData.electricity_supply === 'h' ? formData.electricity_other : formData.electricity_supply,
          water_supply: formData.water_supply === 'i' ? formData.water_other : formData.water_supply,
          toilet_facility: formData.toilet_facility === 'e' ? formData.toilet_other : formData.toilet_facility,
          toilet_accesible: formData.toilet_accessible === 'Yes',
          garbage_disposal: formData.garbage_disposal === 'i' ? formData.garbage_other : formData.garbage_disposal,
        },
        "Health": {
          vaccinations_completed: formData.vaccinations_completed === 'Yes',
          has_ongoing_conditions: formData.has_ongoing_conditions === 'Yes',
          ongoing_condition_details: formData.ongoing_condition_details,
          health_expenses: {
            food: Number(formData.food_total) || 0, food_remarks: formData.food_remarks,
            maintenance: Number(formData.maint_total) || 0, maintenance_remarks: formData.maint_remarks,
            vitamins_medicine: Number(formData.vitamins_total) || 0, vitamins_remarks: formData.vitamins_remarks,
            other_medicine: Number(formData.othermed_total) || 0, other_related_medicines_remarks: formData.othermed_remarks,
            therapy: Number(formData.therapy_total) || 0, therapy_remarks: formData.therapy_remarks,
            hygeine_needs: Number(formData.hygiene_total) || 0, hygeine_remarks: formData.hygiene_remarks,
            other_needs: Number(formData.otherhealth_total) || 0, other_health_remarks: formData.otherhealth_remarks,
            total: Number(formData.overall_total) || 0,
          },
          services_availed: formData.services_availed === 'Yes',
          services_details: formData.services_details,
          is_facility_accessible: formData.is_facility_accessible === 'Yes',
          has_access_barriers: formData.has_access_barriers === 'Yes',
          access_barrier_details: formData.access_barrier_details,
        },
        "education": {
          is_currently_enrolled: formData.is_currently_enrolled === 'Yes',
          grade_level: formData.grade_level,
          reason_not_enrolled: formData.reason_not_enrolled,
          is_school_accessible: formData.is_school_accessible,
          school_accessibility_details: formData.school_accessibility_details,
          has_sped: formData.has_sped,
          sped_details: formData.sped_details,
          has_accesible_materials: formData.has_accessible_materials,
          accessible_materials_details: formData.accessible_materials_details,
          has_assistive_technology: formData.has_assistive_technology,
          assistive_technology_details: formData.assistive_technology_details,
        },
        "Economic Capacity": {
          primary_source_of_income: formData.primary_source_of_income,
          MinimumWage: formData.minimum_wage,
          employed: formData.employed === 'Yes',
          what_employment: formData.what_employment,
          reason_for_unemployment: formData.unemployment_reason.join(', ') + (formData.unemployment_other ? `, ${formData.unemployment_other}` : ''),
        },
        "Service Availment": {
          financial_assistance: formData.financial_assistance === 'Yes',
          what_assistance: formData.what_assistance,
          aware_social_services: formData.aware_social_services === 'Yes',
          which_social_services: formData.which_social_services,
          availed_services: formData.availed_services === 'Yes',
          what_services: formData.what_services,
          challenges_in_services: formData.challenges_in_services.join(', ') + (formData.challenges_other ? `, ${formData.challenges_other}` : ''),
        },
        "General Observations and Recommendations": {
          Strengths: formData.strengths,
          Assessment: formData.assessment,
          Recommended_Actions_Interventions: formData.recommended,
        }
      };

      const docRef = await addDoc(collection(db, "Profile"), newEntry);
      alert("Assessment Form Successfully Submitted!");
      router.push('/table'); 

    } catch (error) {
      console.error("Error saving data:", error);
      alert("Error saving data. Check console.");
    }
  };

  return (
    <div className="formWrapper">
      <Header subtitle="Aruga Project Profiling and Assessment Details" />

      {/* Back Button */}
      <div className="backButton">
        <button type="button" onClick={() => router.back()}>←</button>
      </div>

      <form className="container" onSubmit={handleSubmit} style={{ paddingTop: '90px' }}>
        
        {/* ======================= I. HOUSING ======================= */}
        <div className="sectionTitle">I. HOUSING, SANITATION AND WATER</div>
        <div className="formSection">
          
          <h3>A. HOUSING CONDITION</h3>
          
          <div className="question"><h4>1. What type of construction materials are the roofs and the outer walls made of?</h4></div>
          <label className="radioOption"><input type="radio" name="construction_materials" value="a" onChange={handleChange} /> a. Makeshift/salvaged/improvised materials</label>
          <label className="radioOption"><input type="radio" name="construction_materials" value="b" onChange={handleChange} /> b. Mixed but predominantly makeshift/salvaged/improvised materials</label>
          <label className="radioOption"><input type="radio" name="construction_materials" value="c" onChange={handleChange} /> c. Light materials such as bamboo/sawali/cogon/nipa but not sturdy and durable</label>
          <label className="radioOption"><input type="radio" name="construction_materials" value="d" onChange={handleChange} /> d. Mixed but predominantly light materials</label>
          <label className="radioOption"><input type="radio" name="construction_materials" value="e" onChange={handleChange} /> e. Strong materials such as concrete/brick/stone</label>
          <label className="radioOption"><input type="radio" name="construction_materials" value="f" onChange={handleChange} /> f. Bamboo/sawali/cogon/nipa but sturdy and durable</label>

          <div className="question"><h4>2. What is the tenure status of the house and lot does the family have?</h4></div>
          <label className="radioOption"><input type="radio" name="tenure_status" value="a" onChange={handleChange} /> a. Own house and lot</label>
          <label className="radioOption"><input type="radio" name="tenure_status" value="b" onChange={handleChange} /> b. Own house, rent-free lot without consent of owner</label>
          <label className="radioOption"><input type="radio" name="tenure_status" value="c" onChange={handleChange} /> c. Own house, rent-free lot with the consent of the owner</label>
          <label className="radioOption"><input type="radio" name="tenure_status" value="d" onChange={handleChange} /> d. Rent-free house and lot without consent of owner</label>
          <label className="radioOption"><input type="radio" name="tenure_status" value="e" onChange={handleChange} /> e. Rent-free house and lot with consent of owner</label>
          <label className="radioOption"><input type="radio" name="tenure_status" value="f" onChange={handleChange} /> f. Rented house and lot for less than three years</label>
          <label className="radioOption">
              <input type="radio" name="tenure_status" value="g" onChange={handleChange} /> g. Own house, rented lot for less than three years &nbsp;&nbsp;&nbsp;
              <input type="text" name="tenure_other" value={formData.tenure_other} onChange={handleChange} className="lineInput" style={{width: '200px'}} />
          </label>

          <div className="question"><h4>3. Are there any modifications in the house to accommodate the child’s disability?</h4></div>
          <label className="radioOption">
              <input type="radio" name="has_disability_modifications" value="Yes" onChange={handleChange} /> a. Yes. Specify: &nbsp;&nbsp;&nbsp;
              <input type="text" name="disability_modification_details" value={formData.disability_modification_details} onChange={handleChange} className="lineInput" style={{width: '200px'}} />
          </label>
          <label className="radioOption"><input type="radio" name="has_disability_modifications" value="No" onChange={handleChange} /> b. No </label>

          <div className="question"><h4>4. What is the main source of electricity in the dwelling place?</h4></div>
          <label className="radioOption"><input type="radio" name="electricity_supply" value="a" onChange={handleChange} /> a. Electric Company</label>
          <label className="radioOption"><input type="radio" name="electricity_supply" value="b" onChange={handleChange} /> b. Generator</label>
          <label className="radioOption"><input type="radio" name="electricity_supply" value="c" onChange={handleChange} /> c. Solar</label>
          <label className="radioOption"><input type="radio" name="electricity_supply" value="d" onChange={handleChange} /> d. Battery</label>
          <label className="radioOption">
              <input type="radio" name="electricity_supply" value="h" onChange={handleChange} /> h. Others, specify: &nbsp;&nbsp;&nbsp;
              <input type="text" name="electricity_other" value={formData.electricity_other} onChange={handleChange} className="lineInput" style={{width: '200px'}} />
          </label>
          <label className="radioOption"><input type="radio" name="electricity_supply" value="f" onChange={handleChange} /> f. None</label>

          <h3>B. WATER SUPPLY</h3>
          <div className="question"><h4>5. What is your family’s main source of water supply?</h4></div>
          <label className="radioOption"><input type="radio" name="water_supply" value="a" onChange={handleChange} /> a. Unprotected spring, lake, river, rain, dug well</label>
          <label className="radioOption"><input type="radio" name="water_supply" value="b" onChange={handleChange} /> b. Commercial sources, e.g., tanker, truck, peddler</label>
          <label className="radioOption"><input type="radio" name="water_supply" value="c" onChange={handleChange} /> c. Source of safe drinking water (but 30 mins to collect)</label>
          <label className="radioOption"><input type="radio" name="water_supply" value="d" onChange={handleChange} /> d. Own use of faucet community water system (gripo)</label>
          <label className="radioOption"><input type="radio" name="water_supply" value="e" onChange={handleChange} /> e. Shared faucet community water system</label>
          <label className="radioOption"><input type="radio" name="water_supply" value="f" onChange={handleChange} /> f. Own use tubed/piped deep well</label>
          <label className="radioOption"><input type="radio" name="water_supply" value="g" onChange={handleChange} /> g. Shared tubed/ piped deep well, tubed/piped shallow well</label>
          <label className="radioOption">
              <input type="radio" name="water_supply" value="i" onChange={handleChange} /> i. Others, specify: &nbsp;&nbsp;&nbsp;
              <input type="text" name="water_other" value={formData.water_other} onChange={handleChange} className="lineInput" style={{width: '200px'}} />
          </label>

          <h3>C. SANITATION</h3>
          <div className="question"><h4>6. What is the main type of toilet facility the family uses? </h4></div>
          <label className="radioOption"><input type="radio" name="toilet_facility" value="a" onChange={handleChange} /> a. Water-sealed, sewer septic tank, used exclusively by the family</label>
          <label className="radioOption"><input type="radio" name="toilet_facility" value="b" onChange={handleChange} /> b. Water-sealed, sewer septic tank, shared</label>
          <label className="radioOption"><input type="radio" name="toilet_facility" value="c" onChange={handleChange} /> c. Closed-pit</label>
          <label className="radioOption"><input type="radio" name="toilet_facility" value="d" onChange={handleChange} /> d. Open pit</label>
          <label className="radioOption">
              <input type="radio" name="toilet_facility" value="e" onChange={handleChange} /> e. Others, specify: &nbsp;&nbsp;&nbsp;
              <input type="text" name="toilet_other" value={formData.toilet_other} onChange={handleChange} className="lineInput" style={{width: '200px'}} />
          </label>

          <div className="question"><h4>7. Is the toilet accessible for the child?</h4></div>
          <label className="radioOption"><input type="radio" name="toilet_accessible" value="Yes" onChange={handleChange} /> a. Yes</label>
          <label className="radioOption"><input type="radio" name="toilet_accessible" value="No" onChange={handleChange} /> b. No</label>

          <div className="question"><h4>8. What is the main system of garbage disposal adopted by the family? </h4></div>
          <label className="radioOption"><input type="radio" name="garbage_disposal" value="a" onChange={handleChange} /> a. Garbage collection</label>
          <label className="radioOption"><input type="radio" name="garbage_disposal" value="b" onChange={handleChange} /> b. Burning</label>
          <label className="radioOption"><input type="radio" name="garbage_disposal" value="c" onChange={handleChange} /> c. Composting</label>
          <label className="radioOption"><input type="radio" name="garbage_disposal" value="d" onChange={handleChange} /> d. Recycling</label>
          <label className="radioOption"><input type="radio" name="garbage_disposal" value="e" onChange={handleChange} /> e. Waste Segregation</label>
          <label className="radioOption"><input type="radio" name="garbage_disposal" value="f" onChange={handleChange} /> f. Pit with cover</label>
          <label className="radioOption"><input type="radio" name="garbage_disposal" value="g" onChange={handleChange} /> g. Pit without cover</label>
          <label className="radioOption"><input type="radio" name="garbage_disposal" value="h" onChange={handleChange} /> h. Throwing of garbage in rivers, vacant lots, etc.</label>
          <label className="radioOption">
              <input type="radio" name="garbage_disposal" value="i" onChange={handleChange} /> i. Others, specify: &nbsp;&nbsp;&nbsp;
              <input type="text" name="garbage_other" value={formData.garbage_other} onChange={handleChange} className="lineInput" style={{width: '200px'}} />
          </label>
        </div>

        {/* ======================= II. HEALTH ======================= */}
        <div className="sectionTitle">II. HEALTH</div>
        <div className="formSection">
          
          <h3>A. GENERAL HEALTH</h3>
          <div className="question"><h4>1. Has the child received all recommended vaccinations?</h4></div>
          <label className="radioOption"><input type="radio" name="vaccinations_completed" value="Yes" onChange={handleChange} /> a. Yes</label>
          <label className="radioOption"><input type="radio" name="vaccinations_completed" value="No" onChange={handleChange} /> b. No</label>

          <div className="question"><h4>2. Does the child have any ongoing health conditions? </h4></div>
          <label className="radioOption">
            <input type="radio" name="has_ongoing_conditions" value="Yes" onChange={handleChange} /> a. Yes. Specify: 
            <input type="text" name="ongoing_condition_details" value={formData.ongoing_condition_details} onChange={handleChange} className="lineInput" style={{marginLeft: '10px'}} />
          </label>
          <label className="radioOption"><input type="radio" name="has_ongoing_conditions" value="No" onChange={handleChange} /> b. No</label>

          <h4>3. Please provide the corresponding health expenses in a month:</h4>
          <table className="healthTable">
            <tbody>
              <tr><th colSpan={2}>AREAS OF CONCERNS</th><th>TOTAL (PER MONTH)</th><th>REMARKS</th></tr>
              <tr>
                <td colSpan={2}>FOOD (E.G. MILK, COOKIES, OATMEAL)</td>
                <td><input type="number" name="food_total" value={formData.food_total} onChange={handleChange} /></td>
                <td><input type="text" name="food_remarks" value={formData.food_remarks} onChange={handleChange} /></td>
              </tr>
              <tr>
                <td rowSpan={3}>MEDICINE</td>
                <td>• MAINTENANCE</td>
                <td><input type="number" name="maint_total" value={formData.maint_total} onChange={handleChange} /></td>
                <td><input type="text" name="maint_remarks" value={formData.maint_remarks} onChange={handleChange} /></td>
              </tr>
              <tr>
                <td>• VITAMINS</td>
                <td><input type="number" name="vitamins_total" value={formData.vitamins_total} onChange={handleChange} /></td>
                <td><input type="text" name="vitamins_remarks" value={formData.vitamins_remarks} onChange={handleChange} /></td>
              </tr>
              <tr>
                <td>• OTHER RELATED MEDICINES</td>
                <td><input type="number" name="othermed_total" value={formData.othermed_total} onChange={handleChange} /></td>
                <td><input type="text" name="othermed_remarks" value={formData.othermed_remarks} onChange={handleChange} /></td>
              </tr>
              <tr>
                <td colSpan={2}>THERAPY (PHYSICAL, OCCUPATIONAL, SPEECH)</td>
                <td><input type="number" name="therapy_total" value={formData.therapy_total} onChange={handleChange} /></td>
                <td><input type="text" name="therapy_remarks" value={formData.therapy_remarks} onChange={handleChange} /></td>
              </tr>
              <tr>
                <td colSpan={2}>HYGIENE RELATED NEEDS</td>
                <td><input type="number" name="hygiene_total" value={formData.hygiene_total} onChange={handleChange} /></td>
                <td><input type="text" name="hygiene_remarks" value={formData.hygiene_remarks} onChange={handleChange} /></td>
              </tr>
              <tr>
                <td colSpan={2}>OTHER HEALTH NEEDS</td>
                <td><input type="number" name="otherhealth_total" value={formData.otherhealth_total} onChange={handleChange} /></td>
                <td><input type="text" name="otherhealth_remarks" value={formData.otherhealth_remarks} onChange={handleChange} /></td>
              </tr>
              <tr>
                <td colSpan={2}><b>OVER-ALL TOTAL</b></td>
                <td><input type="number" name="overall_total" value={formData.overall_total} onChange={handleChange} /></td>
                <td></td>
              </tr>
            </tbody>
          </table>

          <h3>C. ACCESS TO HEALTH SERVICES</h3>
          <div className="question"><h4>1. Has the child availed health services in the past 6 months?</h4></div>
          <label className="radioOption">
            <input type="radio" name="services_availed" value="Yes" onChange={handleChange} /> Yes, What health services availed?: 
            <input type="text" name="services_details" value={formData.services_details} onChange={handleChange} className="lineInput" style={{marginLeft: '10px'}} />
          </label>
          <label className="radioOption"><input type="radio" name="services_availed" value="No" onChange={handleChange} /> No</label>

          <div className="question"><h4>5. Is the health facility accessible for the child?</h4></div>
          <label className="radioOption"><input type="radio" name="is_facility_accessible" value="Yes" onChange={handleChange} /> a. Yes</label>
          <label className="radioOption"><input type="radio" name="is_facility_accessible" value="No" onChange={handleChange} /> b. No</label>

          <div className="question"><h4>6. Are there any barriers to accessing health care services?</h4></div>
          <label className="radioOption">
            <input type="radio" name="has_access_barriers" value="Yes" onChange={handleChange} /> Yes, Specify: 
            <input type="text" name="access_barrier_details" value={formData.access_barrier_details} onChange={handleChange} className="lineInput" style={{marginLeft: '10px'}} />
          </label>
          <label className="radioOption"><input type="radio" name="has_access_barriers" value="No" onChange={handleChange} /> No</label>
        </div>

        {/* ======================= III. EDUCATION ======================= */}
        <div className="sectionTitle">III. EDUCATION</div>
        <div className="formSection">
          
          <h3>A. Educational Status</h3>
          <div className="question"><h4>1. Is the child currently enrolled in school?</h4></div>
          <label className="radioOption">
            <input type="radio" name="is_currently_enrolled" value="Yes" onChange={handleChange} /> a. Yes. Grade/Year Level:
            <input type="text" name="grade_level" value={formData.grade_level} onChange={handleChange} className="lineInput" style={{marginLeft: '10px'}} />
          </label>
          <label className="radioOption">
            <input type="radio" name="is_currently_enrolled" value="No" onChange={handleChange} /> b. No. Why not?
            <input type="text" name="reason_not_enrolled" value={formData.reason_not_enrolled} onChange={handleChange} className="lineInput" style={{marginLeft: '10px'}} />
          </label>

          <h3>B. School Accessibility</h3>
          <div className="question"><h4>2. Is the school equipped with physically accessibility features?</h4></div>
          <label className="radioOption">
            <input type="radio" name="is_school_accessible" value="Yes" onChange={handleChange} /> Yes, Specify: 
            <input type="text" name="school_accessibility_details" value={formData.school_accessibility_details} onChange={handleChange} className="lineInput" style={{marginLeft: '10px'}} />
          </label>
          <label className="radioOption"><input type="radio" name="is_school_accessible" value="No" onChange={handleChange} /> No</label>
          <label className="radioOption"><input type="radio" name="is_school_accessible" value="Not Applicable" onChange={handleChange} /> Not Applicable</label>

          <div className="question"><h4>3. Are there special education programs available?</h4></div>
          <label className="radioOption">
            <input type="radio" name="has_sped" value="Yes" onChange={handleChange} /> a. Yes. Specify:
            <input type="text" name="sped_details" value={formData.sped_details} onChange={handleChange} className="lineInput" style={{marginLeft: '10px'}} />
          </label>
          <label className="radioOption"><input type="radio" name="has_sped" value="No" onChange={handleChange} /> No</label>
          <label className="radioOption"><input type="radio" name="has_sped" value="Not Applicable" onChange={handleChange} /> Not Applicable</label>

          <h3>C. Learning Materials</h3>
          <div className="question"><h4>5. Are there accessible learning materials available for the child?</h4></div>
          <label className="radioOption">
            <input type="radio" name="has_accessible_materials" value="Yes" onChange={handleChange} /> Yes, Specify: 
            <input type="text" name="accessible_materials_details" value={formData.accessible_materials_details} onChange={handleChange} className="lineInput" style={{marginLeft: '10px'}} />
          </label>
          <label className="radioOption"><input type="radio" name="has_accessible_materials" value="No" onChange={handleChange} /> No</label>
          <label className="radioOption"><input type="radio" name="has_accessible_materials" value="Not Applicable" onChange={handleChange} /> Not Applicable</label>

          <div className="question"><h4>6. Does the child have access to assistive technology?</h4></div>
          <label className="radioOption">
            <input type="radio" name="has_assistive_technology" value="Yes" onChange={handleChange} /> Yes, Specify: 
            <input type="text" name="assistive_technology_details" value={formData.assistive_technology_details} onChange={handleChange} className="lineInput" style={{marginLeft: '10px'}} />
          </label>
          <label className="radioOption"><input type="radio" name="has_assistive_technology" value="No" onChange={handleChange} /> No</label>
          <label className="radioOption"><input type="radio" name="has_assistive_technology" value="Not Applicable" onChange={handleChange} /> Not Applicable</label>
        </div>

        {/* ======================= IV. ECONOMIC ======================= */}
        <div className="sectionTitle">IV. ECONOMIC CAPACITY</div>
        <div className="formSection">
          
          <h3>A. Family Income</h3>
          <div className="question"><h4>1. What is the primary source of income for the family?</h4></div>
          <input type="text" className="lineInput" name="primary_source_of_income" value={formData.primary_source_of_income} onChange={handleChange} />

          <div className="question"><h4>2. How much is the approximate monthly income of the family?</h4></div>
          <label className="radioOption"><input type="radio" name="minimum_wage" value="Below minimum wage" onChange={handleChange} /> Below minimum wage</label>
          <label className="radioOption"><input type="radio" name="minimum_wage" value="Minimum Wage" onChange={handleChange} /> Minimum Wage</label>
          <label className="radioOption"><input type="radio" name="minimum_wage" value="Above minimum Wage" onChange={handleChange} /> Above minimum Wage</label>

          <h3>B. Employment</h3>
          <div className="question"><h4>3. Are the parents/guardians employed or have entrepreneurial activities?</h4></div>
          <label className="radioOption">
            <input type="radio" name="employed" value="Yes" onChange={handleChange} /> Yes. Specify: 
            <input type="text" className="lineInput" name="what_employment" value={formData.what_employment} onChange={handleChange} style={{marginLeft: '10px'}} />
          </label>
          
          <label className="radioOption"><input type="radio" name="employed" value="No" onChange={handleChange} /> No</label>
          
          <div style={{ paddingLeft: '25px', marginTop: '10px' }}>
            <p style={{marginBottom: '5px'}}>If not, what is the reason for unemployment?</p>
            <label className="radioOption"><input type="checkbox" value="Lack of Skills" onChange={(e) => handleCheckboxArray(e, 'unemployment_reason')} /> Lack of Skills</label>
            <label className="radioOption"><input type="checkbox" value="Health Reasons" onChange={(e) => handleCheckboxArray(e, 'unemployment_reason')} /> Health Reasons</label>
            <label className="radioOption"><input type="checkbox" value="Caregiving Responsibilities" onChange={(e) => handleCheckboxArray(e, 'unemployment_reason')} /> Caregiving Responsibilities</label>
            <label className="radioOption">
              <input type="checkbox" value="Others" checked={formData.unemployment_other.length > 0} onChange={() => {}} /> 
              Others. Specify: 
              <input type="text" className="lineInput" name="unemployment_other" value={formData.unemployment_other} onChange={handleChange} style={{marginLeft: '10px'}} />
            </label>
          </div>
        </div>

        {/* ======================= V. SERVICE AVAILMENT ======================= */}
        <div className="sectionTitle">V. Service Availment</div>
        <div className="formSection">
          
          <h3>A. Social Services</h3>
          <div className="question"><h4>1. Does the family receive any form of financial assistance?</h4></div>
          <label className="radioOption">
            <input type="radio" name="financial_assistance" value="Yes" onChange={handleChange} /> Yes. Specify:
            <input type="text" className="lineInput" name="what_assistance" value={formData.what_assistance} onChange={handleChange} style={{marginLeft: '10px'}} />
          </label>
          <label className="radioOption"><input type="radio" name="financial_assistance" value="No" onChange={handleChange} /> No</label>

          <div className="question"><h4>2. Is the family aware of available social services?</h4></div>
          <label className="radioOption">
            <input type="radio" name="aware_social_services" value="Yes" onChange={handleChange} /> Yes. Specify:
            <input type="text" className="lineInput" name="which_social_services" value={formData.which_social_services} onChange={handleChange} style={{marginLeft: '10px'}} />
          </label>
          <label className="radioOption"><input type="radio" name="aware_social_services" value="No" onChange={handleChange} /> No</label>

          <div className="question"><h4>3. Has the family availed of any services?</h4></div>
          <label className="radioOption">
            <input type="radio" name="availed_services" value="Yes" onChange={handleChange} /> Yes. Specify:
            <input type="text" className="lineInput" name="what_services" value={formData.what_services} onChange={handleChange} style={{marginLeft: '10px'}} />
          </label>
          <label className="radioOption"><input type="radio" name="availed_services" value="No" onChange={handleChange} /> No</label>

          <h3>B. Barriers to Service Availment</h3>
          <div className="question"><h4>4. What are the challenges faced in availing these services?</h4></div>
          <label className="radioOption"><input type="checkbox" value="Lack of Information" onChange={(e) => handleCheckboxArray(e, 'challenges_in_services')} /> Lack of Information</label>
          <label className="radioOption"><input type="checkbox" value="Distance and transportation" onChange={(e) => handleCheckboxArray(e, 'challenges_in_services')} /> Distance and transportation</label>
          <label className="radioOption"><input type="checkbox" value="Financial Constraints" onChange={(e) => handleCheckboxArray(e, 'challenges_in_services')} /> Financial Constraints</label>
          <label className="radioOption"><input type="checkbox" value="Prejudice and Discrimination" onChange={(e) => handleCheckboxArray(e, 'challenges_in_services')} /> Prejudice and Discrimination</label>
          <label className="radioOption">
            <input type="checkbox" value="Others" checked={formData.challenges_other.length > 0} onChange={() => {}} /> 
            Others, Specify: 
            <input type="text" className="lineInput" name="challenges_other" value={formData.challenges_other} onChange={handleChange} style={{marginLeft: '10px'}} />
          </label>
        </div>

        {/* ======================= VI. RECOMMENDATIONS ======================= */}
        <div className="sectionTitle">VI. General Observations and Recommendations</div>
        <div className="formSection">
          <div className="question"><h4>A. Strengths: (e.g., supportive family, strong community network)</h4></div>
          <input type="text" className="lineInput" name="strengths" value={formData.strengths} onChange={handleChange} style={{width: '100%'}} />

          <div className="question"><h4>B. Assessment:</h4></div>
          <input type="text" className="lineInput" name="assessment" value={formData.assessment} onChange={handleChange} style={{width: '100%'}} />

          <div className="question"><h4>C. Recommended Actions/Interventions</h4></div>
          <input type="text" className="lineInput" name="recommended" value={formData.recommended} onChange={handleChange} style={{width: '100%'}} />
        </div>

        {/* SUBMIT BUTTON */}
        <div className="submitContainer">
          <button type="submit" className="submitBtn">SUBMIT FINAL ASSESSMENT</button>
        </div>

      </form>

      <footer className="footer"><p>2026 CSWDO - Biñan City</p></footer>
    </div>
  );
}