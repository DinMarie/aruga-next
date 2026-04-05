'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import Header from '../../components/Header';


// --- AUTO-CODING DICTIONARIES ---
const codeDictionaries: Record<string, Record<string, string>> = {
    religion: {
        "none": "0", "roman catholic": "1", "islam": "2", "iglesia ni cristo": "3", "aglipay": "4",
        "seventh day adventist": "5", "bible baptist church": "6", "jehova's witness": "7",
        "united methodists church": "8", "tribal religions": "9",
    },
    ip: {
        "non-ip": "0", "aeta": "1", "ati": "2", "badjao": "3", "bago": "4", "batak": "5",
        "bukidnon": "6", "b'laan": "7", "cimaron": "8", "duyonen": "9", "dumagat": "10",
        "ibaloi": "11", "ibanag": "12", "itom": "13", "kankanaey": "14", "mandaya": "15",
        "mangyan": "16", "manobo": "17", "palawano": "18", "pullon": "19", "subanen": "20",
        "tagbanuas": "21", "tau't bato": "22", "teduray": "23", "t'boli": "24",      
    },
    sex: { "male": "1", "female": "2" },
    education: {
        "without formal education": "1", "elementary": "2", "elementary graduate": "3",
        "high school": "4", "high school graduate": "5", "vocational course": "6",
        "vocational course graduate": "7", "college": "8", "college graduate": "9",
        "post college degree": "10"
    },
    disability: {
        "none": "0", "physical": "1", "intellectual": "2", "learning": "3", "visual": "4",
        "mental": "5", "psychosocial": "6", "deaf/hard of hearing": "7",
        "speech and language impairment": "8", "cancer": "9", "rare disease": "10",
    },
    illness: { "none": "0", "cancer": "1", "cardio-vascular disease": "2", "paralysis": "3", "organ failure": "4" }
};

export default function CombinedAddProfilePage() {
  const router = useRouter();
  
  // Single State for the ENTIRE form
  const [formData, setFormData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);

  // Helper to read values safely
  const val = (key: string) => formData[key] || "";

  // Handle standard text and radio inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, name, value, type } = e.target;
    // We use ID first (for the top part of the form) and Name second (for the bottom part)
    // This ensures no database variables get messed up.
    const fieldKey = id || name; 
    let updatedData = { ...formData, [fieldKey]: value };

    // --- AUTO-CODE LOGIC (For top part) ---
    const typedText = value.trim().toLowerCase();
    const applyAutoCode = (inputId: string, codeId: string, category: string, fallbackCode: string) => {
        if (fieldKey === inputId) {
            if (typedText === "") {
                updatedData[codeId] = "";
            } else if (codeDictionaries[category][typedText] !== undefined) {
                updatedData[codeId] = codeDictionaries[category][typedText];
            } else {
                updatedData[codeId] = fallbackCode;
            }
        }
    };

    applyAutoCode("r5_religion", "r5_religion_code", "religion", "10");
    applyAutoCode("r6_ip", "r6_ip_code", "ip", "25");
    applyAutoCode("r7_sex", "r7_sex_code", "sex", "");
    applyAutoCode("r8_educational_attainment", "r8_education_code", "education", "");
    applyAutoCode("r9_disability", "r9_disability_code", "disability", "");
    applyAutoCode("r10_illness", "r10_illness_code", "illness", "5");

    // --- TOGGLE RULES: Clear specify fields if the trigger condition is no longer met (For bottom part) ---
    if (type === 'radio') {
      const rName = name; 
      if (rName === "house_lot" && value !== "Other") updatedData.house_lot_other = "";
      if (rName === "modification" && value !== "Yes") updatedData.modification_specify = "";
      if (rName === "main_source_of_electricity" && value !== "Others") updatedData.electricity_specify = "";
      if (rName === "water_supply" && value !== "Others") updatedData.water_supply_specify = "";
      if (rName === "sanitation" && value !== "Others") updatedData.sanitation_specify = "";
      if (rName === "garbage_disposal" && value !== "Others") updatedData.garbage_disposal_specify = "";
      if (rName === "health_condition" && value !== "Yes") updatedData.health_condition_specify = "";
      if (rName === "health_services" && value !== "Yes") updatedData.health_services_specify = "";
      if (rName === "barriers_accessing_healthcare_services" && value !== "Yes") updatedData.barriers_healthcare_specify = "";
      if (rName === "currently_enrolled" && value !== "Yes") updatedData.enrolled_grade = "";
      if (rName === "currently_enrolled" && value !== "No") updatedData.not_enrolled_reason = "";
      if (rName === "physical_accessibility_features" && value !== "Yes") updatedData.physical_accessibility_specify = "";
      if (rName === "special_education_programs" && value !== "Yes") updatedData.sped_programs_specify = "";
      if (rName === "received_learning_support" && value !== "Yes") updatedData.learning_support_specify = "";
      if (rName === "accessible_learning_materials" && value !== "Yes") updatedData.learning_materials_specify = "";
      if (rName === "assistive_technology" && value !== "Yes") updatedData.assistive_tech_specify = "";
      if (rName === "employed_or_entrepreurial_activities" && value !== "Yes") updatedData.employment_specify = "";
      if (rName === "financial_assistance" && value !== "Yes") updatedData.financial_assistance_specify = "";
      if (rName === "social_services" && value !== "Yes") updatedData.social_services_specify = "";
      if (rName === "availed_any_services" && value !== "Yes") updatedData.availed_services_specify = "";
    }

    setFormData(updatedData);
  };

  // Handle checkboxes (stores multiple selections as comma-separated strings)
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    let currentArray = formData[name] ? formData[name].split(",").map((s: string) => s.trim()).filter(Boolean) : [];
    
    if (checked) {
        currentArray.push(value);
    } else {
        currentArray = currentArray.filter((item: string) => item !== value);
        // Clear specify boxes if "Others" is unchecked
        if (name === "reason_for_unemployment" && value === "Others") setFormData((prev: any) => ({ ...prev, unemployment_reason_specify: "" }));
        if (name === "challenges_faced" && value === "Others") setFormData((prev: any) => ({ ...prev, challenges_faced_specify: "" }));
    }
    
    setFormData({ ...formData, [name]: currentArray.join(", ") });
  };

  // Auto-calculate Overall Total for Health Expenses
  useEffect(() => {
    const fields = ["food_total", "maint_total", "vitamins_total", "othermed_total", "therapy_total", "hygiene_total", "otherhealth_total"];
    let sum = 0;
    fields.forEach(field => {
        const num = parseFloat(String(formData[field] || "0").replace(/,/g, ''));
        if (!isNaN(num)) sum += num;
    });
    setFormData((prev: any) => ({ ...prev, overall_total: sum > 0 ? sum.toString() : "" }));
  }, [
      formData.food_total, formData.maint_total, formData.vitamins_total, 
      formData.othermed_total, formData.therapy_total, formData.hygiene_total, formData.otherhealth_total
  ]);


  // --- SINGLE UNIFIED SUBMIT TO FIREBASE ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
        // Map duplicate/required variables just like your vanilla JS did to maintain database structure
        const finalData = {
            ...formData,
            name: formData.r1_name || "",
            address: formData.r2_address || "",
            contact: formData.r3_contact || "",
            birthday: formData.r4_dob || "",
            religion: formData.r5_religion || "",
            ip: formData.r6_ip || "",
            sex: formData.r7_sex || "",
            educational_attainment: formData.r8_educational_attainment || "",
            disability: formData.r9_disability || "",
            illness: formData.r10_illness || "",
            family_size: formData.h1_family_size || "",
        };

        await addDoc(collection(db, "profiles"), finalData);
        
        alert("Form Saved Successfully!");
        router.push('/table');
    } catch (error: any) {
        console.error("FIREBASE ERROR:", error);
        alert("Error saving data: " + error.message);
    } finally {
        setIsSaving(false);
    }
  };

  return (
   <div className="addWrapper">
      <Header subtitle="Aruga Project Profiling and Assessment Details" />

      <div className="back-button" style={{ position: 'absolute', top: '90px', left: '20px' }}>
        <button onClick={() => router.push('/table')} style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #8c6d8c', background: 'white', color: '#8c6d8c', cursor: 'pointer' }}>←</button>
      </div>

      <div className="container" style={{ width: '80%', margin: '120px auto 0 auto', background: 'white', padding: '30px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
        
        <form onSubmit={handleSubmit}>

            {/* ========================================================= */}
            {/* PART 1: TOP ROW & PROFILES                                */}
            {/* ========================================================= */}
            <div className="topRow" style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <div className="fieldGroup">
                    <label>Date of Interview:</label>
                    <input type="date" id="dateInterview" value={val("dateInterview")} onChange={handleChange} style={{ borderBottom: '1px solid black', marginLeft: '5px' }} />
                </div>
                <div className="fieldGroup">
                    <label>Time Started:</label>
                    <input type="time" id="timeStart" value={val("timeStart")} onChange={handleChange} style={{ borderBottom: '1px solid black', marginLeft: '5px' }} />
                </div>
                <div className="fieldGroup">
                    <label>Time Ended:</label>
                    <input type="time" id="timeEnd" value={val("timeEnd")} onChange={handleChange} style={{ borderBottom: '1px solid black', marginLeft: '5px' }} />
                </div>
            </div>

            <div className="infoSection" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="formRow"><label>Name of Interviewer:</label><input type="text" id="interviewer_name" className="line-input" value={val("interviewer_name")} onChange={handleChange} /></div>
                <div className="formRow"><label>Household ID No.:</label><input type="text" id="household_id" className="line-input" value={val("household_id")} onChange={handleChange} /></div>
                <div className="formRow"><label>Region:</label><input type="text" id="region" className="line-input" value={val("region")} onChange={handleChange} /></div>
                <div className="formRow"><label>Pantawid Member?</label><input type="text" id="pantawid_member" className="line-input" value={val("pantawid_member")} onChange={handleChange} /></div>
                <div className="formRow"><label>Province:</label><input type="text" id="province" className="line-input" value={val("province")} onChange={handleChange} /></div>
                <div className="formRow"><label>Name of Respondent:</label><input type="text" id="respondent_name" className="line-input" value={val("respondent_name")} onChange={handleChange} /></div>
                <div className="formRow"><label>Address:</label><input type="text" id="address" className="line-input" value={val("address")} onChange={handleChange} /></div>
            </div>

            <div className="section-title">CHILD WITH DISABILITY PROFILE</div>
            <table className="profileTable" style={{ width: '100%', marginBottom: '20px' }}>
                <tbody>
                    <tr><td style={{ width: '30px' }}>R1.</td><td style={{ width: '200px' }}>Name:</td><td><input type="text" id="r1_name" style={{ width: '100%', outline: 'none' }} value={val("r1_name")} onChange={handleChange} /></td></tr>
                    <tr><td>R2.</td><td>Address:</td><td><input type="text" id="r2_address" style={{ width: '100%', outline: 'none' }} value={val("r2_address")} onChange={handleChange} /></td></tr>
                    <tr><td>R3.</td><td>Contact Number:</td><td><input type="text" id="r3_contact" style={{ width: '100%', outline: 'none' }} value={val("r3_contact")} onChange={handleChange} /></td></tr>
                    <tr><td>R4.</td><td>Date of Birth:</td><td><input type="date" id="r4_dob" style={{ width: '100%', outline: 'none' }} value={val("r4_dob")} onChange={handleChange} /></td></tr>
                    <tr><td>R5.</td><td>Religion:</td><td><input type="text" id="r5_religion" style={{ width: '100%', outline: 'none' }} value={val("r5_religion")} onChange={handleChange} /></td><td style={{ width: '80px', textAlign: 'right' }}>Code: <input type="text" id="r5_religion_code" style={{ width: '30px' }} value={val("r5_religion_code")} readOnly /></td></tr>
                    <tr><td>R6.</td><td>IP Membership:</td><td><input type="text" id="r6_ip" style={{ width: '100%', outline: 'none' }} value={val("r6_ip")} onChange={handleChange} /></td><td style={{ textAlign: 'right' }}>Code: <input type="text" id="r6_ip_code" style={{ width: '30px' }} value={val("r6_ip_code")} readOnly /></td></tr>
                    <tr><td>R7.</td><td>Sex:</td><td><input type="text" id="r7_sex" style={{ width: '100%', outline: 'none' }} value={val("r7_sex")} onChange={handleChange} /></td><td style={{ textAlign: 'right' }}>Code: <input type="text" id="r7_sex_code" style={{ width: '30px' }} value={val("r7_sex_code")} readOnly /></td></tr>
                    <tr><td>R8.</td><td>Highest Educational Attainment:</td><td><input type="text" id="r8_educational_attainment" style={{ width: '100%', outline: 'none' }} value={val("r8_educational_attainment")} onChange={handleChange} /></td><td style={{ textAlign: 'right' }}>Code: <input type="text" id="r8_education_code" style={{ width: '30px' }} value={val("r8_education_code")} readOnly /></td></tr>
                    <tr><td>R9.</td><td>Disability / Special Needs:</td><td><input type="text" id="r9_disability" style={{ width: '100%', outline: 'none' }} value={val("r9_disability")} onChange={handleChange} /></td><td style={{ textAlign: 'right' }}>Code: <input type="text" id="r9_disability_code" style={{ width: '30px' }} value={val("r9_disability_code")} readOnly /></td></tr>
                    <tr><td>R10.</td><td>Critical Illness:</td><td><input type="text" id="r10_illness" style={{ width: '100%', outline: 'none' }} value={val("r10_illness")} onChange={handleChange} /></td><td style={{ textAlign: 'right' }}>Code: <input type="text" id="r10_illness_code" style={{ width: '30px' }} value={val("r10_illness_code")} readOnly /></td></tr>
                </tbody>
            </table>

            <div className="familySize" style={{ marginBottom: '10px' }}>
                <label>H1. Bilang ng Miyembro (Family Size):</label>
                <input type="number" id="h1_family_size" style={{ border: 'none', borderBottom: '1px solid black', outline: 'none', marginLeft: '5px' }} value={val("h1_family_size")} onChange={handleChange} />
            </div>

            <div className="section-title">FAMILY PROFILE</div>
            <table className="familyTable" style={{ width: '100%', textAlign: 'center', marginBottom: '40px' }}>
                <thead>
                    <tr style={{ background: '#eee' }}>
                        <th style={{ width: '20px' }}></th>
                        <th>H2. Name</th>
                        <th>H3. Relationship to Head</th>
                        <th>H4. Civil Status</th>
                        <th>H5. Age</th>
                        <th>H6. Sex</th>
                        <th>H7. Occupation</th>
                        <th>H8. Occupation Class</th>
                        <th>H9. Disability / Sp. Needs</th>
                        <th>H10. Critical Illness</th>
                        <th>H11. Solo Parent</th>
                    </tr>
                </thead>
                <tbody>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rowNum) => (
                    <tr key={rowNum}>
                        <td style={{ fontWeight: 'bold' }}>{rowNum}.</td>
                        <td><input type="text" id={`fam_${rowNum}_name`} style={{ width: '100%', outline: 'none' }} value={val(`fam_${rowNum}_name`)} onChange={handleChange} /></td>
                        <td><input type="text" id={`fam_${rowNum}_relationship`} style={{ width: '100%', outline: 'none' }} value={val(`fam_${rowNum}_relationship`)} onChange={handleChange} /></td>
                        <td><input type="text" id={`fam_${rowNum}_civil_status`} style={{ width: '100%', outline: 'none' }} value={val(`fam_${rowNum}_civil_status`)} onChange={handleChange} /></td>
                        <td><input type="number" id={`fam_${rowNum}_age`} style={{ width: '100%', outline: 'none' }} value={val(`fam_${rowNum}_age`)} onChange={handleChange} /></td>
                        <td><input type="text" id={`fam_${rowNum}_sex`} style={{ width: '100%', outline: 'none' }} value={val(`fam_${rowNum}_sex`)} onChange={handleChange} /></td>
                        <td><input type="text" id={`fam_${rowNum}_occupation`} style={{ width: '100%', outline: 'none' }} value={val(`fam_${rowNum}_occupation`)} onChange={handleChange} /></td>
                        <td><input type="text" id={`fam_${rowNum}_occ_class`} style={{ width: '100%', outline: 'none' }} value={val(`fam_${rowNum}_occ_class`)} onChange={handleChange} /></td>
                        <td><input type="text" id={`fam_${rowNum}_disability`} style={{ width: '100%', outline: 'none' }} value={val(`fam_${rowNum}_disability`)} onChange={handleChange} /></td>
                        <td><input type="text" id={`fam_${rowNum}_illness`} style={{ width: '100%', outline: 'none' }} value={val(`fam_${rowNum}_illness`)} onChange={handleChange} /></td>
                        <td><input type="text" id={`fam_${rowNum}_solo_parent`} style={{ width: '100%', outline: 'none' }} value={val(`fam_${rowNum}_solo_parent`)} onChange={handleChange} /></td>
                    </tr>
                    ))}
                </tbody>
            </table>

            {/* ========================================================= */}
            {/* PART 2: ASSESSMENT QUESTIONS                              */}
            {/* ========================================================= */}

            <div className="section-title">I. HOUSING, SANITATION AND WATER</div>
            <div className="form-section">
                <h3>A. HOUSING CONDITION</h3>
                
                <div className="question"><h4>1. What type of construction materials are the roofs and the outer walls made of?</h4></div>
                {["Makeshift/salvaged/improvised materials", "Mixed but predominantly makeshift/salvaged", "Light materials such as bamboo/sawali/cogon/nipa but not sturdy and durable", "Mixed but predominantly light materials", "Strong materials such as concrete/brick/stone or wood or half galvanized iron and half concrete or galvanized iron/aluminum or glass", "Bamboo/sawali/cogon/nipa but sturdy and durable"].map((opt, i) => (
                    <label className="radio-option" key={i}>
                        <input type="radio" name="housing_material" value={opt} checked={val("housing_material") === opt} onChange={handleChange} /> {String.fromCharCode(97 + i)}. {opt}
                    </label>
                ))}

                <div className="question"><h4>2. What is the tenure status of the house and lot does the family have?</h4></div>
                {["Own house and lot", "Own house, rent-free lot without consent of owner", "Own house, rent-free lot with the consent of the owner", "Rent-free house and lot without consent of owner", "Rent-free house and lot with consent of owner", "Rented house and lot for less than three years", "Own house, rented lot for less than three years", "Other"].map((opt, i) => (
                    <label className="radio-option" key={i}>
                        <input type="radio" name="house_lot" value={opt} checked={val("house_lot") === opt} onChange={handleChange} /> {String.fromCharCode(97 + i)}. {opt}
                        {opt === "Other" && <input type="text" name="house_lot_other" className="line-input" style={{ marginLeft: '10px' }} disabled={val("house_lot") !== "Other"} value={val("house_lot_other")} onChange={handleChange} />}
                    </label>
                ))}

                <div className="question"><h4>3. Are there any modifications in the house to accommodate the child's disability?</h4></div>
                <label className="radio-option"><input type="radio" name="modification" value="Yes" checked={val("modification") === "Yes"} onChange={handleChange} /> a. Yes. Specify: <input type="text" name="modification_specify" className="line-input" disabled={val("modification") !== "Yes"} value={val("modification_specify")} onChange={handleChange} /></label>
                <label className="radio-option"><input type="radio" name="modification" value="No" checked={val("modification") === "No"} onChange={handleChange} /> b. No</label>

                <div className="question"><h4>4. What is the main source of electricity in the dwelling place?</h4></div>
                {["Electric Company", "Generator", "Solar", "Battery", "Others", "None"].map((opt, i) => (
                    <label className="radio-option" key={i}>
                        <input type="radio" name="main_source_of_electricity" value={opt} checked={val("main_source_of_electricity") === opt} onChange={handleChange} /> {String.fromCharCode(97 + i)}. {opt}
                        {opt === "Others" && <input type="text" name="electricity_specify" className="line-input" style={{ marginLeft: '10px' }} disabled={val("main_source_of_electricity") !== "Others"} value={val("electricity_specify")} onChange={handleChange} />}
                    </label>
                ))}

                <h3>B. WATER SUPPLY</h3>
                <div className="question"><h4>5. What is your family’s main source of water supply?</h4></div>
                {["Unprotected spring, lake, river, rain, dug well", "Commercial sources, e.g., tanker, truck, peddler (except bottled water)", "Source of safe drinking water but the time to collect water including the time to walk to the water source, collect it and return is longer than 30 minutes.", "Own use of faucet community water system (gripo)", "Shared faucet community water system", "Own use tubed/piped deep well", "Shared tubed/ piped deep well, tubed/piped shallow well", "Bought bottled water including those being delivered", "Others"].map((opt, i) => (
                    <label className="radio-option" key={i}>
                        <input type="radio" name="water_supply" value={opt} checked={val("water_supply") === opt} onChange={handleChange} /> {String.fromCharCode(97 + i)}. {opt}
                        {opt === "Others" && <input type="text" name="water_supply_specify" className="line-input" style={{ marginLeft: '10px' }} disabled={val("water_supply") !== "Others"} value={val("water_supply_specify")} onChange={handleChange} />}
                    </label>
                ))}

                <h3>C. SANITATION</h3>
                <div className="question"><h4>6. What is the main type of toilet facility the family uses?</h4></div>
                {["Water-sealed, sewer septic tank, used exclusively by the family", "Water-sealed, sewer septic tank, shared with other families", "Closed pit", "Open pit", "Others", "None"].map((opt, i) => (
                    <label className="radio-option" key={i}>
                        <input type="radio" name="sanitation" value={opt} checked={val("sanitation") === opt} onChange={handleChange} /> {String.fromCharCode(97 + i)}. {opt}
                        {opt === "Others" && <input type="text" name="sanitation_specify" className="line-input" style={{ marginLeft: '10px' }} disabled={val("sanitation") !== "Others"} value={val("sanitation_specify")} onChange={handleChange} />}
                    </label>
                ))}

                <div className="question"><h4>7. Is the toilet accessible for the child?</h4></div>
                <label className="radio-option"><input type="radio" name="accessible_toilet" value="Yes" checked={val("accessible_toilet") === "Yes"} onChange={handleChange} /> a. Yes</label>
                <label className="radio-option"><input type="radio" name="accessible_toilet" value="No" checked={val("accessible_toilet") === "No"} onChange={handleChange} /> b. No</label>

                <div className="question"><h4>8. What is the main system of garbage disposal adopted by the family?</h4></div>
                {["Garbage collection", "Burning", "Composting", "Recycling", "Waste Segregation", "Pit with cover", "Pit without cover", "Throwing of garbage in rivers, vacant lots, etc.", "Others"].map((opt, i) => (
                    <label className="radio-option" key={i}>
                        <input type="radio" name="garbage_disposal" value={opt} checked={val("garbage_disposal") === opt} onChange={handleChange} /> {String.fromCharCode(97 + i)}. {opt}
                        {opt === "Others" && <input type="text" name="garbage_disposal_specify" className="line-input" style={{ marginLeft: '10px' }} disabled={val("garbage_disposal") !== "Others"} value={val("garbage_disposal_specify")} onChange={handleChange} />}
                    </label>
                ))}
            </div>

            <div className="section-title">II. HEALTH</div>
            <div className="form-section">
                <h3>A. GENERAL HEALTH</h3>
                <div className="question"><h4>1. Has the child received all recommended vaccinations?</h4></div>
                <label className="radio-option"><input type="radio" name="received_vaccination" value="Yes" checked={val("received_vaccination") === "Yes"} onChange={handleChange} /> a. Yes</label>
                <label className="radio-option"><input type="radio" name="received_vaccination" value="No" checked={val("received_vaccination") === "No"} onChange={handleChange} /> b. No</label>

                <div className="question"><h4>2. Does the child have any ongoing health conditions?</h4></div>
                <label className="radio-option"><input type="radio" name="health_condition" value="Yes" checked={val("health_condition") === "Yes"} onChange={handleChange} /> a. Yes. Specify: <input type="text" name="health_condition_specify" className="line-input" disabled={val("health_condition") !== "Yes"} value={val("health_condition_specify")} onChange={handleChange} /></label>
                <label className="radio-option"><input type="radio" name="health_condition" value="No" checked={val("health_condition") === "No"} onChange={handleChange} /> b. No</label>

                <h4>3. Corresponding health expenses in a month:</h4>
                <table className="health-table">
                    <thead>
                        <tr><th colSpan={2}>AREAS OF CONCERNS</th><th>TOTAL (PER MONTH)</th><th>REMARKS</th></tr>
                    </thead>
                    <tbody>
                        <tr><td colSpan={2}>FOOD (E.G. MILK, COOKIES, OATMEAL, ETC)</td><td><input type="number" name="food_total" value={val("food_total")} onChange={handleChange} /></td><td><input type="text" name="food_remarks" value={val("food_remarks")} onChange={handleChange} /></td></tr>
                        <tr><td rowSpan={3}>MEDICINE</td><td>• MAINTENANCE</td><td><input type="number" name="maint_total" value={val("maint_total")} onChange={handleChange} /></td><td><input type="text" name="maint_remarks" value={val("maint_remarks")} onChange={handleChange} /></td></tr>
                        <tr><td>• VITAMINS</td><td><input type="number" name="vitamins_total" value={val("vitamins_total")} onChange={handleChange} /></td><td><input type="text" name="vitamins_remarks" value={val("vitamins_remarks")} onChange={handleChange} /></td></tr>
                        <tr><td>• OTHER RELATED MEDICINES</td><td><input type="number" name="othermed_total" value={val("othermed_total")} onChange={handleChange} /></td><td><input type="text" name="othermed_remarks" value={val("othermed_remarks")} onChange={handleChange} /></td></tr>
                        <tr><td colSpan={2}>THERAPY (PHYSICAL, OCCUPATIONAL, SPEECH)</td><td><input type="number" name="therapy_total" value={val("therapy_total")} onChange={handleChange} /></td><td><input type="text" name="therapy_remarks" value={val("therapy_remarks")} onChange={handleChange} /></td></tr>
                        <tr><td colSpan={2}>HYGIENE RELATED NEEDS</td><td><input type="number" name="hygiene_total" value={val("hygiene_total")} onChange={handleChange} /></td><td><input type="text" name="hygiene_remarks" value={val("hygiene_remarks")} onChange={handleChange} /></td></tr>
                        <tr><td colSpan={2}>OTHER HEALTH NEEDS</td><td><input type="number" name="otherhealth_total" value={val("otherhealth_total")} onChange={handleChange} /></td><td><input type="text" name="otherhealth_remarks" value={val("otherhealth_remarks")} onChange={handleChange} /></td></tr>
                        <tr><td colSpan={2}><b>OVER-ALL TOTAL</b></td><td><input type="text" name="overall_total" value={val("overall_total")} readOnly style={{background: '#eee', fontWeight: 'bold'}} /></td><td></td></tr>
                    </tbody>
                </table>

                <h3>C. ACCESS TO HEALTH SERVICES</h3>
                <div className="question"><h4>4. Has the child availed health services in the past 6 months?</h4></div>
                <label className="radio-option"><input type="radio" name="health_services" value="Yes" checked={val("health_services") === "Yes"} onChange={handleChange} /> a. Yes. Specify: <input type="text" name="health_services_specify" className="line-input" disabled={val("health_services") !== "Yes"} value={val("health_services_specify")} onChange={handleChange} /></label>
                <label className="radio-option"><input type="radio" name="health_services" value="No" checked={val("health_services") === "No"} onChange={handleChange} /> b. No</label>

                <div className="question"><h4>5. Is the health facility accessible for the child?</h4></div>
                <label className="radio-option"><input type="radio" name="facility_accessible" value="Yes" checked={val("facility_accessible") === "Yes"} onChange={handleChange} /> a. Yes</label>
                <label className="radio-option"><input type="radio" name="facility_accessible" value="No" checked={val("facility_accessible") === "No"} onChange={handleChange} /> b. No</label>

                <div className="question"><h4>6. Are there any barriers to accessing health care services?</h4></div>
                <label className="radio-option"><input type="radio" name="barriers_accessing_healthcare_services" value="Yes" checked={val("barriers_accessing_healthcare_services") === "Yes"} onChange={handleChange} /> a. Yes. Specify: <input type="text" name="barriers_healthcare_specify" className="line-input" disabled={val("barriers_accessing_healthcare_services") !== "Yes"} value={val("barriers_healthcare_specify")} onChange={handleChange} /></label>
                <label className="radio-option"><input type="radio" name="barriers_accessing_healthcare_services" value="No" checked={val("barriers_accessing_healthcare_services") === "No"} onChange={handleChange} /> b. No</label>
            </div>

            <div className="section-title">III. EDUCATION</div>
            <div className="form-section">
                <h3>A. Educational Status</h3>
                <div className="question"><h4>1. Is the child currently enrolled in school?</h4></div>
                <label className="radio-option"><input type="radio" name="currently_enrolled" value="Yes" checked={val("currently_enrolled") === "Yes"} onChange={handleChange} /> a. Yes. Grade/Year Level: <input type="text" name="enrolled_grade" className="line-input" disabled={val("currently_enrolled") !== "Yes"} value={val("enrolled_grade")} onChange={handleChange} /></label>
                <label className="radio-option"><input type="radio" name="currently_enrolled" value="No" checked={val("currently_enrolled") === "No"} onChange={handleChange} /> b. No. Why not?: <input type="text" name="not_enrolled_reason" className="line-input" disabled={val("currently_enrolled") !== "No"} value={val("not_enrolled_reason")} onChange={handleChange} /></label>

                <h3>B. School Accessibility</h3>
                <div className="question"><h4>2. Is the school equipped with physically accessibility features?</h4></div>
                {["Yes", "No", "Not Applicable"].map(opt => (
                    <label className="radio-option" key={opt}>
                        <input type="radio" name="physical_accessibility_features" value={opt} checked={val("physical_accessibility_features") === opt} onChange={handleChange} /> {opt}
                        {opt === "Yes" && <input type="text" name="physical_accessibility_specify" className="line-input" style={{ marginLeft: '10px' }} disabled={val("physical_accessibility_features") !== "Yes"} value={val("physical_accessibility_specify")} onChange={handleChange} />}
                    </label>
                ))}

                <div className="question"><h4>3. Are there special education programs available?</h4></div>
                {["Yes", "No", "Not Applicable"].map(opt => (
                    <label className="radio-option" key={opt}>
                        <input type="radio" name="special_education_programs" value={opt} checked={val("special_education_programs") === opt} onChange={handleChange} /> {opt}
                        {opt === "Yes" && <input type="text" name="sped_programs_specify" className="line-input" style={{ marginLeft: '10px' }} disabled={val("special_education_programs") !== "Yes"} value={val("sped_programs_specify")} onChange={handleChange} />}
                    </label>
                ))}

                <div className="question"><h4>4. Does the child receive any learning support?</h4></div>
                {["Yes", "No", "Not Applicable"].map(opt => (
                    <label className="radio-option" key={opt}>
                        <input type="radio" name="received_learning_support" value={opt} checked={val("received_learning_support") === opt} onChange={handleChange} /> {opt}
                        {opt === "Yes" && <input type="text" name="learning_support_specify" className="line-input" style={{ marginLeft: '10px' }} disabled={val("received_learning_support") !== "Yes"} value={val("learning_support_specify")} onChange={handleChange} />}
                    </label>
                ))}

                <h3>C. Learning Materials</h3>
                <div className="question"><h4>5. Are there accessible learning materials available?</h4></div>
                {["Yes", "No", "Not Applicable"].map(opt => (
                    <label className="radio-option" key={opt}>
                        <input type="radio" name="accessible_learning_materials" value={opt} checked={val("accessible_learning_materials") === opt} onChange={handleChange} /> {opt}
                        {opt === "Yes" && <input type="text" name="learning_materials_specify" className="line-input" style={{ marginLeft: '10px' }} disabled={val("accessible_learning_materials") !== "Yes"} value={val("learning_materials_specify")} onChange={handleChange} />}
                    </label>
                ))}

                <div className="question"><h4>6. Does the child have access to assistive technology?</h4></div>
                {["Yes", "No", "Not Applicable"].map(opt => (
                    <label className="radio-option" key={opt}>
                        <input type="radio" name="assistive_technology" value={opt} checked={val("assistive_technology") === opt} onChange={handleChange} /> {opt}
                        {opt === "Yes" && <input type="text" name="assistive_tech_specify" className="line-input" style={{ marginLeft: '10px' }} disabled={val("assistive_technology") !== "Yes"} value={val("assistive_tech_specify")} onChange={handleChange} />}
                    </label>
                ))}
            </div>

            <div className="section-title">IV. ECONOMIC CAPACITY</div>
            <div className="form-section">
                <h3>A. Family Income</h3>
                <div className="question"><h4>1. What is the primary source of income for the family?</h4></div>
                <input type="text" className="line-input" name="income_source" value={val("income_source")} onChange={handleChange} style={{ marginLeft: '25px' }}/>

                <div className="question"><h4>2. How much is the approximate monthly income of the family?</h4></div>
                {["Below minimum wage", "Minimum wage", "Above minimum wage"].map((opt) => (
                    <label className="radio-option" key={opt}>
                        <input type="radio" name="monthly_income" value={opt} checked={val("monthly_income") === opt} onChange={handleChange} /> {opt}
                    </label>
                ))}

                <h3>B. Employment</h3>
                <div className="question"><h4>3. Are the parents/guardians employed or have entrepreneurial activities?</h4></div>
                <label className="radio-option"><input type="radio" name="employed_or_entrepreurial_activities" value="Yes" checked={val("employed_or_entrepreurial_activities") === "Yes"} onChange={handleChange} /> a. Yes. Specify: <input type="text" name="employment_specify" className="line-input" disabled={val("employed_or_entrepreurial_activities") !== "Yes"} value={val("employment_specify")} onChange={handleChange} /></label>
                <label className="radio-option"><input type="radio" name="employed_or_entrepreurial_activities" value="No" checked={val("employed_or_entrepreurial_activities") === "No"} onChange={handleChange} /> b. No</label>

                <p style={{ marginLeft: '25px', marginTop: '15px' }}>If not, what is the reason for unemployment?</p>
                {["Lack of skills", "Health reasons", "Caregiving responsibilities", "Others"].map((opt) => (
                    <label className="radio-option" key={opt}>
                        <input type="checkbox" name="reason_for_unemployment" value={opt} checked={val("reason_for_unemployment").includes(opt)} onChange={handleCheckboxChange} /> {opt}
                        {opt === "Others" && <input type="text" name="unemployment_reason_specify" className="line-input" style={{ marginLeft: '10px' }} disabled={!val("reason_for_unemployment").includes("Others")} value={val("unemployment_reason_specify")} onChange={handleChange} />}
                    </label>
                ))}
            </div>

            <div className="section-title">V. Service Availment</div>
            <div className="form-section">
                <h3>A. Social Services</h3>
                <div className="question"><h4>1. Does the family receive any form of financial assistance?</h4></div>
                <label className="radio-option"><input type="radio" name="financial_assistance" value="Yes" checked={val("financial_assistance") === "Yes"} onChange={handleChange} /> a. Yes. Specify: <input type="text" name="financial_assistance_specify" className="line-input" disabled={val("financial_assistance") !== "Yes"} value={val("financial_assistance_specify")} onChange={handleChange} /></label>
                <label className="radio-option"><input type="radio" name="financial_assistance" value="No" checked={val("financial_assistance") === "No"} onChange={handleChange} /> b. No</label>

                <div className="question"><h4>2. Is the family aware of available social services for children with disabilities?</h4></div>
                <label className="radio-option"><input type="radio" name="social_services" value="Yes" checked={val("social_services") === "Yes"} onChange={handleChange} /> a. Yes. Specify: <input type="text" name="social_services_specify" className="line-input" disabled={val("social_services") !== "Yes"} value={val("social_services_specify")} onChange={handleChange} /></label>
                <label className="radio-option"><input type="radio" name="social_services" value="No" checked={val("social_services") === "No"} onChange={handleChange} /> b. No</label>

                <div className="question"><h4>3. Has the family availed of any services (therapy, financial support, etc.)?</h4></div>
                <label className="radio-option"><input type="radio" name="availed_any_services" value="Yes" checked={val("availed_any_services") === "Yes"} onChange={handleChange} /> a. Yes. Specify: <input type="text" name="availed_services_specify" className="line-input" disabled={val("availed_any_services") !== "Yes"} value={val("availed_services_specify")} onChange={handleChange} /></label>
                <label className="radio-option"><input type="radio" name="availed_any_services" value="No" checked={val("availed_any_services") === "No"} onChange={handleChange} /> b. No</label>

                <h3>B. Barriers to Service Availment</h3>
                <div className="question"><h4>4. What are the challenges faced in availing these services?</h4></div>
                {["Lack of information", "Distance and transportation", "Financial constraints", "Prejudice and discrimination", "Others"].map((opt) => (
                    <label className="radio-option" key={opt}>
                        <input type="checkbox" name="challenges_faced" value={opt} checked={val("challenges_faced").includes(opt)} onChange={handleCheckboxChange} /> {opt}
                        {opt === "Others" && <input type="text" name="challenges_faced_specify" className="line-input" style={{ marginLeft: '10px' }} disabled={!val("challenges_faced").includes("Others")} value={val("challenges_faced_specify")} onChange={handleChange} />}
                    </label>
                ))}
            </div>

            <div className="section-title">VI. General Observations and Recommendations</div>
            <div className="form-section">
                <div className="question"><h4>A. Strengths: (e.g., supportive family, strong community network)</h4></div>
                <input type="text" className="line-input" name="strengths" value={val("strengths")} onChange={handleChange} style={{ marginLeft: '25px', width: '90%' }}/>

                <div className="question"><h4>B. Assessment:</h4></div>
                <input type="text" className="line-input" name="assessment" value={val("assessment")} onChange={handleChange} style={{ marginLeft: '25px', width: '90%' }}/>

                <div className="question"><h4>C. Recommended Actions/Interventions</h4></div>
                <input type="text" className="line-input" name="recommended" value={val("recommended")} onChange={handleChange} style={{ marginLeft: '25px', width: '90%' }}/>
            </div>

            <div className="submit-container" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '40px', paddingRight: '20%' }}>
                <button type="submit" disabled={isSaving} style={{ background: '#6cc04a', color: 'white', padding: '12px 40px', borderRadius: '25px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                    {isSaving ? "SAVING..." : "SUBMIT FORM"}
                </button>
            </div>

        </form>
      </div>

    </div>
  );
}