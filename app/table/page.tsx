'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs } from "firebase/firestore";
import { db } from '../../lib/firebase';
import Header from '../../components/Header';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../lib/firebase";

// 1. FILTER OPTIONS
const FILTER_OPTIONS = {
  barangays: ["Biñan", "Bungahan", "Canlalay", "Casile", "De La Paz", "Ganado", "Langkiwa", "Loma", "Malaban", "Malamig", "Mamplasan", "Platero", "Poblacion", "San Antonio", "San Francisco", "San Jose", "San Vicente", "Santo Domingo", "Santo Niño", "Santo Tomas", "Soro-soro", "Timbao", "Tubigan", "Zapote"],
  genders: ["Female", "Male"],
  religions: ["None", "Aglipay", "Roman Catholic", "Seventh Day Adventist", "Islam", "Bible Baptist Church", "Iglesia ni Cristo", "Jehovah's Witness", "United Methodists Church", "Tribal Religions"],
  ip: ["Non-IP", "Aeta", "Ati", "Badjao", "Bago", "Batak", "Bukidnon", "B'laan", "Cimaron", "Cayonen", "Dumagat", "Ibaloi", "Ibanag", "Itom", "Kankanaey", "Mandaya", "Mangyan", "Manobo", "Palawano", "Pullon", "Subanen"],
  disabilities: ["None", "Physical", "Intellectual", "Learning", "Visual", "Mental", "Psychosocial", "Deaf/Hard of Hearing", "Speech and Language Impairment", "Cancer", "Rare Disease"],
  illnesses: ["None", "Cancer", "Cardio-vascular Disease", "Paralysis", "Organ Failure"]
};

// 1.5 ACRONYM & ALIAS MAP
// Add any acronyms you expect to see in your database here
const ALIAS_MAP: Record<string, string[]> = {
  "Cardio-vascular Disease": ["CVD", "Cardiovascular"],
  "Iglesia ni Cristo": ["INC"],
  "Deaf/Hard of Hearing": ["HOH", "Deaf"],
  "Speech and Language Impairment": ["SLI"],
  "United Methodists Church": ["UMC"],
  "Non-IP": ["Non IP", "Non-Ip", "Non Indigenous","N/A", "None"],
};

// 2. INTERFACE
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
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const router = useRouter();

  // --- SEARCH, FILTER & PAGINATION STATES ---
  const [searchTerm, setSearchTerm] = useState(""); 
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({
    barangay: [], gender: [], religion: [], ip: [], disability: [], illness: []
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10; 

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

  // Reset to page 1 whenever search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedFilters]);

  const toggleCategory = (categoryName: string) => setOpenCategory(openCategory === categoryName ? null : categoryName);

  const handleFilterChange = (category: string, value: string) => {
    setSelectedFilters(prev => {
      const currentList = prev[category] || [];
      if (currentList.includes(value)) {
        return { ...prev, [category]: currentList.filter(item => item !== value) };
      }
      return { ...prev, [category]: [...currentList, value] };
    });
  };

  const clearAllFilters = () => {
    setSelectedFilters({ barangay: [], gender: [], religion: [], ip: [], disability: [], illness: [] });
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  // --- BULLETPROOF CASE-INSENSITIVE & ACRONYM FILTER LOGIC ---
  const displayedProfiles = profiles.filter(profile => {
    // 1. SEARCH FILTER
    let matchSearch = true;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = profile.name?.toLowerCase().includes(term);
      const matchAddress = profile.address?.toLowerCase().includes(term);
      matchSearch = !!(matchName || matchAddress);
    }

    // HELPER FUNCTION: Checks for exact match OR acronym match
    const isMatch = (selectedList: string[], dbValue: string = "") => {
      if (selectedList.length === 0) return true; // Bypass if no filters checked
      
      const cleanDbValue = dbValue.trim().toLowerCase();

      return selectedList.some(filterItem => {
        // Check if it matches the main filter word
        if (filterItem.toLowerCase() === cleanDbValue) return true;
        
        // Check if it matches any known acronyms for this filter word
        const aliases = ALIAS_MAP[filterItem] || [];
        return aliases.some(alias => alias.toLowerCase() === cleanDbValue);
      });
    };

    // 2. CATEGORY FILTERS
    const matchBarangay = selectedFilters.barangay.length === 0 || 
      selectedFilters.barangay.some(b => profile.address?.toLowerCase().includes(b.toLowerCase()));

    const matchGender = isMatch(selectedFilters.gender, profile.sex);
    const matchReligion = isMatch(selectedFilters.religion, profile.religion);
    const matchIp = isMatch(selectedFilters.ip, profile.ip);
    const matchDisability = isMatch(selectedFilters.disability, profile.disability);
    const matchIllness = isMatch(selectedFilters.illness, profile.illness);

    // 3. FINAL COMBINATION
    return matchSearch && matchBarangay && matchGender && matchReligion && matchIp && matchDisability && matchIllness;
  });

  // --- PAGINATION LOGIC ---
  const totalPages = Math.max(1, Math.ceil(displayedProfiles.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProfiles = displayedProfiles.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="tableWrapper">
      <div className="pageContainer">
        <Header />

        <div className="actionBar">
          <div className="dropdown">
            <button className="btn btnFilter" onClick={() => setShowFilterMenu(!showFilterMenu)}>⚙ FILTER &#9662;</button>
            <div className={`dropdownContent ${showFilterMenu ? 'show' : ''}`}>
              
              {/* BARANGAY FILTER */}
              <div className="filterCategory">
                <div className="categoryHeader" onClick={() => toggleCategory('barangay')}>
                  <span>Barangay</span><span className="categoryIndicator">▼</span>
                </div>
                <div className="categoryChecklist" style={{ display: openCategory === 'barangay' ? 'block' : 'none' }}>
                  {FILTER_OPTIONS.barangays.map(item => (
                    <div className="checkboxItem" key={item}>
                      <input type="checkbox" id={`brgy-${item}`} checked={selectedFilters.barangay.includes(item)} onChange={() => handleFilterChange('barangay', item)} />
                      <label htmlFor={`brgy-${item}`}>{item}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* GENDER FILTER */}
              <div className="filterCategory">
                <div className="categoryHeader" onClick={() => toggleCategory('gender')}>
                  <span>Gender</span><span className="categoryIndicator">▼</span>
                </div>
                <div className="categoryChecklist" style={{ display: openCategory === 'gender' ? 'block' : 'none' }}>
                  {FILTER_OPTIONS.genders.map(item => (
                    <div className="checkboxItem" key={item}>
                      <input type="checkbox" id={`gender-${item}`} checked={selectedFilters.gender.includes(item)} onChange={() => handleFilterChange('gender', item)} />
                      <label htmlFor={`gender-${item}`}>{item}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* RELIGION FILTER */}
              <div className="filterCategory">
                <div className="categoryHeader" onClick={() => toggleCategory('religion')}>
                  <span>Religion</span><span className="categoryIndicator">▼</span>
                </div>
                <div className="categoryChecklist" style={{ display: openCategory === 'religion' ? 'block' : 'none' }}>
                  {FILTER_OPTIONS.religions.map(item => (
                    <div className="checkboxItem" key={item}>
                      <input type="checkbox" id={`rel-${item}`} checked={selectedFilters.religion.includes(item)} onChange={() => handleFilterChange('religion', item)} />
                      <label htmlFor={`rel-${item}`}>{item}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* IP MEMBERSHIP */}
              <div className="filterCategory">
                <div className="categoryHeader" onClick={() => toggleCategory('ip')}>
                  <span>IP Membership</span><span className="categoryIndicator">▼</span>
                </div>
                <div className="categoryChecklist" style={{ display: openCategory === 'ip' ? 'block' : 'none' }}>
                  {FILTER_OPTIONS.ip.map(item => (
                    <div className="checkboxItem" key={item}>
                      <input type="checkbox" id={`ip-${item}`} checked={selectedFilters.ip.includes(item)} onChange={() => handleFilterChange('ip', item)} />
                      <label htmlFor={`ip-${item}`}>{item}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* DISABILITY FILTER */}
              <div className="filterCategory">
                <div className="categoryHeader" onClick={() => toggleCategory('disability')}>
                  <span>Disability / Special Needs</span><span className="categoryIndicator">▼</span>
                </div>
                <div className="categoryChecklist" style={{ display: openCategory === 'disability' ? 'block' : 'none' }}>
                  {FILTER_OPTIONS.disabilities.map(item => (
                    <div className="checkboxItem" key={item}>
                      <input type="checkbox" id={`dis-${item}`} checked={selectedFilters.disability.includes(item)} onChange={() => handleFilterChange('disability', item)} />
                      <label htmlFor={`dis-${item}`}>{item}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* ILLNESS FILTER */}
              <div className="filterCategory">
                <div className="categoryHeader" onClick={() => toggleCategory('illness')}>
                  <span>Critical Illness</span><span className="categoryIndicator">▼</span>
                </div>
                <div className="categoryChecklist" style={{ display: openCategory === 'illness' ? 'block' : 'none' }}>
                  {FILTER_OPTIONS.illnesses.map(item => (
                    <div className="checkboxItem" key={item}>
                      <input type="checkbox" id={`ill-${item}`} checked={selectedFilters.illness.includes(item)} onChange={() => handleFilterChange('illness', item)} />
                      <label htmlFor={`ill-${item}`}>{item}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="filterFooter">
                <button className="btnClearAll" onClick={clearAllFilters}>Clear All</button>
                <button className="btnApply" onClick={() => setShowFilterMenu(false)}>Apply</button>
              </div>
            </div>
          </div>

          <div className="searchWrapper">
            <input 
              type="text" 
              className="searchInput" 
              placeholder="*FirstName / *LastName / *Barangay" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && <div className="clearSearch" onClick={handleClearSearch}>✕</div>}
          </div>
          
          <button className="btn btnSearch">Search</button>
          <button className="btn btnAdd" onClick={() => router.push('/add-profile')}>Add</button>
          <button className="btn btnSummary" onClick={() => router.push('/analytics')}>Summary</button>
        </div>

        <div className="tableArea">
          <div className="tableTitle">Summary of Informations</div>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Birthday</th>
                <th>Sex</th>
                <th>Contact Number</th>
                <th>Address</th>
                <th>Religion</th>
                <th>IP Membership</th>
                <th>Disability / Special Needs</th>
                <th>Critical Illness</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProfiles.length === 0 ? (
                <tr><td colSpan={10} style={{ textAlign: 'center', padding: '20px' }}>No records found matching your filters.</td></tr>
              ) : (
                paginatedProfiles.map((profile) => {
                  return (
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
                      <td><button className="checkBtn" onClick={() => router.push(`/profile?id=${profile.id}`)}>Check Information</button></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <footer className="footerControls">
          <button className="btnPrint">PRINT REPORT</button>
          
          <div className="pagination">
            <button 
              className="pgBtn" 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              style={{ opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
            >
              &lt;
            </button>
            
            {Array.from({ length: totalPages }, (_, index) => index + 1).map(pageNum => (
              <button 
                key={pageNum}
                className={`pgBtn ${currentPage === pageNum ? 'active' : ''}`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            ))}
            
            <button 
              className="pgBtn" 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              style={{ opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
            >
              &gt;
            </button>
          </div>
        </footer>

      </div>
    </div>
  );
}