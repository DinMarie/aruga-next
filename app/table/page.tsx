'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs } from "firebase/firestore";
import { db } from '../../lib/firebase';
import { useReactToPrint } from 'react-to-print';
import TestDataUtil from '@/components/TestDataUtil';

const FILTER_OPTIONS = {
  barangay: ["Biñan", "Bungahan", "Canlalay", "Casile", "De La Paz", "Ganado", "Langkiwa", "Loma", "Malaban", "Malamig", "Mamplasan", "Platero", "Poblacion", "San Antonio", "San Francisco", "San Jose", "San Vicente", "Santo Domingo", "Santo Niño", "Santo Tomas", "Soro-soro", "Timbao", "Tubigan", "Zapote"],
  gender: ["Female", "Male"],
  religion: ["None", "Aglipay", "Roman Catholic", "Seventh Day Adventist", "Islam", "Bible Baptist Church", "Iglesia ni Cristo", "Jehovah's Witness", "United Methodists Church", "Tribal Religions"],
  ip: ["Non-IP", "Aeta", "Ati", "Badjao", "Bago", "Batak", "Bukidnon", "B'laan", "Cimaron", "Cayonen", "Dumagat", "Ibaloi", "Ibanag", "Itom", "Kankanaey", "Mandaya", "Mangyan", "Manobo", "Palawano", "Pullon", "Subanen"],
  disability: ["None", "Physical", "Intellectual", "Learning", "Visual", "Mental", "Psychosocial", "Deaf/Hard of Hearing", "Speech and Language Impairment", "Cancer", "Rare Disease"],
  illness: ["None", "Cancer", "Cardio-vascular Disease", "Paralysis", "Organ Failure"]
};

const ALIAS_MAP: Record<string, string[]> = {
  "Cardio-vascular Disease": ["CVD", "Cardiovascular"],
  "Iglesia ni Cristo": ["INC"],
  "Deaf/Hard of Hearing": ["HOH", "Deaf"],
  "Speech and Language Impairment": ["SLI"],
  "United Methodists Church": ["UMC"],
  "Non-IP": ["Non IP", "Non-Ip", "Non Indigenous","N/A", "None"],
};

interface ProfileData {
  id: string;
  name?: string;
  birthday?: string;
  sex?: string;
  contact?: string;
  address?: string;
  religion?: string;
  ip?: string;
  disability?: string;
  illness?: string;
}

export default function TablePage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [isSideMenuCollapsed, setIsSideMenuCollapsed] = useState(true);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' | 'loading' } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({
    barangay: [], gender: [], religion: [], ip: [], disability: [], illness: []
  });
  const [otherInputs, setOtherInputs] = useState({ religion: "", ip: "", illness: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 13;

  const componentRef = useRef<HTMLDivElement>(null);

  const performPrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: 'Aruga_Summary_Report',
    onBeforePrint: () => new Promise<void>((resolve) => {
      setNotification({ message: "⏳ Preparing report, please wait...", type: 'loading' });
      setTimeout(() => resolve(), 1000);
    }),
    onAfterPrint: () => {
      setNotification({ message: "✅ Report generated successfully!", type: 'success' });
      setTimeout(() => setNotification(null), 4000);
    },
    onPrintError: () => {
      setNotification({ message: "❌ Failed to generate report.", type: 'error' });
      setTimeout(() => setNotification(null), 4000);
    }
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const querySnapshot = await getDocs(collection(db, "profiles"));
        const dataList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ProfileData[];
        setProfiles(dataList);
      } catch (error) { console.error("Error fetching data:", error); }
    }
    fetchData();
  }, []);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, selectedFilters]);

  const toggleCategory = (cat: string) => setOpenCategories(prev => ({ ...prev, [cat]: !prev[cat] }));

  const handleFilterChange = (category: string, value: string) => {
    setSelectedFilters(prev => {
      const currentList = prev[category] || [];
      if (currentList.includes(value)) {
        return { ...prev, [category]: currentList.filter(item => item !== value) };
      }
      return { ...prev, [category]: [...currentList, value] };
    });
  };

  const handleAddOther = (category: 'religion' | 'ip' | 'illness') => {
    const val = otherInputs[category].trim();
    if (!val) return;
    if (!FILTER_OPTIONS[category].includes(val)) { FILTER_OPTIONS[category].push(val); }
    handleFilterChange(category, val);
    setOtherInputs(prev => ({ ...prev, [category]: "" }));
  };

  const clearAllFilters = () => {
    setSelectedFilters({ barangay: [], gender: [], religion: [], ip: [], disability: [], illness: [] });
    setOtherInputs({ religion: "", ip: "", illness: "" });
  };

  const displayedProfiles = profiles.filter(profile => {
    let matchSearch = true;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      matchSearch = !!(profile.name?.toLowerCase().includes(term) || profile.address?.toLowerCase().includes(term));
    }
    const isMatch = (selectedList: string[], dbValue: string = "") => {
      if (selectedList.length === 0) return true;
      const cleanDbValue = dbValue.trim().toLowerCase();
      return selectedList.some(filterItem => {
        if (filterItem.toLowerCase() === cleanDbValue) return true;
        const aliases = ALIAS_MAP[filterItem] || [];
        return aliases.some(alias => alias.toLowerCase() === cleanDbValue);
      });
    };
    const matchBarangay = selectedFilters.barangay.length === 0 || selectedFilters.barangay.some(b => profile.address?.toLowerCase().includes(b.toLowerCase()));
    return matchSearch && matchBarangay && isMatch(selectedFilters.gender, profile.sex) && isMatch(selectedFilters.religion, profile.religion) && isMatch(selectedFilters.ip, profile.ip) && isMatch(selectedFilters.disability, profile.disability) && isMatch(selectedFilters.illness, profile.illness);
  });

  const totalPages = Math.max(1, Math.ceil(displayedProfiles.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProfiles = displayedProfiles.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="tablePageRoot">
      <style dangerouslySetInnerHTML={{__html: `
        html, body { margin: 0; padding: 0; height: 100%; overflow: hidden; }
        .tablePageRoot { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #ffffff; display: flex; height: 100%; overflow: hidden; }
        .tablePageRoot * { box-sizing: border-box; }
        .tablePageRoot .page-container { background-color: white; width: 100%; display: flex; flex-direction: column; height: 100%; overflow: hidden; }
        .tablePageRoot .header { background-color: #a68cb0; padding: 12px 25px; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #8e6e9e; flex-shrink: 0; height: 80px; }
        .tablePageRoot .header-left { display: flex; align-items: center; gap: 15px; }
        .tablePageRoot .logo-box { width: 50px; height: 50px; background-color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .tablePageRoot .logo-box img { width: 100%; height: 100%; object-fit: contain; }
        .tablePageRoot .header-title { font-size: 1.2rem; color: #2a1b3c; }
        .tablePageRoot .dropdown { position: relative; display: inline-block; }
        .tablePageRoot .dropdown-content { display: none; position: absolute; background-color: white; min-width: 150px; box-shadow: 0px 8px 24px rgba(0,0,0,0.2); z-index: 100; border: 1px solid #ccc; border-radius: 8px; right: 0; overflow: hidden; }
        .tablePageRoot .dropdown-content.show { display: block; }
        .tablePageRoot .dropdown-content a { color: black; padding: 12px 16px; text-decoration: none; display: block; }
        .tablePageRoot .dropdown-content a:hover { background-color: #f1f1f1; }
        .tablePageRoot .main-layout { display: flex; flex: 1; min-height: 0; overflow: hidden; }
        .tablePageRoot .side-menu { width: 320px; background-color: #f4f0fa; border-right: 2px solid #cbbade; display: flex; flex-direction: column; transition: width 0.3s ease; overflow: hidden; flex-shrink: 0; }
        .tablePageRoot .side-menu.collapsed { width: 0; min-width: 0; border-right: none; }
        .tablePageRoot .side-menu-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 20px 10px 20px; border-bottom: 2px solid #dcd0e8; background-color: #f4f0fa; flex-shrink: 0; }
        .tablePageRoot .side-menu-header h3 { font-size: 1.4rem; font-weight: 700; color: #2a1b3c; margin: 0; padding-left: 8px; border-left: 6px solid #512da8; white-space: nowrap; }
        .tablePageRoot .side-menu-content { flex: 1; overflow-y: auto; padding: 15px 20px 20px 20px; background-color: #f4f0fa; scrollbar-width: thin; scrollbar-color: #a68cb0 #ede7f6; }
        .tablePageRoot .filter-category { margin-bottom: 15px; border-radius: 8px; background: #f9f9fc; border: 1px solid #e0dce5; }
        .tablePageRoot .category-header { background-color: #ede7f6; padding: 12px 16px; font-weight: 600; color: #2a1b3c; border-radius: 8px 8px 0 0; cursor: pointer; display: flex; justify-content: space-between; align-items: center; user-select: none; }
        .tablePageRoot .category-indicator { font-size: 1.2rem; color: #512da8; }
        .tablePageRoot .category-checklist { padding: 14px 16px 10px 16px; background: white; border-radius: 0 0 8px 8px; border-top: 1px solid #e6dfed; max-height: 200px; overflow-y: auto; }
        .tablePageRoot .checkbox-item { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-size: 0.95rem; cursor: pointer; }
        .tablePageRoot .checkbox-item input[type="checkbox"] { width: 16px; height: 16px; accent-color: #6a4e9b; cursor: pointer; }
        .tablePageRoot .checkbox-item label { cursor: pointer; flex: 1; color: #1e1428; }
        .tablePageRoot .others-row { display: flex; gap: 6px; margin-top: 6px; align-items: center; }
        .tablePageRoot .others-row input[type="text"] { flex: 1; padding: 6px 10px; border: 1px solid #ccc; border-radius: 20px; font-size: 0.85rem; background: white; outline: none; }
        .tablePageRoot .btn-add-others { background: #e0d4f0; border: none; border-radius: 20px; padding: 5px 12px; font-size: 0.8rem; cursor: pointer; transition: background 0.2s; }
        .tablePageRoot .filter-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 25px; padding-top: 15px; border-top: 2px solid #dcd0e8; background: #f4f0fa; }
        .tablePageRoot .btn-apply { background-color: #512da8 !important; color: white; padding: 10px 25px !important; border-radius: 30px !important; font-size: 0.95rem; font-weight: bold; border: none; cursor: pointer; }
        .tablePageRoot .btn-clear-all { color: #666; text-decoration: underline; padding: 8px 12px; background: none; border: none; cursor: pointer; font-weight: bold; }
        .tablePageRoot .main-content { flex: 1; display: flex; flex-direction: column; min-width: 0; min-height: 0; background: white; overflow: hidden; }
        .tablePageRoot .action-bar { padding: 20px 25px; display: flex; gap: 12px; align-items: center; flex-wrap: wrap; background: white; flex-shrink: 0; }
        .tablePageRoot .btn-filter { background-color: #512da8; color: white; display: flex; align-items: center; gap: 8px; padding: 10px 25px; border: none; border-radius: 20px; font-weight: bold; cursor: pointer; transition: 0.2s; white-space: nowrap; }
        .tablePageRoot .search-wrapper { position: relative; flex: 1; min-width: 300px; display: flex; align-items: center; }
        .tablePageRoot .search-input { width: 100%; padding: 12px 45px 12px 25px; border: 2px solid #000; border-radius: 30px; font-size: 1rem; outline: none; }
        .tablePageRoot .clear-search { position: absolute; right: 15px; background: #ccc; color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer; user-select: none; }
        .tablePageRoot .btn { padding: 10px 25px; border: none; border-radius: 20px; font-weight: bold; cursor: pointer; color: white; transition: 0.2s; white-space: nowrap; }
        .tablePageRoot .btn-search, .tablePageRoot .btn-add { background-color: #512da8; }
        .tablePageRoot .btn-summary { background-color: #8bc34a; }
        .tablePageRoot .table-area { padding: 0 25px 0 25px; flex: 1; overflow-x: auto; overflow-y: auto; min-height: 0; }
        .tablePageRoot .table-title { font-weight: bold; margin-bottom: 15px; font-size: 1.2rem; color: #333; padding-top: 5px; }
        .tablePageRoot table { width: 100%; border-collapse: collapse; min-width: 1200px; background: white; }
        .tablePageRoot th { background-color: #f8f8f8; font-weight: 600; padding: 12px 10px; border: 1px solid #ccc; text-align: left; font-size: 0.9rem; }
        .tablePageRoot td { padding: 10px; border: 1px solid #ccc; text-align: left; font-size: 0.9rem; }
        .tablePageRoot .check-btn { background-color: #f8bbd0; color: #000; text-decoration: none; border: 1px solid #c2185b; padding: 6px 12px; border-radius: 4px; font-weight: bold; font-size: 0.8rem; display: inline-block; text-align: center; white-space: nowrap; cursor: pointer; }
        .tablePageRoot .footer-controls { padding: 20px 25px; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #eee; background: white; flex-shrink: 0; }
        .tablePageRoot .btn-print { background-color: #0d47a1; color: white; padding: 10px 25px; border-radius: 4px; border: none; font-weight: bold; cursor: pointer; }
        .tablePageRoot .pagination { display: flex; gap: 5px; align-items: center; }
        .tablePageRoot .pg-btn { border: 1px solid #ccc; background: white; padding: 8px 14px; border-radius: 4px; cursor: pointer; font-weight: 500; }
        .tablePageRoot .pg-btn.active { background-color: #512da8; color: white; border-color: #512da8; }
        .tablePageRoot .pg-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .tablePageRoot .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.45); display: flex; justify-content: center; align-items: center; z-index: 2000; }
        .tablePageRoot .modal-box { background: white; padding: 40px 50px; border-radius: 14px; text-align: center; width: 400px; max-width: 90%; box-shadow: 0 15px 40px rgba(0,0,0,0.4); }
        .tablePageRoot .modal-buttons { display: flex; justify-content: center; gap: 20px; margin-top: 25px; }
        .tablePageRoot .modal-btn { padding: 12px 35px; border: none; border-radius: 25px; font-size: 1rem; font-weight: bold; cursor: pointer; }
        .tablePageRoot .yes { background: #d32f2f; color: white; }
        .tablePageRoot .no { background: #bbb; color: white; }

        /* ✅ KEY FIX: Hide the print template visually but keep it in the DOM layout */
        .print-only {
          position: absolute;
          left: -9999px;
          top: 0;
          width: 1px;
          height: 1px;
          overflow: hidden;
          pointer-events: none;
        }

        @media print {
          html, body {
            height: auto !important;
            overflow: visible !important;
            background-color: white !important;
          }
          /* ✅ Make the print template fully visible and full-width when printing */
          .print-only {
            position: static !important;
            left: auto !important;
            top: auto !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
          }
        }
      `}} />

      {notification && (
        <div style={{ position: 'fixed', top: '100px', left: '50%', transform: 'translateX(-50%)', backgroundColor: notification.type === 'loading' ? '#2196F3' : notification.type === 'success' ? '#4CAF50' : '#f44336', color: 'white', padding: '15px 30px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', zIndex: 999999, fontWeight: 'bold', fontSize: '16px', display: 'flex', alignItems: 'center', transition: 'all 0.3s ease' }}>
          {notification.message}
        </div>
      )}

      <div className="page-container">
        <header className="header">
          <div className="header-left">
            <div className="logo-box"><img src="/cswd.png" alt="Logo" /></div>
            <span className="header-title"><b>CSWDO - Biñan City</b></span>
          </div>
          <div className="dropdown">
            <button className="btn" style={{color:'#333', background:'none', fontSize: '15px', fontWeight: 'bold'}} onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>Username &#9662;</button>
            <div className={`dropdown-content ${isUserMenuOpen ? 'show' : ''}`}>
              <a href="#">Profile</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setShowLogoutModal(true); }} style={{color:'red', borderTop: '1px solid #eee'}}>Logout</a>
            </div>
          </div>
        </header>

        {showLogoutModal && (
          <div className="modal-overlay" onClick={() => setShowLogoutModal(false)}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
              <p style={{fontSize: '1.3rem', fontWeight: 600, color: '#333'}}>Are you sure you want to logout?</p>
              <div className="modal-buttons">
                <button className="modal-btn yes" onClick={() => router.push('/login')}>YES</button>
                <button className="modal-btn no" onClick={() => setShowLogoutModal(false)}>NO</button>
              </div>
            </div>
          </div>
        )}

        <div className="main-layout">
          <div className={`side-menu ${isSideMenuCollapsed ? 'collapsed' : ''}`}>
            <div className="side-menu-header"><h3>FILTERS</h3></div>
            <div className="side-menu-content">
              {Object.keys(FILTER_OPTIONS).map(catKey => (
                <div className="filter-category" key={catKey}>
                  <div className="category-header" onClick={() => toggleCategory(catKey)}>
                    <span style={{textTransform: 'capitalize'}}>{catKey}</span>
                    <span className="category-indicator">{openCategories[catKey] ? '▲' : '▼'}</span>
                  </div>
                  {openCategories[catKey] && (
                    <div className="category-checklist">
                      {FILTER_OPTIONS[catKey as keyof typeof FILTER_OPTIONS].map(item => (
                        <div className="checkbox-item" key={item}>
                          <input type="checkbox" id={`${catKey}-${item}`} checked={selectedFilters[catKey].includes(item)} onChange={() => handleFilterChange(catKey, item)} />
                          <label htmlFor={`${catKey}-${item}`}>{item}</label>
                        </div>
                      ))}
                      {['religion', 'ip', 'illness'].includes(catKey) && (
                        <div className="others-row">
                          <input type="text" placeholder="others:" value={otherInputs[catKey as keyof typeof otherInputs]} onChange={e => setOtherInputs({...otherInputs, [catKey]: e.target.value})} />
                          <button className="btn-add-others" onClick={() => handleAddOther(catKey as any)}>➕</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              <div className="filter-footer">
                <button className="btn-clear-all" onClick={clearAllFilters}>Clear All</button>
                <button className="btn-apply" onClick={() => setIsSideMenuCollapsed(true)}>Apply</button>
              </div>
            </div>
          </div>

          <div className="main-content">
            <div className="action-bar">
              <button className="btn-filter" onClick={() => setIsSideMenuCollapsed(!isSideMenuCollapsed)}>
                {isSideMenuCollapsed ? '☰ FILTER' : '◀ FILTER'}
              </button>
              <div className="search-wrapper">
                <input type="text" className="search-input" placeholder="*FirstName / *LastName / *Barangay" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                {searchTerm && <div className="clear-search" style={{display: 'flex'}} onClick={() => setSearchTerm("")}>✕</div>}
              </div>
              <button className="btn btn-search">Search</button>
              <button className="btn btn-add" onClick={() => router.push('/add-profile')}>Add</button>
              <button className="btn btn-summary" onClick={() => router.push('/analytics')}>Summary</button>
            </div>

            <div className="table-area">
              <div className="table-title">
                Summary of Informations (Showing {displayedProfiles.length === 0 ? 0 : startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, displayedProfiles.length)} of {displayedProfiles.length})
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Name</th><th>Birthday</th><th>Sex</th><th>Contact</th>
                    <th>Address</th><th>Religion</th><th>IP</th><th>Disability</th>
                    <th>Illness</th><th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProfiles.length === 0 ? (
                    <tr><td colSpan={10} style={{ textAlign: 'center', padding: '20px' }}>No records found.</td></tr>
                  ) : (
                    paginatedProfiles.map((profile) => (
                      <tr key={profile.id}>
                        <td>{profile.name || 'N/A'}</td>
                        <td>{profile.birthday || 'N/A'}</td>
                        <td>{profile.sex || 'N/A'}</td>
                        <td>{profile.contact || 'N/A'}</td>
                        <td>{profile.address || 'N/A'}</td>
                        <td>{profile.religion || 'N/A'}</td>
                        <td>{profile.ip || 'N/A'}</td>
                        <td>{profile.disability || 'N/A'}</td>
                        <td>{profile.illness || 'N/A'}</td>
                        <td><button className="check-btn" onClick={() => router.push(`/fulldetails?id=${profile.id}`)}>Check Information</button></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <footer className="footer-controls">
              <button className="btn-print" onClick={() => performPrint && performPrint()}>PRINT REPORT</button>
              <div className="pagination">
                <button suppressHydrationWarning className="pg-btn" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1 || undefined}>&lt;</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                  <button key={pageNum} className={`pg-btn ${currentPage === pageNum ? 'active' : ''}`} onClick={() => setCurrentPage(pageNum)}>{pageNum}</button>
                ))}
                <button suppressHydrationWarning className="pg-btn" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages || undefined}>&gt;</button>
              </div>
            
            </footer>
          </div>
        </div>

        {/* ✅ FIXED: Use off-screen positioning instead of display:none */}
        <div className="print-only">
          <div ref={componentRef} style={{ fontFamily: 'Segoe UI, Arial, sans-serif', padding: '30px', background: 'white' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '8px' }}>
              <img src="/cswd.png" alt="Logo" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
              <div>
                <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#2a1b3c' }}>CSWDO - Biñan City</h2>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#555' }}>City Social Welfare and Development Office</p>
              </div>
            </div>

            <hr style={{ borderColor: '#a68cb0', marginBottom: '10px' }} />

            {/* Report Meta */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '0.85rem', color: '#444' }}>
              <span><b>Summary Report</b> — {displayedProfiles.length} record(s)</span>
              <span>Date Generated: {new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>

            {/* Active Filters Summary */}
            {Object.entries(selectedFilters).some(([, v]) => v.length > 0) && (
              <div style={{ marginBottom: '14px', fontSize: '0.8rem', color: '#555', background: '#f4f0fa', padding: '8px 12px', borderRadius: '6px', border: '1px solid #dcd0e8' }}>
                <b>Active Filters: </b>
                {Object.entries(selectedFilters)
                  .filter(([, v]) => v.length > 0)
                  .map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v.join(', ')}`)
                  .join(' | ')}
              </div>
            )}

            {/* Print Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#a68cb0', color: 'white' }}>
                  {['#', 'Name', 'Birthday', 'Sex', 'Contact', 'Address', 'Religion', 'IP', 'Disability', 'Illness'].map(h => (
                    <th key={h} style={{ padding: '9px 8px', border: '1px solid #8e6e9e', textAlign: 'left', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayedProfiles.map((p, i) => (
                  <tr key={p.id} style={{ backgroundColor: i % 2 === 0 ? '#ffffff' : '#f9f6fd' }}>
                    <td style={{ padding: '8px', border: '1px solid #ddd', color: '#666' }}>{i + 1}</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{p.name || 'N/A'}</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{p.birthday || 'N/A'}</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{p.sex || 'N/A'}</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{p.contact || 'N/A'}</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{p.address || 'N/A'}</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{p.religion || 'N/A'}</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{p.ip || 'N/A'}</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{p.disability || 'N/A'}</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{p.illness || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Print Footer */}
            <div style={{ marginTop: '30px', fontSize: '0.8rem', color: '#888', textAlign: 'center', borderTop: '1px solid #ddd', paddingTop: '10px' }}>
              CSWDO Biñan City
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}