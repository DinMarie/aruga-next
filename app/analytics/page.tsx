'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';

// Reusing the same arrays here for the analytics filters
const FILTER_OPTIONS = {
  barangays: ["Biñan", "Bungahan", "Canlalay", "Casile", "De La Paz", "Ganado", "Langkiwa", "Loma", "Malaban", "Malamig", "Mamplasan", "Platero", "Poblacion", "San Antonio", "San Francisco", "San Jose", "San Vicente", "Santo Domingo", "Santo Niño", "Santo Tomas", "Soro-soro", "Timbao", "Tubigan", "Zapote"],
  genders: ["Female", "Male"],
  religions: ["None", "Roman Catholic", "Islam", "Iglesia ni Cristo", "Aglipay", "Seventh Day Adventist", "Bible Baptist Church", "Jehovah's Witness", "United Methodists Church", "Tribal Religions", "Others"],
  disabilities: ["None", "Physical", "Intellectual", "Learning", "Visual", "Mental", "Psychosocial", "Deaf/Hard of Hearing", "Speech and Language Impairment", "Cancer", "Rare Diseases"],
  illnesses: ["None", "Cancer", "Cardio-vascular Disease", "Paralysis", "Organ Failure", "Others"],
  ip: ["Non-IP", "Aeta", "Ati", "Badjao", "Bago", "Batak", "Bukidnon", "B'laan", "Cimaron", "Cayonen", "Dumagat", "Ibaloi", "Ibanag", "Itom", "Kankanaey", "Mandaya", "Mangyan", "Manobo", "Palawano", "Pullon", "Subanen"]
};

export default function AnalyticsPage() {
  const router = useRouter();
  const [showPaperDropdown, setShowPaperDropdown] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  // State to track checked filters
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({
    barangay: [], gender: [], religion: [], disability: [], illness: [], ip: []
  });

  const toggleCategory = (categoryName: string) => {
    setOpenCategory(openCategory === categoryName ? null : categoryName);
  };

  const handleFilterChange = (category: string, value: string) => {
    setSelectedFilters(prev => {
      const currentList = prev[category] || [];
      if (currentList.includes(value)) return { ...prev, [category]: currentList.filter(item => item !== value) };
      return { ...prev, [category]: [...currentList, value] };
    });
  };

  const clearAllFilters = () => {
    setSelectedFilters({ barangay: [], gender: [], religion: [], disability: [], illness: [], ip: [] });
  };

  return (
    <div className="analyticsWrapper">
      <div className="pageContainer">
        <Header />

        <div className="actionBar">
          <button className="btn btnFilter" onClick={() => router.push('/table')}>
            <img src="/back.png" alt="back" className="backIcon" />
          </button>
          <div className="dropdown">
            <button className="btn btnPaper" onClick={() => setShowPaperDropdown(!showPaperDropdown)}>A4 Paper</button>
            <div className={`paperChoiceDropdown ${showPaperDropdown ? 'show' : ''}`}>
              <a href="#">A4 Paper</a>
              <a href="#">Legal Paper</a>
              <a href="#">Letter Paper</a>
            </div>
          </div>
          <button className="btn btnPrint">Print Report</button>
        </div>

        <div className="mainPaperContainer">
          <div className="analyticsPaperContainer">
            <div className="analyticsPaper">
              <h2>Analytics Paper</h2>
              <p>Content for the analytics paper goes here.</p>
              
              <div className="pieGraphContainer">
                <h2 style={{ marginBottom: '20px', fontSize: '20px', marginLeft: '25px' }}>Overall Result</h2>
                <div className="piechartMainContainer">
                  <table>
                    <thead>
                      <tr>
                        <th style={{ backgroundColor: '#FF6384', color: 'white' }}>Barangay</th>
                        <th style={{ backgroundColor: '#36A2EB', color: 'white' }}>Population</th>
                        <th style={{ backgroundColor: '#FFCE56', color: 'white' }}>Male</th>
                        <th style={{ backgroundColor: '#4BC0C0', color: 'white' }}>Female</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td>Biñan</td><td>60%</td><td>20%</td><td>40%</td></tr>
                      <tr><td>Bungahan</td><td>60%</td><td>20%</td><td>40%</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pieGraphContainer">
                <h2 style={{ marginBottom: '20px', fontSize: '20px', marginLeft: '25px' }}>Religion</h2>
                <div className="piechartMainContainer">
                  <div className="pieChart"></div>
                  <div className="chartLegend">
                    <div className="legendItem"><span className="dot" style={{ backgroundColor: '#FF6384' }}></span><span className="labelText">Catholic (20)</span></div>
                    <div className="legendItem"><span className="dot" style={{ backgroundColor: '#36A2EB' }}></span><span className="labelText">Islam (20)</span></div>
                    <div className="legendItem"><span className="dot" style={{ backgroundColor: '#FFCE56' }}></span><span className="labelText">INC (20)</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={`filterGroupContainer ${!isFilterOpen ? 'closed' : ''}`}>
            <div className="filterHeaderIcons">
              <button className="btn btnFilter" onClick={() => setIsFilterOpen(!isFilterOpen)} style={{ backgroundColor: '#512da8', color: 'white' }}>
                <span style={{ fontSize: '15px' }}>⚙ FILTER</span>
              </button>
            </div>

            {/* GENDER FILTER */}
            <div className={`filterCategory ${openCategory === 'gender' ? 'active' : ''}`}>
              <div className="categoryHeader" onClick={() => toggleCategory('gender')}>
                <span>Gender</span><span className="categoryIndicator">▼</span>
              </div>
              <div className="categoryChecklist">
                {FILTER_OPTIONS.genders.map(item => (
                  <div className="checkboxItem" key={item}>
                    <input type="checkbox" id={`a-gender-${item}`} checked={selectedFilters.gender.includes(item)} onChange={() => handleFilterChange('gender', item)} />
                    <label htmlFor={`a-gender-${item}`}>{item}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* BARANGAY FILTER */}
            <div className={`filterCategory ${openCategory === 'barangay' ? 'active' : ''}`}>
              <div className="categoryHeader" onClick={() => toggleCategory('barangay')}>
                <span>Barangay</span><span className="categoryIndicator">▼</span>
              </div>
              <div className="categoryChecklist">
                {FILTER_OPTIONS.barangays.map(item => (
                  <div className="checkboxItem" key={item}>
                    <input type="checkbox" id={`a-brgy-${item}`} checked={selectedFilters.barangay.includes(item)} onChange={() => handleFilterChange('barangay', item)} />
                    <label htmlFor={`a-brgy-${item}`}>{item}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* RELIGION FILTER */}
            <div className={`filterCategory ${openCategory === 'religion' ? 'active' : ''}`}>
              <div className="categoryHeader" onClick={() => toggleCategory('religion')}>
                <span>Religion</span><span className="categoryIndicator">▼</span>
              </div>
              <div className="categoryChecklist">
                {FILTER_OPTIONS.religions.map(item => (
                  <div className="checkboxItem" key={item}>
                    <input type="checkbox" id={`a-rel-${item}`} checked={selectedFilters.religion.includes(item)} onChange={() => handleFilterChange('religion', item)} />
                    <label htmlFor={`a-rel-${item}`}>{item}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* DISABILITY FILTER */}
            <div className={`filterCategory ${openCategory === 'disability' ? 'active' : ''}`}>
              <div className="categoryHeader" onClick={() => toggleCategory('disability')}>
                <span>Disability/Special Needs</span><span className="categoryIndicator">▼</span>
              </div>
              <div className="categoryChecklist">
                {FILTER_OPTIONS.disabilities.map(item => (
                  <div className="checkboxItem" key={item}>
                    <input type="checkbox" id={`a-dis-${item}`} checked={selectedFilters.disability.includes(item)} onChange={() => handleFilterChange('disability', item)} />
                    <label htmlFor={`a-dis-${item}`}>{item}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* ILLNESS FILTER */}
            <div className={`filterCategory ${openCategory === 'illness' ? 'active' : ''}`}>
              <div className="categoryHeader" onClick={() => toggleCategory('illness')}>
                <span>Critical Illness</span><span className="categoryIndicator">▼</span>
              </div>
              <div className="categoryChecklist">
                {FILTER_OPTIONS.illnesses.map(item => (
                  <div className="checkboxItem" key={item}>
                    <input type="checkbox" id={`a-ill-${item}`} checked={selectedFilters.illness.includes(item)} onChange={() => handleFilterChange('illness', item)} />
                    <label htmlFor={`a-ill-${item}`}>{item}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* IP FILTER */}
            <div className={`filterCategory ${openCategory === 'ip' ? 'active' : ''}`}>
              <div className="categoryHeader" onClick={() => toggleCategory('ip')}>
                <span>IP Membership</span><span className="categoryIndicator">▼</span>
              </div>
              <div className="categoryChecklist">
                {FILTER_OPTIONS.ip.map(item => (
                  <div className="checkboxItem" key={item}>
                    <input type="checkbox" id={`a-ip-${item}`} checked={selectedFilters.ip.includes(item)} onChange={() => handleFilterChange('ip', item)} />
                    <label htmlFor={`a-ip-${item}`}>{item}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className="filterFooter">
              <button className="btnClearAll" onClick={clearAllFilters}>Clear All</button>
              <button className="btnApply" onClick={() => setIsFilterOpen(false)}>Apply</button>
            </div> 

          </div>
        </div>
      </div>
    </div>
  );
}