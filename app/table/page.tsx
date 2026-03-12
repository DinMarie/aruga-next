'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs } from "firebase/firestore";
import { db } from '../../lib/firebase';
import Header from '../../components/Header';
import '../../styles/table.css';

interface ProfileData {
  id: string;
  barangay?: string;
  child_profile?: {
    name?: string;
    sex?: string;
    contact_number?: string;
    religion?: string;
    ip_membership?: string;
    disability_special_needs?: string;
    critical_illness?: string;
    date_of_birth?: any; 
  };
}

export default function TablePage() {
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        const querySnapshot = await getDocs(collection(db, "Profile"));
        const dataList = querySnapshot.docs.map(doc => ({
          id: doc.id, ...doc.data()
        })) as ProfileData[];
        setProfiles(dataList);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
  }, []);

  const toggleCategory = (categoryName: string) => {
    setOpenCategory(openCategory === categoryName ? null : categoryName);
  };

  return (
    <div className="table-wrapper">
      <div className="page-container">
        
        <Header />

        <div className="action-bar">
          <div className="dropdown" id="filterDropdown">
            <button className="btn btn-filter" onClick={() => setShowFilterMenu(!showFilterMenu)}>⚙ FILTER &#9662;</button>
            <div className={`dropdown-content filter-dropdown ${showFilterMenu ? 'show' : ''}`} id="mainFilterPanel">
              
              {/* BARANGAY FILTER */}
              <div className="filter-category">
                <div className="category-header" onClick={() => toggleCategory('barangay')}>
                  <span>Barangay</span><span className="category-indicator">▼</span>
                </div>
                <div className="category-checklist" style={{ display: openCategory === 'barangay' ? 'block' : 'none' }}>
                  <div className="checkbox-item"><input type="checkbox" value="Barangay A" id="brgyA"/><label htmlFor="brgyA">Biñan</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Barangay B" id="brgyB"/><label htmlFor="brgyB">Bungahan</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Barangay C" id="brgyC"/><label htmlFor="brgyC">Canlalay</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Barangay D" id="brgyD"/><label htmlFor="brgyD">Casile</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Barangay E" id="brgyE"/><label htmlFor="brgyE">De La Paz</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Barangay F" id="brgyF"/><label htmlFor="brgyF">Ganado</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Barangay G" id="brgyG"/><label htmlFor="brgyG">Langkiwa</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Barangay H" id="brgyH"/><label htmlFor="brgyH">Loma</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Barangay I" id="brgyI"/><label htmlFor="brgyI">Malaban</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Barangay J" id="brgyJ"/><label htmlFor="brgyJ">Malamig</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Barangay K" id="brgyK"/><label htmlFor="brgyK">Mamplasan</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Barangay L" id="brgyL"/><label htmlFor="brgyL">Platero</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Barangay M" id="brgyM"/><label htmlFor="brgyM">Poblacion</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Barangay N" id="brgyN"/><label htmlFor="brgyN">San Antonio</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Barangay O" id="brgyO"/><label htmlFor="brgyO">San Francisco</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Barangay P" id="brgyP"/><label htmlFor="brgyP">San Jose</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Barangay Q" id="brgyQ"/><label htmlFor="brgyQ">San Vicente</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Barangay R" id="brgyR"/><label htmlFor="brgyR">Santo Domingo</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Barangay S" id="brgyS"/><label htmlFor="brgyS">Santo Ñino</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Barangay T" id="brgyT"/><label htmlFor="brgyT">Santo Tomas</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Barangay U" id="brgyU"/><label htmlFor="brgyU">Soro-soro</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Barangay V" id="brgyV"/><label htmlFor="brgyV">Timbao</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Barangay W" id="brgyW"/><label htmlFor="brgyW">Tubigan</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Barangay X" id="brgyX"/><label htmlFor="brgyX">Zapote</label></div>
                </div>
              </div>

              {/* GENDER FILTER */}
              <div className="filter-category">
                <div className="category-header" onClick={() => toggleCategory('gender')}>
                  <span>Gender</span><span className="category-indicator">▼</span>
                </div>
                <div className="category-checklist" style={{ display: openCategory === 'gender' ? 'block' : 'none' }}>
                  <div className="checkbox-item"><input type="checkbox" value="Female" id="female"/><label htmlFor="female">Female</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Male" id="male"/><label htmlFor="male">Male</label></div>
                </div>
              </div>

              {/* RELIGION FILTER */}
              <div className="filter-category">
                <div className="category-header" onClick={() => toggleCategory('religion')}>
                  <span>Religion</span><span className="category-indicator">▼</span>
                </div>
                <div className="category-checklist" style={{ display: openCategory === 'religion' ? 'block' : 'none' }}>
                  <div className="checkbox-item"><input type="checkbox" value="None1" id="relNone1"/><label htmlFor="relNone1">None</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Aglipay" id="relAglipay"/><label htmlFor="relAglipay">Aglipay</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Roman Catholic" id="relRC"/><label htmlFor="relRC">Roman Catholic</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Seventh Day Adventist" id="relSDA"/><label htmlFor="relSDA">Seventh Day Adventist</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Islam" id="relIslam"/><label htmlFor="relIslam">Islam</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Bible" id="relBible"/><label htmlFor="relBible">Bible Baptist Church</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Iglesia ni Cristo" id="relINC"/><label htmlFor="relINC">Iglesia ni Cristo</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Jehovah's" id="relJehovah"/><label htmlFor="relJehovah">Jehovah's Witness</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="United" id="relUnited"/><label htmlFor="relUnited">United Methodists Church</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Tribal" id="relTribal"/><label htmlFor="relTribal">Tribal Religions</label></div>
                  <div className="others-row">
                    <input type="text" placeholder="others:" />
                    <button style={{ background: '#e0d4f0', border: 'none', borderRadius: '20px', padding: '5px 12px', fontSize: '0.8rem', cursor: 'pointer' }}>➕</button>
                  </div>
                </div>
              </div>

              {/* IP MEMBERSHIP */}
              <div className="filter-category">
                <div className="category-header" onClick={() => toggleCategory('ip')}>
                  <span>IP Membership</span><span className="category-indicator">▼</span>
                </div>
                <div className="category-checklist" style={{ display: openCategory === 'ip' ? 'block' : 'none' }}>
                  <div className="checkbox-item"><input type="checkbox" value="None2" id="relNone2"/><label htmlFor="relNone2">Non-IP</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Aeta" id="aeta"/><label htmlFor="aeta">Aeta</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Ati" id="ati"/><label htmlFor="ati">Ati</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Badjao" id="badjao"/><label htmlFor="badjao">Badjao</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Bago" id="bago"/><label htmlFor="bago">Bago</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Batak" id="batak"/><label htmlFor="batak">Batak</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Bukidnon" id="bukidnon"/><label htmlFor="bukidnon">Bukidnon</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="B'laan" id="blaan"/><label htmlFor="blaan">B'laan</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Cimaron" id="cimaron"/><label htmlFor="cimaron">Cimaron</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Cayonen" id="cayonen"/><label htmlFor="cayonen">Cayonen</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Dumagat" id="dumagat"/><label htmlFor="dumagat">Dumagat</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Ibaloi" id="ibaloi"/><label htmlFor="ibaloi">Ibaloi</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Ibanag" id="ibanag"/><label htmlFor="ibanag">Ibanag</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Itom" id="itom"/><label htmlFor="itom">Itom</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Kankanaey" id="kankanaey"/><label htmlFor="kankanaey">Kankanaey</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Mandaya" id="mandaya"/><label htmlFor="mandaya">Mandaya</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Mangyan" id="mangyan"/><label htmlFor="mangyan">Mangyan</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Manobo" id="manobo"/><label htmlFor="manobo">Manobo</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Palawano" id="palawano"/><label htmlFor="palawano">Palawano</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Pullon" id="pullon"/><label htmlFor="pullon">Pullon</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Subanen" id="subanen"/><label htmlFor="subanen">Subanen</label></div>
                  <div className="others-row">
                    <input type="text" placeholder="others:" />
                    <button style={{ background: '#e0d4f0', border: 'none', borderRadius: '20px', padding: '5px 12px', fontSize: '0.8rem', cursor: 'pointer' }}>➕</button>
                  </div>
                </div>
              </div>

              {/* EDUCATIONAL */}
              <div className="filter-category">
                <div className="category-header" onClick={() => toggleCategory('education')}>
                  <span>Highest Educational Attainment</span><span className="category-indicator">▼</span>
                </div>
                <div className="category-checklist" style={{ display: openCategory === 'education' ? 'block' : 'none' }}>
                  <div className="checkbox-item"><input type="checkbox" value="Without" id="without"/><label htmlFor="without">Without Formal Education</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Elementary" id="elementary"/><label htmlFor="elementary">Elementary</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Elemgrad" id="elemgrad"/><label htmlFor="elemgrad">Elementary Graudate</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Highschool" id="highschool"/><label htmlFor="highschool">High School</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Hsgrad" id="hsgrad"/><label htmlFor="hsgrad">High School Graduate</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Vocational" id="vocational"/><label htmlFor="vocational">Vocational Course</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Vocgrad" id="vocgrad"/><label htmlFor="vocgrad">Voc. Course Graudate</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="College" id="college"/><label htmlFor="college">College</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Collegegrad" id="collegegrad"/><label htmlFor="collegegrad">College Graduate</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Postcollege" id="postcollege"/><label htmlFor="postcollege">Post College Degree</label></div>
                </div>
              </div>

              {/* DISABILITY */}
              <div className="filter-category">
                <div className="category-header" onClick={() => toggleCategory('disability')}>
                  <span>Disability/Special Needs</span><span className="category-indicator">▼</span>
                </div>
                <div className="category-checklist" style={{ display: openCategory === 'disability' ? 'block' : 'none' }}>
                  <div className="checkbox-item"><input type="checkbox" value="None3" id="relNone3"/><label htmlFor="relNone3">None</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Physical" id="physical"/><label htmlFor="physical">Physical</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Intellectual" id="intellectual"/><label htmlFor="intellectual">Intellectual</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Learning" id="learning"/><label htmlFor="learning">Learning</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Visual" id="visual"/><label htmlFor="visual">Visual</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Mental" id="mental"/><label htmlFor="mental">Mental</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Psychosocial" id="psychosocial"/><label htmlFor="psychosocial">Psychosocial</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Deaf" id="deaf"/><label htmlFor="deaf">Deaf/Hard of Hearing</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Speech" id="speech"/><label htmlFor="speech">Speech and Language impairment</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Cancer" id="cancerD"/><label htmlFor="cancerD">Cancer</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Raredisease" id="raredisease"/><label htmlFor="raredisease">Rare Disease</label></div>                      
                </div>
              </div>

              {/* ILLNESS */}
              <div className="filter-category">
                <div className="category-header" onClick={() => toggleCategory('illness')}>
                  <span>Critical Illness</span><span className="category-indicator">▼</span>
                </div>
                <div className="category-checklist" style={{ display: openCategory === 'illness' ? 'block' : 'none' }}>
                  <div className="checkbox-item"><input type="checkbox" value="None3" id="relNone4"/><label htmlFor="relNone4">None</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Cancer1" id="cancer1"/><label htmlFor="cancer1">Cancer</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="CardioV" id="cardiov"/><label htmlFor="cardiov">Cardio-vascular Disease</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Paralysis" id="paralysis"/><label htmlFor="paralysis">Paralysis</label></div>
                  <div className="checkbox-item"><input type="checkbox" value="Organ" id="organ"/><label htmlFor="organ">Organ Failure</label></div>
                  <div className="others-row">
                    <input type="text" placeholder="others:" />
                    <button style={{ background: '#e0d4f0', border: 'none', borderRadius: '20px', padding: '5px 12px', fontSize: '0.8rem', cursor: 'pointer' }}>➕</button>
                  </div>
                </div>
              </div>

              <div className="filter-footer">
                <button className="btn-clear-all" id="clearAllBtn">Clear All</button>
                <button className="btn-apply" id="applyFilterBtn" onClick={() => setShowFilterMenu(false)}>Apply</button>
              </div>
            </div>
          </div>

          <div className="search-wrapper">
            <input type="text" id="searchInput" className="search-input" placeholder="*FirstName / *LastName / *Barangay" />
            <div id="clearBtn" className="clear-search" title="Clear Search">✕</div>
          </div>
          
          <button className="btn btn-search">Search</button>
          <button className="btn btn-add" onClick={() => router.push('/form')}>Add</button>
          <button className="btn btn-summary" onClick={() => router.push('/analytics')}>Summary</button>
        </div>

        <div className="table-area">
          <div className="table-title" id="tableTitle">Summary of Informations</div>
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
                <th style={{ width: '180px' }}>Action</th>
              </tr>
            </thead>
            <tbody id="dataTable">
              {profiles.length === 0 ? (
                <tr><td colSpan={10} style={{ textAlign: 'center' }}>Loading data...</td></tr>
              ) : (
                profiles.map((profile) => {
                  const child = profile.child_profile || {};
                  const fullAddress = profile.barangay || 'N/A';
                  let formattedDOB = 'N/A';
                  if (child.date_of_birth) {
                      if (typeof child.date_of_birth.toDate === 'function') {
                          formattedDOB = child.date_of_birth.toDate().toLocaleDateString();
                      } else if (child.date_of_birth.seconds) {
                          formattedDOB = new Date(child.date_of_birth.seconds * 1000).toLocaleDateString();
                      }
                  }
                  return (
                    <tr key={profile.id}>
                      <td>{child.name || 'N/A'}</td>
                      <td>{formattedDOB}</td>
                      <td>{child.sex || 'N/A'}</td>
                      <td>{child.contact_number || 'N/A'}</td>
                      <td>{fullAddress}</td>
                      <td>{child.religion || 'N/A'}</td>
                      <td>{child.ip_membership || 'N/A'}</td>
                      <td>{child.disability_special_needs || 'N/A'}</td>
                      <td>{child.critical_illness || 'N/A'}</td>
                      <td><button className="check-btn" onClick={() => router.push(`/profile?id=${profile.id}`)}>Check Information</button></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <footer className="footer-controls">
          <button className="btn-print">PRINT REPORT</button>
          <div className="pagination">
            <button className="pg-btn">&lt;</button>
            <button className="pg-btn active">1</button>
            <button className="pg-btn">2</button>
            <button className="pg-btn">&gt;</button>
          </div>
        </footer>

      </div>
    </div>
  );
}