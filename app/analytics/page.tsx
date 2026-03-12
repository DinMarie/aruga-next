'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import '../../styles/analyticsStyleSheet.css';

export default function AnalyticsPage() {
  const router = useRouter();
  const [showPaperDropdown, setShowPaperDropdown] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const toggleCategory = (categoryName: string) => {
    setOpenCategory(openCategory === categoryName ? null : categoryName);
  };

  return (
    <div className="analytics-wrapper">
      <div className="page-container">
        <Header />

        <div className="action-bar">
          <button className="btn btn-filter" onClick={() => router.push('/table')}>
            <img src="/back.png" alt="backbutton" className="back-Icon" />
          </button>
          <div className="dropdown">
            <button className="btn btn-paper" onClick={() => setShowPaperDropdown(!showPaperDropdown)}>A4 Paper</button>
            <div className="paper-choice-dropdown" style={{ display: showPaperDropdown ? 'block' : 'none' }}>
              <a href="#" style={{ display: 'block', padding: '8px', textDecoration: 'none', color: '#333' }}>A4 Paper</a>
              <a href="#" style={{ display: 'block', padding: '8px', textDecoration: 'none', color: '#333' }}>Legal Paper</a>
              <a href="#" style={{ display: 'block', padding: '8px', textDecoration: 'none', color: '#333' }}>Letter Paper</a>
            </div>
          </div>
          <button className="btn btn-print">Print Report</button>
        </div>

        <div className="main-paper-container">
          <div className="Analytics-paper-container">
            <div className="Analytics-paper">
              <h2>Analytics Paper</h2>
              <p>Content for the analytics paper goes here.</p>
              
              <div className="Pie-graph-container">
                <h2 style={{ marginBottom: '20px', fontSize: '20px', marginLeft: '25px' }}>Overall Result</h2>
                <div className="piechart-main-container">
                  <table>
                    <thead>
                      <tr>
                        <th style={{ backgroundColor: '#FF6384', color: 'white', padding: '10px' }}>Barangay</th>
                        <th style={{ backgroundColor: '#36A2EB', color: 'white', padding: '10px' }}>Overall Population</th>
                        <th style={{ backgroundColor: '#FFCE56', color: 'white', padding: '10px' }}>Male</th>
                        <th style={{ backgroundColor: '#4BC0C0', color: 'white', padding: '10px' }}>Female</th> 
                        <th style={{ backgroundColor: '#4BC0C0', color: 'white', padding: '10px' }}>Disability</th>
                        <th style={{ backgroundColor: '#4BC0C0', color: 'white', padding: '10px' }}>Critical Illnesses</th>       
                      </tr>
                    </thead>
                    <tbody id="data-table">
                      <tr><td>Biñan</td><td>60%</td><td>20%</td><td>10%</td><td>Physical</td><td>Cancer</td></tr>
                      <tr><td>Bungahan</td><td>60%</td><td>20%</td><td>10%</td><td>Physical</td><td>Cancer</td></tr>
                      <tr><td>Canlalay</td><td>60%</td><td>20%</td><td>10%</td><td>Physical</td><td>Cancer</td></tr>
                      <tr><td>Casile</td><td>60%</td><td>20%</td><td>10%</td><td>Physical</td><td>Cancer</td></tr>
                      <tr><td>Dela Paz</td><td>60%</td><td>20%</td><td>10%</td><td>Physical</td><td>Cancer</td></tr>
                      <tr><td>Ganado</td><td>60%</td><td>20%</td><td>10%</td><td>Physical</td><td>Cancer</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="Pie-graph-container">
                <h2 style={{ marginBottom: '20px', fontSize: '20px', marginLeft: '25px' }}>Religion</h2>
                <div className="piechart-main-container">
                  <div className="pie-chart"></div>
                  <div className="chart-legend">
                    <div className="legend-item"><span className="dot" style={{ backgroundColor: '#FF6384' }}></span><span className="label-text">Catholic (20)</span></div>
                    <div className="legend-item"><span className="dot" style={{ backgroundColor: '#36A2EB' }}></span><span className="label-text">Islam (20)</span></div>
                    <div className="legend-item"><span className="dot" style={{ backgroundColor: '#FFCE56' }}></span><span className="label-text">INC (20)</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={`filter-group-container ${!isFilterOpen ? 'closed' : ''}`}>
            <div className="filter-header-icons">
              <button className="btn btn-filter" onClick={() => setIsFilterOpen(!isFilterOpen)} style={{ backgroundColor: '#512da8', color: 'white' }}>
                <img src="/back.png" alt="back" className="back-Icon" style={{ filter: 'brightness(0) invert(1)' }} /> 
                <span style={{ fontSize: '15px' }}>⚙ FILTER</span>
              </button>
            </div>

            <div className={`filter-category ${openCategory === 'gender' ? 'active' : ''}`}>
              <div className="category-header" onClick={() => toggleCategory('gender')}>
                <span className="Gender-header">Gender</span><span className="category-indicator">▼</span>
              </div>
              <div className="category-checklist" style={{ display: openCategory === 'gender' ? 'block' : 'none' }}>
                <div className="checkbox-item"><input type="checkbox" id="female" /><label htmlFor="female">Female</label></div>
                <div className="checkbox-item"><input type="checkbox" id="male" /><label htmlFor="male">Male</label></div>
              </div>
            </div>

            <div className={`filter-category ${openCategory === 'barangay' ? 'active' : ''}`}>
              <div className="category-header" onClick={() => toggleCategory('barangay')}>
                <span className="Barangay-header">Barangay</span><span className="category-indicator">▼</span>
              </div>
              <div className="category-checklist" style={{ display: openCategory === 'barangay' ? 'block' : 'none' }}>
                <div className="checkbox-item"><input type="checkbox" id="b-1" /><label htmlFor="b-1">Biñan</label></div>
                <div className="checkbox-item"><input type="checkbox" id="b-2" /><label htmlFor="b-2">Bungahan</label></div>
                <div className="checkbox-item"><input type="checkbox" id="b-3" /><label htmlFor="b-3">Canlalay</label></div>
                <div className="checkbox-item"><input type="checkbox" id="b-4" /><label htmlFor="b-4">Casile</label></div>
                <div className="checkbox-item"><input type="checkbox" id="b-5" /><label htmlFor="b-5">Dela Paz</label></div>
                <div className="checkbox-item"><input type="checkbox" id="b-6" /><label htmlFor="b-6">Ganado</label></div>
                <div className="checkbox-item"><input type="checkbox" id="b-7" /><label htmlFor="b-7">Langkiwa</label></div>
                <div className="checkbox-item"><input type="checkbox" id="b-8" /><label htmlFor="b-8">Loma</label></div>
                <div className="checkbox-item"><input type="checkbox" id="b-9" /><label htmlFor="b-9">Malaban</label></div>
                <div className="checkbox-item"><input type="checkbox" id="b-10" /><label htmlFor="b-10">Malamig</label></div>
                <div className="checkbox-item"><input type="checkbox" id="b-11" /><label htmlFor="b-11">Mampalasan</label></div>
                <div className="checkbox-item"><input type="checkbox" id="b-12" /><label htmlFor="b-12">Platero</label></div>
                <div className="checkbox-item"><input type="checkbox" id="b-13" /><label htmlFor="b-13">Poblacion</label></div>
                <div className="checkbox-item"><input type="checkbox" id="b-14" /><label htmlFor="b-14">San Antonio</label></div>
                <div className="checkbox-item"><input type="checkbox" id="b-15" /><label htmlFor="b-15">San Francisco</label></div>
                <div className="checkbox-item"><input type="checkbox" id="b-16" /><label htmlFor="b-16">San Jose</label></div>
                <div className="checkbox-item"><input type="checkbox" id="b-17" /><label htmlFor="b-17">San Vicente</label></div>
                <div className="checkbox-item"><input type="checkbox" id="b-18" /><label htmlFor="b-18">Santo Domingo</label></div>
                <div className="checkbox-item"><input type="checkbox" id="b-19" /><label htmlFor="b-19">Santo Niño</label></div>
                <div className="checkbox-item"><input type="checkbox" id="b-20" /><label htmlFor="b-20">Santo Tomas</label></div>
                <div className="checkbox-item"><input type="checkbox" id="b-21" /><label htmlFor="b-21">Soro-Soro</label></div>
                <div className="checkbox-item"><input type="checkbox" id="b-22" /><label htmlFor="b-22">Timbao</label></div>
                <div className="checkbox-item"><input type="checkbox" id="b-23" /><label htmlFor="b-23">Tubigan</label></div>
                <div className="checkbox-item"><input type="checkbox" id="b-24" /><label htmlFor="b-24">Zapote</label></div>
              </div>
            </div>

            <div className={`filter-category ${openCategory === 'religion' ? 'active' : ''}`}>
              <div className="category-header" onClick={() => toggleCategory('religion')}>
                <span className="religion-header">Religion</span><span className="category-indicator">▼</span>
              </div>
              <div className="category-checklist" style={{ display: openCategory === 'religion' ? 'block' : 'none' }}>
                <div className="checkbox-item"><input type="checkbox" id="rel-1" /><label htmlFor="rel-1">0 None</label></div>
                <div className="checkbox-item"><input type="checkbox" id="rel-2" /><label htmlFor="rel-2">1 Roman Catholic</label></div>
                <div className="checkbox-item"><input type="checkbox" id="rel-3" /><label htmlFor="rel-3">2 Islam</label></div>
                <div className="checkbox-item"><input type="checkbox" id="rel-4" /><label htmlFor="rel-4">3 Iglesia ni Cristo</label></div>
                <div className="checkbox-item"><input type="checkbox" id="rel-5" /><label htmlFor="rel-5">4 Aglipay</label></div>
                <div className="checkbox-item"><input type="checkbox" id="rel-6" /><label htmlFor="rel-6">5 Seventh Day Adventist</label></div>
                <div className="checkbox-item"><input type="checkbox" id="rel-7" /><label htmlFor="rel-7">6 Bible Baptist Church</label></div>
                <div className="checkbox-item"><input type="checkbox" id="rel-8" /><label htmlFor="rel-8">7 Jehovah's Witness</label></div>
                <div className="checkbox-item"><input type="checkbox" id="rel-9" /><label htmlFor="rel-9">8 United Methodists Church</label></div>
                <div className="checkbox-item"><input type="checkbox" id="rel-10" /><label htmlFor="rel-10">9 Tribal Religions</label></div>
                <div className="checkbox-item"><input type="checkbox" id="rel-11" /><label htmlFor="rel-11">10 Others</label></div>
              </div>
            </div>

            <div className={`filter-category ${openCategory === 'disability' ? 'active' : ''}`}>
              <div className="category-header" onClick={() => toggleCategory('disability')}>
                <span className="disability-header">Disability/Special Needs</span><span className="category-indicator">▼</span>
              </div>
              <div className="category-checklist" style={{ display: openCategory === 'disability' ? 'block' : 'none' }}>
                <div className="checkbox-item"><input type="checkbox" id="dis-1" /><label htmlFor="dis-1">0 None</label></div>
                <div className="checkbox-item"><input type="checkbox" id="dis-2" /><label htmlFor="dis-2">1 Physical</label></div>
                <div className="checkbox-item"><input type="checkbox" id="dis-3" /><label htmlFor="dis-3">2 Intellectual</label></div>
                <div className="checkbox-item"><input type="checkbox" id="dis-4" /><label htmlFor="dis-4">3 Learning</label></div>
                <div className="checkbox-item"><input type="checkbox" id="dis-5" /><label htmlFor="dis-5">4 Visual</label></div>
                <div className="checkbox-item"><input type="checkbox" id="dis-6" /><label htmlFor="dis-6">5 Mental</label></div>
                <div className="checkbox-item"><input type="checkbox" id="dis-7" /><label htmlFor="dis-7">6 Psychosocial</label></div>
                <div className="checkbox-item"><input type="checkbox" id="dis-8" /><label htmlFor="dis-8">7 Deaf/Hard of Hearing</label></div>
                <div className="checkbox-item"><input type="checkbox" id="dis-9" /><label htmlFor="dis-9">8 Speech and Language Impairment</label></div>
                <div className="checkbox-item"><input type="checkbox" id="dis-10" /><label htmlFor="dis-10">9 Cancer</label></div>
                <div className="checkbox-item"><input type="checkbox" id="dis-11" /><label htmlFor="dis-11">10 Rare Diseases</label></div>
              </div>
            </div>

            <div className={`filter-category ${openCategory === 'illness' ? 'active' : ''}`}>
              <div className="category-header" onClick={() => toggleCategory('illness')}>
                <span className="illness-header">Critical Illness</span><span className="category-indicator">▼</span>
              </div>
              <div className="category-checklist" style={{ display: openCategory === 'illness' ? 'block' : 'none' }}>
                <div className="checkbox-item"><input type="checkbox" id="ill-1" /><label htmlFor="ill-1">0 None</label></div>
                <div className="checkbox-item"><input type="checkbox" id="ill-2" /><label htmlFor="ill-2">1 Cancer</label></div>
                <div className="checkbox-item"><input type="checkbox" id="ill-3" /><label htmlFor="ill-3">2 Cardio-vascular Disease</label></div>
                <div className="checkbox-item"><input type="checkbox" id="ill-4" /><label htmlFor="ill-4">3 Paralysis</label></div>
                <div className="checkbox-item"><input type="checkbox" id="ill-5" /><label htmlFor="ill-5">4 Organ Failure</label></div>
                <div className="checkbox-item"><input type="checkbox" id="ill-6" /><label htmlFor="ill-6">5 Others</label></div>
              </div>
            </div>

            <div className={`filter-category ${openCategory === 'ip' ? 'active' : ''}`}>
              <div className="category-header" onClick={() => toggleCategory('ip')}>
                <span className="illness-header">IP Membership</span><span className="category-indicator">▼</span>
              </div>
              <div className="category-checklist" style={{ display: openCategory === 'ip' ? 'block' : 'none' }}>
                <div className="checkbox-item"><input type="checkbox" id="relNone2_ip"/><label htmlFor="relNone2_ip">Non-IP</label></div>
                <div className="checkbox-item"><input type="checkbox" id="aeta"/><label htmlFor="aeta">Aeta</label></div>
                <div className="checkbox-item"><input type="checkbox" id="ati"/><label htmlFor="ati">Ati</label></div>
                <div className="checkbox-item"><input type="checkbox" id="badjao"/><label htmlFor="badjao">Badjao</label></div>
                <div className="checkbox-item"><input type="checkbox" id="bago"/><label htmlFor="bago">Bago</label></div>
                <div className="checkbox-item"><input type="checkbox" id="batak"/><label htmlFor="batak">Batak</label></div>
                <div className="checkbox-item"><input type="checkbox" id="bukidnon"/><label htmlFor="bukidnon">Bukidnon</label></div>
                <div className="checkbox-item"><input type="checkbox" id="blaan"/><label htmlFor="blaan">B'laan</label></div>
                <div className="checkbox-item"><input type="checkbox" id="cimaron"/><label htmlFor="cimaron">Cimaron</label></div>
                <div className="checkbox-item"><input type="checkbox" id="cayonen"/><label htmlFor="cayonen">Cayonen</label></div>
                <div className="checkbox-item"><input type="checkbox" id="dumagat"/><label htmlFor="dumagat">Dumagat</label></div>
                <div className="checkbox-item"><input type="checkbox" id="ibaloi"/><label htmlFor="ibaloi">Ibaloi</label></div>
                <div className="checkbox-item"><input type="checkbox" id="ibanag"/><label htmlFor="ibanag">Ibanag</label></div>
                <div className="checkbox-item"><input type="checkbox" id="itom"/><label htmlFor="itom">Itom</label></div>
                <div className="checkbox-item"><input type="checkbox" id="kankanaey"/><label htmlFor="kankanaey">Kankanaey</label></div>
                <div className="checkbox-item"><input type="checkbox" id="mandaya"/><label htmlFor="mandaya">Mandaya</label></div>
                <div className="checkbox-item"><input type="checkbox" id="mangyan"/><label htmlFor="mangyan">Mangyan</label></div>
                <div className="checkbox-item"><input type="checkbox" id="manobo"/><label htmlFor="manobo">Manobo</label></div>
                <div className="checkbox-item"><input type="checkbox" id="palawano"/><label htmlFor="palawano">Palawano</label></div>
                <div className="checkbox-item"><input type="checkbox" id="pullon"/><label htmlFor="pullon">Pullon</label></div>
                <div className="checkbox-item"><input type="checkbox" id="subanen"/><label htmlFor="subanen">Subanen</label></div>
                <div className="others-row"></div>
              </div>
            </div>

            <div className="filter-footer">
              <button className="btn-clear-all">Clear All</button>
              <button className="btn-apply" id="applyFilterBtn" onClick={() => setIsFilterOpen(false)}>Apply</button>
            </div> 

          </div>
        </div>
      </div>
    </div>
  );
}