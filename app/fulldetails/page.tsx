"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

const codeDictionaries: Record<string, Record<string, string>> = {
  religion: {
    none: "0",
    "roman catholic": "1",
    islam: "2",
    "iglesia ni cristo": "3",
    aglipay: "4",
    "seventh day adventist": "5",
    "bible baptist church": "6",
    "jehova's witness": "7",
    "united methodists church": "8",
    "tribal religions": "9",
  },
  ip: {
    "non-ip": "0",
    aeta: "1",
    ati: "2",
    badjao: "3",
    bago: "4",
    batak: "5",
    bukidnon: "6",
    "b'laan": "7",
    cimaron: "8",
    duyonen: "9",
    dumagat: "10",
    ibaloi: "11",
    ibanag: "12",
    itom: "13",
    kankanaey: "14",
    mandaya: "15",
    mangyan: "16",
    manobo: "17",
    palawano: "18",
    pullon: "19",
    subanen: "20",
    tagbanuas: "21",
    "tau't bato": "22",
    teduray: "23",
    "t'boli": "24",
  },
  sex: { male: "1", female: "2" },
  education: {
    "without formal education": "1",
    elementary: "2",
    "elementary graduate": "3",
    "high school": "4",
    "high school graduate": "5",
    "vocational course": "6",
    "vocational course graduate": "7",
    college: "8",
    "college graduate": "9",
    "post college degree": "10",
  },
  disability: {
    none: "0",
    physical: "1",
    intellectual: "2",
    learning: "3",
    visual: "4",
    mental: "5",
    psychosocial: "6",
    "deaf/hard of hearing": "7",
    "speech and language impairment": "8",
    cancer: "9",
    "rare disease": "10",
  },
  illness: {
    none: "0",
    cancer: "1",
    "cardio-vascular disease": "2",
    paralysis: "3",
    "organ failure": "4",
  },
};

const barangaysList = [
  "Biñan",
  "Bungahan",
  "Canlalay",
  "Casile",
  "De La Paz",
  "Ganado",
  "Langkiwa",
  "Loma",
  "Malaban",
  "Malamig",
  "Mampalasan",
  "Platero",
  "Poblacion",
  "San Antonio",
  "San Francisco",
  "San Jose",
  "San Vicente",
  "Santo Domingo",
  "Santo Niño",
  "Santo Tomas",
  "Soro-Soro",
  "Timbao",
  "Tubigan",
  "Zapote",
];
const religionOptions = [
  "None",
  "Roman Catholic",
  "Islam",
  "Iglesia ni Cristo",
  "Aglipay",
  "Seventh Day Adventist",
  "Bible Baptist Church",
  "Jehova's Witness",
  "United Methodists Church",
  "Tribal Religions",
];
const ipOptions = [
  "Non-IP",
  "Aeta",
  "Ati",
  "Badjao",
  "Bago",
  "Batak",
  "Bukidnon",
  "B'laan",
  "Cimaron",
  "Duyonen",
  "Dumagat",
  "Ibaloi",
  "Ibanag",
  "Itom",
  "Kankanaey",
  "Mandaya",
  "Mangyan",
  "Manobo",
  "Palawano",
  "Pullon",
  "Subanen",
  "Tagbanuas",
  "Tau't Bato",
  "Teduray",
  "T'boli",
];
const sexOptions = ["Male", "Female"];
const educationOptions = [
  "Without Formal Education",
  "Elementary",
  "Elementary Graduate",
  "High School",
  "High School Graduate",
  "Vocational Course",
  "Vocational Course Graduate",
  "College",
  "College Graduate",
  "Post College Degree",
];
const disabilityOptions = [
  "None",
  "Physical",
  "Intellectual",
  "Learning",
  "Visual",
  "Mental",
  "Psychosocial",
  "Deaf/Hard of Hearing",
  "Speech and Language Impairment",
  "Cancer",
  "Rare Disease",
];
const illnessOptions = [
  "None",
  "Cancer",
  "Cardio-vascular disease",
  "Paralysis",
  "Organ Failure",
];

// ✅ ADDED: Combobox Component
function Combobox({
  name,
  id,
  value,
  options,
  placeholder,
  onChange,
  variant = "default",
  hideIcon = false,
}: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [filtered, setFiltered] = useState<string[]>(options);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    function handleScroll(event: any) {
      if (wrapperRef.current && wrapperRef.current.contains(event.target))
        return;
      setIsOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, []);

  const handleInputChange = (e: any) => {
    const val = e.target.value;
    onChange(e);
    setFiltered(
      options.filter((o: string) =>
        o.toLowerCase().includes(val.toLowerCase()),
      ),
    );
    setIsOpen(true);
  };

  const handleSelect = (option: string) => {
    onChange({ target: { name, id, value: option, type: "text" } });
    setIsOpen(false);
  };

  const handleKeyDown = (e: any) => {
    if (e.key === "Tab" && isOpen && filtered.length > 0) {
      onChange({ target: { name, id, value: filtered[0], type: "text" } });
      setIsOpen(false);
    }
  };

  let inputClass = "combo-input";
  if (variant === "line") inputClass += " line-input";
  if (variant === "table") inputClass += " table-input";

  return (
    <div ref={wrapperRef} className="combo-wrapper">
      <input
        type="text"
        id={id}
        name={name}
        className={inputClass}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          setFiltered(options);
          setIsOpen(true);
        }}
        placeholder={placeholder}
        autoComplete="off"
        style={hideIcon ? { paddingRight: "0px" } : {}}
      />
      {!hideIcon && <span className="combo-icon">▼</span>}
      {isOpen && filtered.length > 0 && (
        <ul className="combo-menu">
          {filtered.map((opt, i) => (
            <li
              key={i}
              onClick={() => handleSelect(opt)}
              className="combo-item"
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FullDetailsEditContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const docId = searchParams.get("id");

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "loading";
  } | null>(null);

  useEffect(() => {
    if (!docId) {
      setNotification({ message: "❌ No Profile ID found.", type: "error" });
      setTimeout(() => router.push("/table"), 1500);
      return;
    }
    const fetchProfile = async () => {
      try {
        const docSnap = await getDoc(doc(db, "profiles", docId));
        if (docSnap.exists()) setFormData(docSnap.data());
      } catch (error) {
        console.error("Error fetching document:", error);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchProfile();
  }, [docId, router]);

  const val = (key: string) => formData[key] || "";

  const nextStep = () => {
    setCurrentStep((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { id, name, value, type } = e.target;
    const fieldKey = id || name;
    let updatedData = { ...formData, [fieldKey]: value };

    const typedText = value.trim().toLowerCase();
    const applyAutoCode = (
      inputId: string,
      codeId: string,
      category: string,
      fallbackCode: string,
    ) => {
      if (fieldKey === inputId) {
        if (typedText === "") updatedData[codeId] = "";
        else if (codeDictionaries[category][typedText] !== undefined)
          updatedData[codeId] = codeDictionaries[category][typedText];
        else updatedData[codeId] = fallbackCode;
      }
    };

    applyAutoCode("r5_religion", "r5_religion_code", "religion", "10");
    applyAutoCode("r6_ip", "r6_ip_code", "ip", "25");
    applyAutoCode("r7_sex", "r7_sex_code", "sex", "");
    applyAutoCode(
      "r8_educational_attainment",
      "r8_education_code",
      "education",
      "",
    );
    applyAutoCode("r9_disability", "r9_disability_code", "disability", "");
    applyAutoCode("r10_illness", "r10_illness_code", "illness", "5");

    if (type === "radio") {
      const rName = name;
      if (rName === "house_lot" && value !== "Other")
        updatedData.house_lot_other = "";
      if (rName === "modification" && value !== "Yes")
        updatedData.modification_specify = "";
      if (rName === "main_source_of_electricity" && value !== "Others")
        updatedData.electricity_specify = "";
      if (rName === "water_supply" && value !== "Others")
        updatedData.water_supply_specify = "";
      if (rName === "sanitation" && value !== "Others")
        updatedData.sanitation_specify = "";
      if (rName === "garbage_disposal" && value !== "Others")
        updatedData.garbage_disposal_specify = "";
      if (rName === "health_condition" && value !== "Yes")
        updatedData.health_condition_specify = "";
      if (rName === "health_services" && value !== "Yes")
        updatedData.health_services_specify = "";
      if (rName === "barriers_accessing_healthcare_services" && value !== "Yes")
        updatedData.barriers_healthcare_specify = "";
      if (rName === "currently_enrolled" && value !== "Yes")
        updatedData.enrolled_grade = "";
      if (rName === "currently_enrolled" && value !== "No")
        updatedData.not_enrolled_reason = "";
      if (rName === "physical_accessibility_features" && value !== "Yes")
        updatedData.physical_accessibility_specify = "";
      if (rName === "special_education_programs" && value !== "Yes")
        updatedData.sped_programs_specify = "";
      if (rName === "received_learning_support" && value !== "Yes")
        updatedData.learning_support_specify = "";
      if (rName === "accessible_learning_materials" && value !== "Yes")
        updatedData.learning_materials_specify = "";
      if (rName === "assistive_technology" && value !== "Yes")
        updatedData.assistive_tech_specify = "";
      if (rName === "employed_or_entrepreurial_activities" && value !== "Yes")
        updatedData.employment_specify = "";
      if (rName === "financial_assistance" && value !== "Yes")
        updatedData.financial_assistance_specify = "";
      if (rName === "social_services" && value !== "Yes")
        updatedData.social_services_specify = "";
      if (rName === "availed_any_services" && value !== "Yes")
        updatedData.availed_services_specify = "";
    }
    setFormData(updatedData);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    let currentArray = formData[name]
      ? formData[name]
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean)
      : [];
    if (checked) currentArray.push(value);
    else {
      currentArray = currentArray.filter((item: string) => item !== value);
      if (name === "reason_for_unemployment" && value === "Others")
        setFormData((prev: any) => ({
          ...prev,
          unemployment_reason_specify: "",
        }));
      if (name === "challenges_faced" && value === "Others")
        setFormData((prev: any) => ({ ...prev, challenges_faced_specify: "" }));
    }
    setFormData({ ...formData, [name]: currentArray.join(", ") });
  };

  useEffect(() => {
    const fields = [
      "food_total",
      "maint_total",
      "vitamins_total",
      "othermed_total",
      "therapy_total",
      "hygiene_total",
      "otherhealth_total",
    ];
    let sum = 0;
    fields.forEach((field) => {
      const num = parseFloat(String(formData[field] || "0").replace(/,/g, ""));
      if (!isNaN(num)) sum += num;
    });
    setFormData((prev: any) => ({
      ...prev,
      overall_total: sum > 0 ? sum.toString() : "",
    }));
  }, [
    formData.food_total,
    formData.maint_total,
    formData.vitamins_total,
    formData.othermed_total,
    formData.therapy_total,
    formData.hygiene_total,
    formData.otherhealth_total,
  ]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
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
      await updateDoc(doc(db, "profiles", docId as string), finalData);
      setNotification({
        message: "✅ Record Updated Successfully!",
        type: "success",
      });
      setTimeout(() => router.push("/table"), 1500);
    } catch (error: any) {
      console.error("FIREBASE ERROR:", error);
      setNotification({
        message: "❌ Error updating record: " + error.message,
        type: "error",
      });
      setTimeout(() => setNotification(null), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, "profiles", docId as string));
      setNotification({
        message: "✅ Record Deleted Successfully!",
        type: "success",
      });
      setTimeout(() => router.push("/table"), 1500);
    } catch (error: any) {
      setNotification({
        message: "❌ Error deleting record: " + error.message,
        type: "error",
      });
      setTimeout(() => setNotification(null), 4000);
    }
  };

  if (isLoadingData)
    return (
      <div
        style={{
          padding: "100px",
          textAlign: "center",
          fontSize: "20px",
          fontFamily: "Arial",
        }}
      >
        Loading Profile Data...
      </div>
    );

  return (
    <div className="addWrapper">
      {/* ✅ ADDED: Combobox Styling */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .combo-wrapper { position: relative; display: flex; align-items: center; width: 100%; }
        .combo-input {
          width: 100%; padding: 8px 30px 8px 12px; border: 1px solid #ccc; border-radius: 6px;
          font-family: inherit; font-size: 14px; transition: all 0.2s ease; outline: none; background-color: #fff;
        }
        .combo-input:focus { border-color: #512da8; box-shadow: 0 0 0 3px rgba(81, 45, 168, 0.15); }
        
        .combo-input.line-input {
          border: none !important; border-bottom: 1px solid #000 !important; border-radius: 0 !important; 
          padding: 0 30px 0 0 !important; background: transparent !important; box-shadow: none !important;
        }
        .combo-input.line-input:focus { border-color: #512da8 !important; }

        .combo-input.table-input {
          border: none !important; border-radius: 0 !important; padding: 0 !important;
          background: transparent !important; box-shadow: none !important; width: 100% !important;
        }
        .combo-input.table-input:focus { border-color: transparent !important; }

        .combo-icon { position: absolute; right: 12px; font-size: 10px; color: #888; pointer-events: none; }
        .combo-menu {
          position: absolute; top: 100%; left: 0; right: 0; margin-top: 5px; padding: 5px 0; margin-bottom: 0;
          background: white; border: 1px solid #dcd0e8; border-radius: 8px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15); z-index: 9999; max-height: 220px; overflow-y: auto;
          list-style: none; text-align: left;
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
        }
        .combo-item {
          padding: 8px 15px; cursor: pointer; font-size: 14px; color: #333; transition: 0.15s ease; margin: 0;
        }
        .combo-item:hover { background-color: #f4f0fa; color: #512da8; font-weight: 600; }
      `,
        }}
      />

      {/* HEADER */}
      <div className="header">
        <div className="header-left">
          <img
            style={{
              display: "flex",
              gap: "15px",
              alignItems: "center",
              width: "50px",
              height: "50px",
            }}
            src="/cswd.png"
            alt="CSWD Logo"
          />

          <h2>CSWDO - Binan City</h2>
        </div>
        <h3 className="header-title2">
          Aruga Project Profiling and Assessment Details
        </h3>
        <div className="dropdown">
          <button className="dropbtn" type="button" onClick={toggleMenu}>
            Username ▼
          </button>
          <div
            id="dropdownMenu"
            className="dropdown-content"
            style={{ display: isMenuOpen ? "block" : "none" }}
          >
            <a href="/" className="logout">
              Logout
            </a>
          </div>
        </div>
      </div>

      <div className="back-button">
        <a
          style={{ cursor: "pointer" }}
          onClick={() => {
            if (currentStep === 1) router.push("/table");
            else prevStep();
          }}
        >
          ←
        </a>
      </div>

      <div className="container">
        {notification && (
          <div
            style={{
              position: "fixed",
              top: "100px",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor:
                notification.type === "loading"
                  ? "#2196F3"
                  : notification.type === "success"
                    ? "#4CAF50"
                    : "#f44336",
              color: "white",
              padding: "15px 30px",
              borderRadius: "8px",
              boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
              zIndex: 999999,
              fontWeight: "bold",
              fontSize: "16px",
              display: "flex",
              alignItems: "center",
              transition: "all 0.3s ease",
            }}
          >
            {notification.message}
          </div>
        )}

        <div className="container-right">
          <button
            type="button"
            className="printform-btn"
            onClick={() => router.push(`/print?id=${docId}`)}
          >
            Print Form
          </button>
          <button type="button" className="update-btn" onClick={handleSubmit}>
            {isSaving ? "UPDATING..." : "UPDATE"}
          </button>
          <button
            type="button"
            className="delete-btn"
            onClick={() => setShowDeleteModal(true)}
          >
            DELETE
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {currentStep === 1 && (
            <div className="step-1 animate-in fade-in duration-300">
              <div className="top-row">
                <div className="field-group">
                  <label>Date of Interview:</label>
                  <input
                    type="date"
                    id="dateInterview"
                    value={val("dateInterview")}
                    onChange={handleChange}
                  />
                </div>
                <div className="field-group">
                  <label>Time Started:</label>
                  <input
                    type="time"
                    id="timeStart"
                    value={val("timeStart")}
                    onChange={handleChange}
                  />
                </div>
                <div className="field-group">
                  <label>Time Ended:</label>
                  <input
                    type="time"
                    id="timeEnd"
                    value={val("timeEnd")}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="info-section">
                <div className="form-row">
                  <label>Name of Interviewer:</label>
                  <input
                    type="text"
                    className="line-input"
                    id="interviewer_name"
                    value={val("interviewer_name")}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-row">
                  <label>Household ID No.:</label>
                  <input
                    type="text"
                    className="line-input"
                    id="household_id"
                    value={val("household_id")}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-row">
                  <label>Region:</label>
                  <input
                    type="text"
                    className="line-input"
                    id="region"
                    value={val("region")}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-row">
                  <label>Pantawid Member?</label>
                  <input
                    type="text"
                    className="line-input"
                    id="pantawid_member"
                    value={val("pantawid_member")}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-row">
                  <label>Province:</label>
                  <input
                    type="text"
                    className="line-input"
                    id="province"
                    value={val("province")}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-row">
                  <label>Name of Respondent:</label>
                  <input
                    type="text"
                    className="line-input"
                    id="respondent_name"
                    value={val("respondent_name")}
                    onChange={handleChange}
                  />
                </div>

                {/* ✅ ADDED: Address and Barangay aligned similarly to Add Profile */}
                <div
                  className="form-row"
                  style={{
                    display: "flex",
                    gap: "15px",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <label style={{ whiteSpace: "nowrap", marginBottom: 0 }}>
                    Address:
                  </label>
                  <input
                    type="text"
                    className="line-input"
                    id="address"
                    name="address"
                    value={val("address")}
                    onChange={handleChange}
                    placeholder="House No., Street, Subdivision"
                    style={{ flex: 1, minWidth: "200px" }}
                  />

                  <label style={{ whiteSpace: "nowrap", marginBottom: 0 }}>
                    Barangay:
                  </label>
                  <div style={{ flex: "0 0 250px" }}>
                    <Combobox
                      id="barangay"
                      name="barangay"
                      value={val("barangay")}
                      options={barangaysList}
                      onChange={handleChange}
                      placeholder="Select Barangay"
                      variant="line"
                    />
                  </div>
                </div>
              </div>

              <div className="section-title">CHILD WITH DISABILITY PROFILE</div>

              <table className="profile-table">
                <tbody>
                  <tr>
                    <td className="r-col">R1.</td>
                    <td className="label-col">Name:</td>
                    <td className="input-col">
                      <input
                        type="text"
                        id="r1_name"
                        value={val("r1_name")}
                        onChange={handleChange}
                      />
                    </td>
                    <td></td>
                  </tr>
                  <tr>
                    <td>R2.</td>
                    <td>Address:</td>
                    <td>
                      <input
                        type="text"
                        id="r2_address"
                        value={val("r2_address")}
                        onChange={handleChange}
                      />
                    </td>
                    <td></td>
                  </tr>
                  <tr>
                    <td>R3.</td>
                    <td>Contact Number:</td>
                    <td>
                      <input
                        type="text"
                        id="r3_contact"
                        value={val("r3_contact")}
                        onChange={handleChange}
                      />
                    </td>
                    <td></td>
                  </tr>
                  <tr>
                    <td>R4.</td>
                    <td>Date of Birth:</td>
                    <td>
                      <input
                        type="date"
                        id="r4_dob"
                        value={val("r4_dob")}
                        onChange={handleChange}
                      />
                    </td>
                    <td></td>
                  </tr>
                  {/* ✅ ADDED: Combobox with arrows for R5 to R10 */}
                  <tr>
                    <td>R5.</td>
                    <td>Religion:</td>
                    <td>
                      <Combobox
                        id="r5_religion"
                        name="r5_religion"
                        value={val("r5_religion")}
                        options={religionOptions}
                        onChange={handleChange}
                        placeholder="Select or type..."
                        variant="table"
                      />
                    </td>
                    <td className="code-col">
                      Code:{" "}
                      <input
                        type="text"
                        className="code-input"
                        id="r5_religion_code"
                        value={val("r5_religion_code")}
                        readOnly
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>R6.</td>
                    <td>IP Membership:</td>
                    <td>
                      <Combobox
                        id="r6_ip"
                        name="r6_ip"
                        value={val("r6_ip")}
                        options={ipOptions}
                        onChange={handleChange}
                        placeholder="Select or type..."
                        variant="table"
                      />
                    </td>
                    <td className="code-col">
                      Code:{" "}
                      <input
                        type="text"
                        className="code-input"
                        id="r6_ip_code"
                        value={val("r6_ip_code")}
                        readOnly
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>R7.</td>
                    <td>Sex:</td>
                    <td>
                      <Combobox
                        id="r7_sex"
                        name="r7_sex"
                        value={val("r7_sex")}
                        options={sexOptions}
                        onChange={handleChange}
                        placeholder="Select or type..."
                        variant="table"
                      />
                    </td>
                    <td className="code-col">
                      Code:{" "}
                      <input
                        type="text"
                        className="code-input"
                        id="r7_sex_code"
                        value={val("r7_sex_code")}
                        readOnly
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>R8.</td>
                    <td>Highest Educational Attainment:</td>
                    <td>
                      <Combobox
                        id="r8_educational_attainment"
                        name="r8_educational_attainment"
                        value={val("r8_educational_attainment")}
                        options={educationOptions}
                        onChange={handleChange}
                        placeholder="Select or type..."
                        variant="table"
                      />
                    </td>
                    <td className="code-col">
                      Code:{" "}
                      <input
                        type="text"
                        className="code-input"
                        id="r8_education_code"
                        value={val("r8_education_code")}
                        readOnly
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>R9.</td>
                    <td>Disability / Special Needs:</td>
                    <td>
                      <Combobox
                        id="r9_disability"
                        name="r9_disability"
                        value={val("r9_disability")}
                        options={disabilityOptions}
                        onChange={handleChange}
                        placeholder="Select or type..."
                        variant="table"
                      />
                    </td>
                    <td className="code-col">
                      Code:{" "}
                      <input
                        type="text"
                        className="code-input"
                        id="r9_disability_code"
                        value={val("r9_disability_code")}
                        readOnly
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>R10.</td>
                    <td>Critical Illness:</td>
                    <td>
                      <Combobox
                        id="r10_illness"
                        name="r10_illness"
                        value={val("r10_illness")}
                        options={illnessOptions}
                        onChange={handleChange}
                        placeholder="Select or type..."
                        variant="table"
                      />
                    </td>
                    <td className="code-col">
                      Code:{" "}
                      <input
                        type="text"
                        className="code-input"
                        id="r10_illness_code"
                        value={val("r10_illness_code")}
                        readOnly
                      />
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="family-size">
                <label>H1. Bilang ng Miyembro (Family Size):</label>
                <input
                  type="number"
                  className="family-size-input"
                  id="h1_family_size"
                  value={val("h1_family_size")}
                  onChange={handleChange}
                />
              </div>

              <div className="section-title">FAMILY PROFILE</div>

              <table className="family-table">
                <thead>
                  <tr>
                    <th style={{ width: "40px" }}></th>
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
                      <td>
                        <input
                          type="text"
                          id={`fam_${rowNum}_name`}
                          value={val(`fam_${rowNum}_name`)}
                          onChange={handleChange}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          id={`fam_${rowNum}_relationship`}
                          value={val(`fam_${rowNum}_relationship`)}
                          onChange={handleChange}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          id={`fam_${rowNum}_civil_status`}
                          value={val(`fam_${rowNum}_civil_status`)}
                          onChange={handleChange}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          id={`fam_${rowNum}_age`}
                          value={val(`fam_${rowNum}_age`)}
                          onChange={handleChange}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          id={`fam_${rowNum}_sex`}
                          value={val(`fam_${rowNum}_sex`)}
                          onChange={handleChange}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          id={`fam_${rowNum}_occupation`}
                          value={val(`fam_${rowNum}_occupation`)}
                          onChange={handleChange}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          id={`fam_${rowNum}_occ_class`}
                          value={val(`fam_${rowNum}_occ_class`)}
                          onChange={handleChange}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          id={`fam_${rowNum}_disability`}
                          value={val(`fam_${rowNum}_disability`)}
                          onChange={handleChange}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          id={`fam_${rowNum}_illness`}
                          value={val(`fam_${rowNum}_illness`)}
                          onChange={handleChange}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          id={`fam_${rowNum}_solo_parent`}
                          value={val(`fam_${rowNum}_solo_parent`)}
                          onChange={handleChange}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="next-container">
                <button type="button" className="next-btn" onClick={nextStep}>
                  NEXT
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="step-2 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="section-title">
                I. HOUSING, SANITATION AND WATER
              </div>

              <div className="form-section">
                <h3>A. HOUSING CONDITION</h3>

                <div className="question">
                  <h4>
                    1. What type of construction materials are the roofs and the
                    outer walls made of?
                  </h4>
                </div>
                {[
                  "Makeshift/salvaged/improvised materials",
                  "Mixed but predominantly makeshift/salvaged",
                  "Light materials such as bamboo/sawali/cogon/nipa but not sturdy and durable",
                  "Mixed but predominantly light materials",
                  "Strong materials such as concrete/brick/stone or wood or half galvanized iron and half concrete or galvanized iron/aluminum or glass",
                  "Bamboo/sawali/cogon/nipa but sturdy and durable",
                ].map((opt, i) => (
                  <label className="radio-option" key={i}>
                    <input
                      type="radio"
                      name="housing_material"
                      value={opt}
                      checked={val("housing_material") === opt}
                      onChange={handleChange}
                    />{" "}
                    {String.fromCharCode(97 + i)}. {opt}
                  </label>
                ))}

                <div className="question">
                  <h4>
                    2. What is the tenure status of the house and lot does the
                    family have?
                  </h4>
                </div>
                {[
                  "Own house and lot",
                  "Own house, rent-free lot without consent of owner",
                  "Own house, rent-free lot with the consent of the owner",
                  "Rent-free house and lot without consent of owner",
                  "Rent-free house and lot with consent of owner",
                  "Rented house and lot for less than three years",
                  "Own house, rented lot for less than three years",
                  "Other",
                ].map((opt, i) => (
                  <label className="radio-option" key={i}>
                    <input
                      type="radio"
                      name="house_lot"
                      value={opt}
                      checked={val("house_lot") === opt}
                      onChange={handleChange}
                    />{" "}
                    {String.fromCharCode(97 + i)}. {opt}
                    {opt === "Other" && (
                      <input
                        type="text"
                        name="house_lot_other"
                        className="line-input"
                        disabled={val("house_lot") !== "Other"}
                        value={val("house_lot_other")}
                        onChange={handleChange}
                      />
                    )}
                  </label>
                ))}

                <div className="question">
                  <h4>
                    3. Are there any modifications in the house to accommodate
                    the child's disability?
                  </h4>
                </div>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="modification"
                    value="Yes"
                    checked={val("modification") === "Yes"}
                    onChange={handleChange}
                  />{" "}
                  a. Yes. Specify:{" "}
                  <input
                    type="text"
                    name="modification_specify"
                    className="line-input"
                    disabled={val("modification") !== "Yes"}
                    value={val("modification_specify")}
                    onChange={handleChange}
                  />
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="modification"
                    value="No"
                    checked={val("modification") === "No"}
                    onChange={handleChange}
                  />{" "}
                  b. No
                </label>

                <div className="question">
                  <h4>
                    4. What is the main source of electricity in the dwelling
                    place?
                  </h4>
                </div>
                {[
                  "Electric Company",
                  "Generator",
                  "Solar",
                  "Battery",
                  "Others",
                  "None",
                ].map((opt, i) => (
                  <label className="radio-option" key={i}>
                    <input
                      type="radio"
                      name="main_source_of_electricity"
                      value={opt}
                      checked={val("main_source_of_electricity") === opt}
                      onChange={handleChange}
                    />{" "}
                    {String.fromCharCode(97 + i)}. {opt}
                    {opt === "Others" && (
                      <input
                        type="text"
                        name="electricity_specify"
                        className="line-input"
                        disabled={
                          val("main_source_of_electricity") !== "Others"
                        }
                        value={val("electricity_specify")}
                        onChange={handleChange}
                      />
                    )}
                  </label>
                ))}

                <h3>B. WATER SUPPLY</h3>
                <div className="question">
                  <h4>5. What is your family’s main source of water supply?</h4>
                </div>
                {[
                  "Unprotected spring, lake, river, rain, dug well",
                  "Commercial sources, e.g., tanker, truck, peddler (except bottled water)",
                  "Source of safe drinking water but the time to collect water including the time to walk to the water source, collect it and return is longer than 30 minutes.",
                  "Own use of faucet community water system (gripo)",
                  "Shared faucet community water system",
                  "Own use tubed/piped deep well",
                  "Shared tubed/ piped deep well, tubed/piped shallow well",
                  "Bought bottled water including those being delivered",
                  "Others",
                ].map((opt, i) => (
                  <label className="radio-option" key={i}>
                    <input
                      type="radio"
                      name="water_supply"
                      value={opt}
                      checked={val("water_supply") === opt}
                      onChange={handleChange}
                    />{" "}
                    {String.fromCharCode(97 + i)}. {opt}
                    {opt === "Others" && (
                      <input
                        type="text"
                        name="water_supply_specify"
                        className="line-input"
                        disabled={val("water_supply") !== "Others"}
                        value={val("water_supply_specify")}
                        onChange={handleChange}
                      />
                    )}
                  </label>
                ))}

                <h3>C. SANITATION</h3>
                <div className="question">
                  <h4>
                    6. What is the main type of toilet facility the family uses?
                  </h4>
                </div>
                {[
                  "Water-sealed, sewer septic tank, used exclusively by the family",
                  "Water-sealed, sewer septic tank, shared with other families",
                  "Closed pit",
                  "Open pit",
                  "Others",
                  "None",
                ].map((opt, i) => (
                  <label className="radio-option" key={i}>
                    <input
                      type="radio"
                      name="sanitation"
                      value={opt}
                      checked={val("sanitation") === opt}
                      onChange={handleChange}
                    />{" "}
                    {String.fromCharCode(97 + i)}. {opt}
                    {opt === "Others" && (
                      <input
                        type="text"
                        name="sanitation_specify"
                        className="line-input"
                        disabled={val("sanitation") !== "Others"}
                        value={val("sanitation_specify")}
                        onChange={handleChange}
                      />
                    )}
                  </label>
                ))}

                <div className="question">
                  <h4>7. Is the toilet accessible for the child?</h4>
                </div>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="accessible_toilet"
                    value="Yes"
                    checked={val("accessible_toilet") === "Yes"}
                    onChange={handleChange}
                  />{" "}
                  a. Yes
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="accessible_toilet"
                    value="No"
                    checked={val("accessible_toilet") === "No"}
                    onChange={handleChange}
                  />{" "}
                  b. No
                </label>

                <div className="question">
                  <h4>
                    8. What is the main system of garbage disposal adopted by
                    the family?
                  </h4>
                </div>
                {[
                  "Garbage collection",
                  "Burning",
                  "Composting",
                  "Recycling",
                  "Waste Segregation",
                  "Pit with cover",
                  "Pit without cover",
                  "Throwing of garbage in rivers, vacant lots, etc.",
                  "Others",
                ].map((opt, i) => (
                  <label className="radio-option" key={i}>
                    <input
                      type="radio"
                      name="garbage_disposal"
                      value={opt}
                      checked={val("garbage_disposal") === opt}
                      onChange={handleChange}
                    />{" "}
                    {String.fromCharCode(97 + i)}. {opt}
                    {opt === "Others" && (
                      <input
                        type="text"
                        name="garbage_disposal_specify"
                        className="line-input"
                        disabled={val("garbage_disposal") !== "Others"}
                        value={val("garbage_disposal_specify")}
                        onChange={handleChange}
                      />
                    )}
                  </label>
                ))}
              </div>

              <div className="section-title">II. HEALTH</div>
              <div className="form-section">
                <h3>A. GENERAL HEALTH</h3>
                <div className="question">
                  <h4>
                    1. Has the child received all recommended vaccinations?
                  </h4>
                </div>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="received_vaccination"
                    value="Yes"
                    checked={val("received_vaccination") === "Yes"}
                    onChange={handleChange}
                  />{" "}
                  a. Yes
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="received_vaccination"
                    value="No"
                    checked={val("received_vaccination") === "No"}
                    onChange={handleChange}
                  />{" "}
                  b. No
                </label>

                <div className="question">
                  <h4>2. Does the child have any ongoing health conditions?</h4>
                </div>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="health_condition"
                    value="Yes"
                    checked={val("health_condition") === "Yes"}
                    onChange={handleChange}
                  />{" "}
                  a. Yes. Specify:{" "}
                  <input
                    type="text"
                    name="health_condition_specify"
                    className="line-input"
                    disabled={val("health_condition") !== "Yes"}
                    value={val("health_condition_specify")}
                    onChange={handleChange}
                  />
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="health_condition"
                    value="No"
                    checked={val("health_condition") === "No"}
                    onChange={handleChange}
                  />{" "}
                  b. No
                </label>

                <h4>3. Corresponding health expenses in a month:</h4>
                <table className="health-table">
                  <tbody>
                    <tr>
                      <th colSpan={2}>AREAS OF CONCERNS</th>
                      <th>TOTAL (PER MONTH)</th>
                      <th>REMARKS</th>
                    </tr>
                    <tr>
                      <td colSpan={2}>
                        FOOD (E.G. MILK, COOKIES, OATMEAL, ETC)
                      </td>
                      <td>
                        <input
                          type="number"
                          name="food_total"
                          value={val("food_total")}
                          onChange={handleChange}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          name="food_remarks"
                          value={val("food_remarks")}
                          onChange={handleChange}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td rowSpan={3}>MEDICINE</td>
                      <td>• MAINTENANCE</td>
                      <td>
                        <input
                          type="number"
                          name="maint_total"
                          value={val("maint_total")}
                          onChange={handleChange}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          name="maint_remarks"
                          value={val("maint_remarks")}
                          onChange={handleChange}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>• VITAMINS</td>
                      <td>
                        <input
                          type="number"
                          name="vitamins_total"
                          value={val("vitamins_total")}
                          onChange={handleChange}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          name="vitamins_remarks"
                          value={val("vitamins_remarks")}
                          onChange={handleChange}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>• OTHER RELATED MEDICINES</td>
                      <td>
                        <input
                          type="number"
                          name="othermed_total"
                          value={val("othermed_total")}
                          onChange={handleChange}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          name="othermed_remarks"
                          value={val("othermed_remarks")}
                          onChange={handleChange}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2}>
                        THERAPY (PHYSICAL, OCCUPATIONAL, SPEECH)
                      </td>
                      <td>
                        <input
                          type="number"
                          name="therapy_total"
                          value={val("therapy_total")}
                          onChange={handleChange}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          name="therapy_remarks"
                          value={val("therapy_remarks")}
                          onChange={handleChange}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2}>HYGIENE RELATED NEEDS</td>
                      <td>
                        <input
                          type="number"
                          name="hygiene_total"
                          value={val("hygiene_total")}
                          onChange={handleChange}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          name="hygiene_remarks"
                          value={val("hygiene_remarks")}
                          onChange={handleChange}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2}>OTHER HEALTH NEEDS</td>
                      <td>
                        <input
                          type="number"
                          name="otherhealth_total"
                          value={val("otherhealth_total")}
                          onChange={handleChange}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          name="otherhealth_remarks"
                          value={val("otherhealth_remarks")}
                          onChange={handleChange}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2}>
                        <b>OVER-ALL TOTAL</b>
                      </td>
                      <td>
                        <input
                          type="text"
                          name="overall_total"
                          readOnly
                          value={val("overall_total")}
                          style={{ backgroundColor: "#e9ecef" }}
                        />
                      </td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>

                <h3>C. ACCESS TO HEALTH SERVICES</h3>
                <div className="question">
                  <h4>
                    4. Has the child availed health services in the past 6
                    months?
                  </h4>
                </div>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="health_services"
                    value="Yes"
                    checked={val("health_services") === "Yes"}
                    onChange={handleChange}
                  />{" "}
                  a. Yes. Specify:{" "}
                  <input
                    type="text"
                    name="health_services_specify"
                    className="line-input"
                    disabled={val("health_services") !== "Yes"}
                    value={val("health_services_specify")}
                    onChange={handleChange}
                  />
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="health_services"
                    value="No"
                    checked={val("health_services") === "No"}
                    onChange={handleChange}
                  />{" "}
                  b. No
                </label>

                <div className="question">
                  <h4>5. Is the health facility accessible for the child?</h4>
                </div>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="facility_accessible"
                    value="Yes"
                    checked={val("facility_accessible") === "Yes"}
                    onChange={handleChange}
                  />{" "}
                  a. Yes
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="facility_accessible"
                    value="No"
                    checked={val("facility_accessible") === "No"}
                    onChange={handleChange}
                  />{" "}
                  b. No
                </label>

                <div className="question">
                  <h4>
                    6. Are there any barriers to accessing health care services?
                  </h4>
                </div>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="barriers_accessing_healthcare_services"
                    value="Yes"
                    checked={
                      val("barriers_accessing_healthcare_services") === "Yes"
                    }
                    onChange={handleChange}
                  />{" "}
                  a. Yes. Specify:{" "}
                  <input
                    type="text"
                    name="barriers_healthcare_specify"
                    className="line-input"
                    disabled={
                      val("barriers_accessing_healthcare_services") !== "Yes"
                    }
                    value={val("barriers_healthcare_specify")}
                    onChange={handleChange}
                  />
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="barriers_accessing_healthcare_services"
                    value="No"
                    checked={
                      val("barriers_accessing_healthcare_services") === "No"
                    }
                    onChange={handleChange}
                  />{" "}
                  b. No
                </label>
              </div>

              <div className="section-title">III. EDUCATION</div>
              <div className="form-section">
                <h3>A. Educational Status</h3>
                <div className="question">
                  <h4>1. Is the child currently enrolled in school?</h4>
                </div>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="currently_enrolled"
                    value="Yes"
                    checked={val("currently_enrolled") === "Yes"}
                    onChange={handleChange}
                  />{" "}
                  a. Yes. Grade/Year Level:{" "}
                  <input
                    type="text"
                    name="enrolled_grade"
                    className="line-input"
                    disabled={val("currently_enrolled") !== "Yes"}
                    value={val("enrolled_grade")}
                    onChange={handleChange}
                  />
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="currently_enrolled"
                    value="No"
                    checked={val("currently_enrolled") === "No"}
                    onChange={handleChange}
                  />{" "}
                  b. No. Why not?:{" "}
                  <input
                    type="text"
                    name="not_enrolled_reason"
                    className="line-input"
                    disabled={val("currently_enrolled") !== "No"}
                    value={val("not_enrolled_reason")}
                    onChange={handleChange}
                  />
                </label>

                <h3>B. School Accessibility</h3>
                <div className="question">
                  <h4>
                    2. Is the school equipped with physically accessibility
                    features?
                  </h4>
                </div>
                {["Yes", "No", "Not Applicable"].map((opt) => (
                  <label className="radio-option" key={opt}>
                    <input
                      type="radio"
                      name="physical_accessibility_features"
                      value={opt}
                      checked={val("physical_accessibility_features") === opt}
                      onChange={handleChange}
                    />{" "}
                    {opt}
                    {opt === "Yes" && (
                      <input
                        type="text"
                        name="physical_accessibility_specify"
                        className="line-input"
                        style={{ marginLeft: "10px" }}
                        disabled={
                          val("physical_accessibility_features") !== "Yes"
                        }
                        value={val("physical_accessibility_specify")}
                        onChange={handleChange}
                      />
                    )}
                  </label>
                ))}

                <div className="question">
                  <h4>3. Are there special education programs available?</h4>
                </div>
                {["Yes", "No", "Not Applicable"].map((opt) => (
                  <label className="radio-option" key={opt}>
                    <input
                      type="radio"
                      name="special_education_programs"
                      value={opt}
                      checked={val("special_education_programs") === opt}
                      onChange={handleChange}
                    />{" "}
                    {opt}
                    {opt === "Yes" && (
                      <input
                        type="text"
                        name="sped_programs_specify"
                        className="line-input"
                        style={{ marginLeft: "10px" }}
                        disabled={val("special_education_programs") !== "Yes"}
                        value={val("sped_programs_specify")}
                        onChange={handleChange}
                      />
                    )}
                  </label>
                ))}

                <div className="question">
                  <h4>4. Does the child receive any learning support?</h4>
                </div>
                {["Yes", "No", "Not Applicable"].map((opt) => (
                  <label className="radio-option" key={opt}>
                    <input
                      type="radio"
                      name="received_learning_support"
                      value={opt}
                      checked={val("received_learning_support") === opt}
                      onChange={handleChange}
                    />{" "}
                    {opt}
                    {opt === "Yes" && (
                      <input
                        type="text"
                        name="learning_support_specify"
                        className="line-input"
                        style={{ marginLeft: "10px" }}
                        disabled={val("received_learning_support") !== "Yes"}
                        value={val("learning_support_specify")}
                        onChange={handleChange}
                      />
                    )}
                  </label>
                ))}

                <h3>C. Learning Materials</h3>
                <div className="question">
                  <h4>5. Are there accessible learning materials available?</h4>
                </div>
                {["Yes", "No", "Not Applicable"].map((opt) => (
                  <label className="radio-option" key={opt}>
                    <input
                      type="radio"
                      name="accessible_learning_materials"
                      value={opt}
                      checked={val("accessible_learning_materials") === opt}
                      onChange={handleChange}
                    />{" "}
                    {opt}
                    {opt === "Yes" && (
                      <input
                        type="text"
                        name="learning_materials_specify"
                        className="line-input"
                        style={{ marginLeft: "10px" }}
                        disabled={
                          val("accessible_learning_materials") !== "Yes"
                        }
                        value={val("learning_materials_specify")}
                        onChange={handleChange}
                      />
                    )}
                  </label>
                ))}

                <div className="question">
                  <h4>
                    6. Does the child have access to assistive technology?
                  </h4>
                </div>
                {["Yes", "No", "Not Applicable"].map((opt) => (
                  <label className="radio-option" key={opt}>
                    <input
                      type="radio"
                      name="assistive_technology"
                      value={opt}
                      checked={val("assistive_technology") === opt}
                      onChange={handleChange}
                    />{" "}
                    {opt}
                    {opt === "Yes" && (
                      <input
                        type="text"
                        name="assistive_tech_specify"
                        className="line-input"
                        style={{ marginLeft: "10px" }}
                        disabled={val("assistive_technology") !== "Yes"}
                        value={val("assistive_tech_specify")}
                        onChange={handleChange}
                      />
                    )}
                  </label>
                ))}
              </div>

              <div className="section-title">IV. ECONOMIC CAPACITY</div>
              <div className="form-section">
                <h3>A. Family Income</h3>
                <h4>1. What is the primary source of income for the family?</h4>
                <input
                  type="text"
                  className="line-input"
                  name="income_source"
                  value={val("income_source")}
                  onChange={handleChange}
                />

                <div className="question">
                  <h4>
                    2. How much is the approximate monthly income of the family?
                  </h4>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="monthly_income"
                      value="Below minimum wage"
                      checked={val("monthly_income") === "Below minimum wage"}
                      onChange={handleChange}
                    />
                    Below minimum wage
                  </label>

                  <label className="radio-option">
                    <input
                      type="radio"
                      name="monthly_income"
                      value="Minimum wage"
                      checked={val("monthly_income") === "Minimum wage"}
                      onChange={handleChange}
                    />
                    Minimum wage
                  </label>

                  <label className="radio-option">
                    <input
                      type="radio"
                      name="monthly_income"
                      value="Above minimum wage"
                      checked={val("monthly_income") === "Above minimum wage"}
                      onChange={handleChange}
                    />
                    Above minimum wage
                  </label>
                </div>

                <h3>B. Employment</h3>
                <div className="question">
                  <h4>
                    3. Are the parents/guardians employed or have
                    entrepreneurial activities?
                  </h4>
                </div>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="employed_or_entrepreurial_activities"
                    value="Yes"
                    checked={
                      val("employed_or_entrepreurial_activities") === "Yes"
                    }
                    onChange={handleChange}
                  />
                  a. Yes, Specify:{" "}
                  <input
                    type="text"
                    name="employment_specify"
                    className="line-input"
                    disabled={
                      val("employed_or_entrepreurial_activities") !== "Yes"
                    }
                    value={val("employment_specify")}
                    onChange={handleChange}
                  />
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="employed_or_entrepreurial_activities"
                    value="No"
                    checked={
                      val("employed_or_entrepreurial_activities") === "No"
                    }
                    onChange={handleChange}
                  />{" "}
                  b. No
                </label>

                <p>If not, what is the reason for unemployment?</p>
                <label className="radio-option">
                  <input
                    type="checkbox"
                    name="reason_for_unemployment"
                    value="Lack of skills"
                    checked={val("reason_for_unemployment").includes(
                      "Lack of skills",
                    )}
                    onChange={handleCheckboxChange}
                  />{" "}
                  Lack of skills
                </label>
                <label className="radio-option">
                  <input
                    type="checkbox"
                    name="reason_for_unemployment"
                    value="Health reasons"
                    checked={val("reason_for_unemployment").includes(
                      "Health reasons",
                    )}
                    onChange={handleCheckboxChange}
                  />{" "}
                  Health reasons
                </label>
                <label className="radio-option">
                  <input
                    type="checkbox"
                    name="reason_for_unemployment"
                    value="Caregiving responsibilities"
                    checked={val("reason_for_unemployment").includes(
                      "Caregiving responsibilities",
                    )}
                    onChange={handleCheckboxChange}
                  />{" "}
                  Caregiving responsibilities
                </label>
                <label className="radio-option">
                  <input
                    type="checkbox"
                    name="reason_for_unemployment"
                    value="Others"
                    checked={val("reason_for_unemployment").includes("Others")}
                    onChange={handleCheckboxChange}
                  />{" "}
                  Others. Specify:{" "}
                  <input
                    type="text"
                    className="line-input"
                    style={{ marginLeft: "10px" }}
                    name="unemployment_reason_specify"
                    disabled={
                      !val("reason_for_unemployment").includes("Others")
                    }
                    value={val("unemployment_reason_specify")}
                    onChange={handleChange}
                  />
                </label>
              </div>

              <div className="section-title">V. Service Availment</div>
              <div className="form-section">
                <h3>A. Social Services</h3>
                <div className="question">
                  <h4>
                    1. Does the family receive any form of financial assistance?
                  </h4>
                </div>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="financial_assistance"
                    value="Yes"
                    checked={val("financial_assistance") === "Yes"}
                    onChange={handleChange}
                  />{" "}
                  a. Yes. Specify:{" "}
                  <input
                    type="text"
                    className="line-input"
                    name="financial_assistance_specify"
                    disabled={val("financial_assistance") !== "Yes"}
                    value={val("financial_assistance_specify")}
                    onChange={handleChange}
                  />
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="financial_assistance"
                    value="No"
                    checked={val("financial_assistance") === "No"}
                    onChange={handleChange}
                  />{" "}
                  b. No
                </label>

                <div className="question">
                  <h4>
                    2. Is the family aware of available social services for
                    children with disabilities?
                  </h4>
                </div>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="social_services"
                    value="Yes"
                    checked={val("social_services") === "Yes"}
                    onChange={handleChange}
                  />{" "}
                  a. Yes. Specify:{" "}
                  <input
                    type="text"
                    className="line-input"
                    name="social_services_specify"
                    disabled={val("social_services") !== "Yes"}
                    value={val("social_services_specify")}
                    onChange={handleChange}
                  />
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="social_services"
                    value="No"
                    checked={val("social_services") === "No"}
                    onChange={handleChange}
                  />{" "}
                  b. No
                </label>

                <div className="question">
                  <h4>
                    3. Has the family availed of any services (therapy,
                    financial support, etc.)?
                  </h4>
                </div>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="availed_any_services"
                    value="Yes"
                    checked={val("availed_any_services") === "Yes"}
                    onChange={handleChange}
                  />{" "}
                  a. Yes. Specify:{" "}
                  <input
                    type="text"
                    className="line-input"
                    name="availed_services_specify"
                    disabled={val("availed_any_services") !== "Yes"}
                    value={val("availed_services_specify")}
                    onChange={handleChange}
                  />
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="availed_any_services"
                    value="No"
                    checked={val("availed_any_services") === "No"}
                    onChange={handleChange}
                  />{" "}
                  b. No
                </label>

                <h3>B. Barriers to Service Availment</h3>
                <div className="question">
                  <h4>
                    4. What are the challenges faced in availing these services?
                  </h4>
                </div>
                <label className="radio-option">
                  <input
                    type="checkbox"
                    name="challenges_faced"
                    value="Lack of information"
                    checked={val("challenges_faced").includes(
                      "Lack of information",
                    )}
                    onChange={handleCheckboxChange}
                  />{" "}
                  Lack of information
                </label>
                <label className="radio-option">
                  <input
                    type="checkbox"
                    name="challenges_faced"
                    value="Distance and transportation"
                    checked={val("challenges_faced").includes(
                      "Distance and transportation",
                    )}
                    onChange={handleCheckboxChange}
                  />{" "}
                  Distance and transportation
                </label>
                <label className="radio-option">
                  <input
                    type="checkbox"
                    name="challenges_faced"
                    value="Financial constraints"
                    checked={val("challenges_faced").includes(
                      "Financial constraints",
                    )}
                    onChange={handleCheckboxChange}
                  />{" "}
                  Financial constraints
                </label>
                <label className="radio-option">
                  <input
                    type="checkbox"
                    name="challenges_faced"
                    value="Prejudice and discrimination"
                    checked={val("challenges_faced").includes(
                      "Prejudice and discrimination",
                    )}
                    onChange={handleCheckboxChange}
                  />{" "}
                  Prejudice and discrimination
                </label>
                <label className="radio-option">
                  <input
                    type="checkbox"
                    name="challenges_faced"
                    value="Others"
                    checked={val("challenges_faced").includes("Others")}
                    onChange={handleCheckboxChange}
                  />{" "}
                  Others. Specify:{" "}
                  <input
                    type="text"
                    className="line-input"
                    style={{ marginLeft: "10px" }}
                    name="challenges_faced_specify"
                    disabled={!val("challenges_faced").includes("Others")}
                    value={val("challenges_faced_specify")}
                    onChange={handleChange}
                  />
                </label>
              </div>

              <div className="section-title">
                VI. General Observations and Recommendations
              </div>
              <div className="form-section">
                <div className="question">
                  <h4>
                    A. Strengths: (e.g., supportive family, strong community
                    network)
                  </h4>
                  <input
                    type="text"
                    className="line-input"
                    name="strengths"
                    value={val("strengths")}
                    onChange={handleChange}
                  />
                  <h4>B. Assessment:</h4>
                  <input
                    type="text"
                    className="line-input"
                    name="assessment"
                    value={val("assessment")}
                    onChange={handleChange}
                  />
                  <h4>C. Recommended Actions/Interventions</h4>
                  <input
                    type="text"
                    className="line-input"
                    name="recommended"
                    value={val("recommended")}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div
                className="submit-container"
                style={{ display: "flex", justifyContent: "center" }}
              >
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={isSaving}
                  onClick={handleSubmit}
                >
                  {isSaving ? "SAVING..." : "SUBMIT"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      <footer className="footer">
        <p>2026 CSWDO - Biñan City</p>
      </footer>

      {/* DELETE CONFIRMATION MODAL */}
      <div
        id="deleteModal"
        className={`modal-overlay ${showDeleteModal ? "show" : ""}`}
      >
        <div className="modal-box">
          <p>
            Are you sure you want to
            <br />
            delete the record?
          </p>
          <div className="modal-buttons">
            <button
              id="confirmDeleteBtn"
              className="modal-btn yes"
              onClick={handleDelete}
            >
              Yes
            </button>
            <button
              id="cancelDeleteBtn"
              className="modal-btn no"
              onClick={() => setShowDeleteModal(false)}
            >
              No
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FullDetailsPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{ padding: "50px", textAlign: "center", fontFamily: "Arial" }}
        >
          Loading...
        </div>
      }
    >
      <FullDetailsEditContent />
    </Suspense>
  );
}
