'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs } from "firebase/firestore";
import { db } from '../../lib/firebase';
import Header from '../../components/Header';
import styles from '../../styles/table.module.css';

// 1. WE DEFINE ALL OUR FILTER OPTIONS HERE TO KEEP THE HTML CLEAN
const FILTER_OPTIONS = {
  barangays: ["Biñan", "Bungahan", "Canlalay", "Casile", "De La Paz", "Ganado", "Langkiwa", "Loma", "Malaban", "Malamig", "Mamplasan", "Platero", "Poblacion", "San Antonio", "San Francisco", "San Jose", "San Vicente", "Santo Domingo", "Santo Niño", "Santo Tomas", "Soro-soro", "Timbao", "Tubigan", "Zapote"],
  genders: ["Female", "Male"],
  religions: ["None", "Aglipay", "Roman Catholic", "Seventh Day Adventist", "Islam", "Bible Baptist Church", "Iglesia ni Cristo", "Jehovah's Witness", "United Methodists Church", "Tribal Religions"],
  ip: ["Non-IP", "Aeta", "Ati", "Badjao", "Bago", "Batak", "Bukidnon", "B'laan", "Cimaron", "Cayonen", "Dumagat", "Ibaloi", "Ibanag", "Itom", "Kankanaey", "Mandaya", "Mangyan", "Manobo", "Palawano", "Pullon", "Subanen"],
  education: ["Without Formal Education", "Elementary", "Elementary Graduate", "High School", "High School Graduate", "Vocational Course", "Voc. Course Graduate", "College", "College Graduate", "Post College Degree"],
  disabilities: ["None", "Physical", "Intellectual", "Learning", "Visual", "Mental", "Psychosocial", "Deaf/Hard of Hearing", "Speech and Language Impairment", "Cancer", "Rare Disease"],
  illnesses: ["None", "Cancer", "Cardio-vascular Disease", "Paralysis", "Organ Failure"]
};

interface ProfileData {
  id: string;
  barangay?: string;
  child_profile?: {
    name?: string; sex?: string; contact_number?: string; religion?: string; ip_membership?: string; disability_special_needs?: string; critical_illness?: string; date_of_birth?: any; 
  };
}

export default function TablePage() {
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const router = useRouter();

  // 2. THIS STATE TRACKS EVERYTHING THE USER CHECKED
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({
    barangay: [], gender: [], religion: [], ip: [], education: [], disability: [], illness: []
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const querySnapshot = await getDocs(collection(db, "Profile"));
        const dataList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ProfileData[];
        setProfiles(dataList);
      } catch (error) { console.error("Error fetching data:", error); }
    }
    fetchData();
  }, []);

  const toggleCategory = (categoryName: string) => setOpenCategory(openCategory === categoryName ? null : categoryName);

  // 3. THIS FUNCTION ADDS/REMOVES ITEMS FROM THE FILTER STATE WHEN CLICKED
  const handleFilterChange = (category: string, value: string) => {
    setSelectedFilters(prev => {
      const currentList = prev[category] || [];
      if (currentList.includes(value)) {
        return { ...prev, [category]: currentList.filter(item => item !== value) }; // Remove if unchecked
      }
      return { ...prev, [category]: [...currentList, value] }; // Add if checked
    });
  };

  const clearAllFilters = () => {
    setSelectedFilters({ barangay: [], gender: [], religion: [], ip: [], education: [], disability: [], illness: [] });
  };

  return (
    <div className={styles.tableWrapper}>
      <div className={styles.pageContainer}>
        <Header />

        <div className={styles.actionBar}>
          <div className={styles.dropdown}>
            <button className={`${styles.btn} ${styles.btnFilter}`} onClick={() => setShowFilterMenu(!showFilterMenu)}>⚙ FILTER &#9662;</button>
            <div className={`${styles.dropdownContent} ${showFilterMenu ? styles.show : ''}`}>
              
              {/* BARANGAY FILTER */}
              <div className={styles.filterCategory}>
                <div className={styles.categoryHeader} onClick={() => toggleCategory('barangay')}>
                  <span>Barangay</span><span className={styles.categoryIndicator}>▼</span>
                </div>
                <div className={styles.categoryChecklist} style={{ display: openCategory === 'barangay' ? 'block' : 'none' }}>
                  {FILTER_OPTIONS.barangays.map(item => (
                    <div className={styles.checkboxItem} key={item}>
                      <input type="checkbox" id={`brgy-${item}`} checked={selectedFilters.barangay.includes(item)} onChange={() => handleFilterChange('barangay', item)} />
                      <label htmlFor={`brgy-${item}`}>{item}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* GENDER FILTER */}
              <div className={styles.filterCategory}>
                <div className={styles.categoryHeader} onClick={() => toggleCategory('gender')}>
                  <span>Gender</span><span className={styles.categoryIndicator}>▼</span>
                </div>
                <div className={styles.categoryChecklist} style={{ display: openCategory === 'gender' ? 'block' : 'none' }}>
                  {FILTER_OPTIONS.genders.map(item => (
                    <div className={styles.checkboxItem} key={item}>
                      <input type="checkbox" id={`gender-${item}`} checked={selectedFilters.gender.includes(item)} onChange={() => handleFilterChange('gender', item)} />
                      <label htmlFor={`gender-${item}`}>{item}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* RELIGION FILTER */}
              <div className={styles.filterCategory}>
                <div className={styles.categoryHeader} onClick={() => toggleCategory('religion')}>
                  <span>Religion</span><span className={styles.categoryIndicator}>▼</span>
                </div>
                <div className={styles.categoryChecklist} style={{ display: openCategory === 'religion' ? 'block' : 'none' }}>
                  {FILTER_OPTIONS.religions.map(item => (
                    <div className={styles.checkboxItem} key={item}>
                      <input type="checkbox" id={`rel-${item}`} checked={selectedFilters.religion.includes(item)} onChange={() => handleFilterChange('religion', item)} />
                      <label htmlFor={`rel-${item}`}>{item}</label>
                    </div>
                  ))}
                  <div className={styles.othersRow}>
                    <input type="text" placeholder="others:" />
                    <button style={{ background: '#e0d4f0', border: 'none', borderRadius: '20px', padding: '5px 12px', fontSize: '0.8rem', cursor: 'pointer' }}>➕</button>
                  </div>
                </div>
              </div>

              {/* IP MEMBERSHIP */}
              <div className={styles.filterCategory}>
                <div className={styles.categoryHeader} onClick={() => toggleCategory('ip')}>
                  <span>IP Membership</span><span className={styles.categoryIndicator}>▼</span>
                </div>
                <div className={styles.categoryChecklist} style={{ display: openCategory === 'ip' ? 'block' : 'none' }}>
                  {FILTER_OPTIONS.ip.map(item => (
                    <div className={styles.checkboxItem} key={item}>
                      <input type="checkbox" id={`ip-${item}`} checked={selectedFilters.ip.includes(item)} onChange={() => handleFilterChange('ip', item)} />
                      <label htmlFor={`ip-${item}`}>{item}</label>
                    </div>
                  ))}
                  <div className={styles.othersRow}>
                    <input type="text" placeholder="others:" />
                    <button style={{ background: '#e0d4f0', border: 'none', borderRadius: '20px', padding: '5px 12px', fontSize: '0.8rem', cursor: 'pointer' }}>➕</button>
                  </div>
                </div>
              </div>

              {/* EDUCATION FILTER */}
              <div className={styles.filterCategory}>
                <div className={styles.categoryHeader} onClick={() => toggleCategory('education')}>
                  <span>Education</span><span className={styles.categoryIndicator}>▼</span>
                </div>
                <div className={styles.categoryChecklist} style={{ display: openCategory === 'education' ? 'block' : 'none' }}>
                  {FILTER_OPTIONS.education.map(item => (
                    <div className={styles.checkboxItem} key={item}>
                      <input type="checkbox" id={`edu-${item}`} checked={selectedFilters.education.includes(item)} onChange={() => handleFilterChange('education', item)} />
                      <label htmlFor={`edu-${item}`}>{item}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* DISABILITY FILTER */}
              <div className={styles.filterCategory}>
                <div className={styles.categoryHeader} onClick={() => toggleCategory('disability')}>
                  <span>Disability / Special Needs</span><span className={styles.categoryIndicator}>▼</span>
                </div>
                <div className={styles.categoryChecklist} style={{ display: openCategory === 'disability' ? 'block' : 'none' }}>
                  {FILTER_OPTIONS.disabilities.map(item => (
                    <div className={styles.checkboxItem} key={item}>
                      <input type="checkbox" id={`dis-${item}`} checked={selectedFilters.disability.includes(item)} onChange={() => handleFilterChange('disability', item)} />
                      <label htmlFor={`dis-${item}`}>{item}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* ILLNESS FILTER */}
              <div className={styles.filterCategory}>
                <div className={styles.categoryHeader} onClick={() => toggleCategory('illness')}>
                  <span>Critical Illness</span><span className={styles.categoryIndicator}>▼</span>
                </div>
                <div className={styles.categoryChecklist} style={{ display: openCategory === 'illness' ? 'block' : 'none' }}>
                  {FILTER_OPTIONS.illnesses.map(item => (
                    <div className={styles.checkboxItem} key={item}>
                      <input type="checkbox" id={`ill-${item}`} checked={selectedFilters.illness.includes(item)} onChange={() => handleFilterChange('illness', item)} />
                      <label htmlFor={`ill-${item}`}>{item}</label>
                    </div>
                  ))}
                  <div className={styles.othersRow}>
                    <input type="text" placeholder="others:" />
                    <button style={{ background: '#e0d4f0', border: 'none', borderRadius: '20px', padding: '5px 12px', fontSize: '0.8rem', cursor: 'pointer' }}>➕</button>
                  </div>
                </div>
              </div>

              <div className={styles.filterFooter}>
                <button className={styles.btnClearAll} onClick={clearAllFilters}>Clear All</button>
                <button className={styles.btnApply} onClick={() => setShowFilterMenu(false)}>Apply</button>
              </div>
            </div>
          </div>

          <div className={styles.searchWrapper}>
            <input type="text" className={styles.searchInput} placeholder="*FirstName / *LastName / *Barangay" />
            <div className={styles.clearSearch}>✕</div>
          </div>
          
          <button className={`${styles.btn} ${styles.btnSearch}`}>Search</button>
          <button className={`${styles.btn} ${styles.btnAdd}`} onClick={() => router.push('/add-profile')}>Add</button>
          <button className={`${styles.btn} ${styles.btnSummary}`} onClick={() => router.push('/analytics')}>Summary</button>
        </div>

        <div className={styles.tableArea}>
          <div className={styles.tableTitle}>Summary of Informations</div>
          <table>
            <thead>
              <tr>
                <th>Name</th><th>Birthday</th><th>Sex</th><th>Contact Number</th><th>Address</th><th>Religion</th><th>IP Membership</th><th>Disability / Special Needs</th><th>Critical Illness</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {profiles.length === 0 ? (
                <tr><td colSpan={10} style={{ textAlign: 'center' }}>Loading data...</td></tr>
              ) : (
                profiles.map((profile) => {
                  const child = profile.child_profile || {};
                  const fullAddress = profile.barangay || 'N/A';
                  let formattedDOB = 'N/A';
                  if (child.date_of_birth && typeof child.date_of_birth.toDate === 'function') formattedDOB = child.date_of_birth.toDate().toLocaleDateString();
                  return (
                    <tr key={profile.id}>
                      <td>{child.name || 'N/A'}</td><td>{formattedDOB}</td><td>{child.sex || 'N/A'}</td><td>{child.contact_number || 'N/A'}</td><td>{fullAddress}</td><td>{child.religion || 'N/A'}</td><td>{child.ip_membership || 'N/A'}</td><td>{child.disability_special_needs || 'N/A'}</td><td>{child.critical_illness || 'N/A'}</td>
                      <td><button className={styles.checkBtn} onClick={() => router.push(`/profile?id=${profile.id}`)}>Check Information</button></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <footer className={styles.footerControls}>
          <button className={styles.btnPrint}>PRINT REPORT</button>
          <div className={styles.pagination}>
            <button className={styles.pgBtn}>&lt;</button>
            <button className={`${styles.pgBtn} ${styles.active}`}>1</button>
            <button className={styles.pgBtn}>2</button>
            <button className={styles.pgBtn}>&gt;</button>
          </div>
        </footer>

      </div>
    </div>
  );
}