'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const paperDimensions: any = {
  a4: { width: "284mm", height: "297mm" },
  letter: { width: "290mm", height: "279mm" },
  long: { width: "290mm", height: "330mm" }
};

export default function SummaryDashboard() {
  const router = useRouter();
  
  // Library load states
  const [chartJsLoaded, setChartJsLoaded] = useState(false);
  const [h2cLoaded, setH2cLoaded] = useState(false);
  const [jspdfLoaded, setJsPdfLoaded] = useState(false);

  // Data states
  const [globalRecords, setGlobalRecords] = useState<any[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // UI States
  const [paperSize, setPaperSize] = useState('letter');
  const [zoom, setZoom] = useState('1');
  const [layout2Pages, setLayout2Pages] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false); 
  const [paperDropdownOpen, setPaperDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [openCategories, setOpenCategories] = useState<{ [key: string]: boolean }>({
    sex: false, place: false, disabilities: false, illness: false
  });

  // Filter States
  const [filters, setFilters] = useState<{sex: string[], place: string[], disabilities: string[], illness: string[]}>({
    sex: [], place: [], disabilities: [], illness: []
  });

  // Refs for Charts
  const pie1Ref = useRef<HTMLCanvasElement>(null);
  const pie2Ref = useRef<HTMLCanvasElement>(null);
  const barRef = useRef<HTMLCanvasElement>(null);
  const chartInstances = useRef<{ pie1: any, pie2: any, bar: any }>({ pie1: null, pie2: null, bar: null });

  // 1. Fetch & Sanitize Data from Firebase
  useEffect(() => {
    async function loadData() {
      try {
        const querySnapshot = await getDocs(collection(db, "profiles"));
        const records = querySnapshot.docs.map(doc => {
          const data = doc.data();
          
          let rawAddress = String(data.address || data.r2_address || "").trim();
          let place = "Unknown";
          const knownBarangays = ["Biñan", "Bungahan", "Canlalay", "Casile", "De La Paz", "Ganado", "Langkiwa", "Loma", "Malaban", "Malamig", "Mampalasan", "Platero", "Poblacion", "San Antonio", "San Francisco", "San Jose", "San Vicente", "Santo Domingo", "Santo Niño", "Santo Tomas", "Soro-Soro", "Timbao", "Tubigan", "Zapote"];
          
          const normalizedAddress = rawAddress.toLowerCase().replace(/ñ/g, 'n');
          for (let b of knownBarangays) {
              const normalizedB = b.toLowerCase().replace(/ñ/g, 'n');
              if (normalizedAddress.includes(normalizedB)) {
                  place = b;
                  break;
              }
          }

          let sex = String(data.sex || data.r7_sex || "Unknown").trim();
          if (sex.toLowerCase() === "male") sex = "Male";
          else if (sex.toLowerCase() === "female") sex = "Female";
          else sex = "Unknown";

          let d = String(data.disability || data.r9_disability || "None").trim();
          if (!d || d.toLowerCase() === "none" || d === "0") d = "None";

          let i = String(data.illness || data.r10_illness || "None").trim();
          if (!i || i.toLowerCase() === "none" || i === "0") i = "None";

          return { sex, place, disabilities: d, illness: i };
        });
        
        setGlobalRecords(records);
        setFilteredRecords(records);
      } catch (error) {
        console.error("Failed to load records from Firebase:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // 2. Data Processing
  const { chartData, paragraphs, fullTableData, categoryTables, placesList } = useMemo(() => {
    const dCount: any = {};
    const iCount: any = {};
    const pCount: any = {};

    filteredRecords.forEach(r => { 
        dCount[r.disabilities] = (dCount[r.disabilities] || 0) + 1;
        iCount[r.illness] = (iCount[r.illness] || 0) + 1;
        pCount[r.place] = (pCount[r.place] || 0) + 1;
    });

    const places = [...new Set(filteredRecords.map(r => r.place))].sort((a: any, b: any) => a.localeCompare(b));
    const paras: string[] = [];

    places.forEach(place => {
      const placeRecords = filteredRecords.filter(r => r.place === place);
      const totalPopulation = placeRecords.length;
      if (totalPopulation === 0) return;

      const males = placeRecords.filter(r => r.sex === "Male").length;
      const females = placeRecords.filter(r => r.sex === "Female").length;

      const dText = placeRecords.filter(p => p.disabilities !== "None").map(p => `${p.sex.toLowerCase()} with ${p.disabilities.toLowerCase()} disability`);
      const iText = placeRecords.filter(p => p.illness !== "None").map(p => `${p.sex.toLowerCase()} with ${p.illness.toLowerCase()}`);

      const dString = dText.length > 0 ? `, including <b>${dText.join(", ")}</b>` : "";
      const iString = iText.length > 0 ? `, including <b>${iText.join(", ")}</b>` : "";

      paras.push(`The Barangay of <b>${place}</b> has a total population of <b>${totalPopulation}</b> residents, consisting of <b>${males}</b> males and <b>${females}</b> females. Among them, <b>${dText.length}</b> individuals have disabilities${dString}. In terms of health, <b>${iText.length}</b> residents have reported illnesses${iString}.`);
    });

    const chunkedParas: string[][] = [];
    for (let i = 0; i < paras.length; i += 6) {
      chunkedParas.push(paras.slice(i, i + 6));
    }

    const sexes = [...new Set(filteredRecords.map(r => r.sex))].sort();
    const dTypes = [...new Set(filteredRecords.map(r => r.disabilities))].sort();
    const iTypes = [...new Set(filteredRecords.map(r => r.illness))].sort();

    const catTablesData = ["place", "sex", "disabilities", "illness"].map(cat => {
      const counts: any = {};
      filteredRecords.forEach(r => counts[r[cat as keyof typeof r] || "None"] = (counts[r[cat as keyof typeof r] || "None"] || 0) + 1);
      return { 
        category: cat, 
        label: { place: "Barangay", sex: "Sex", disabilities: "Disabilities", illness: "Critical Illness" }[cat], 
        counts: Object.entries(counts).sort(([a]: any, [b]: any) => a.localeCompare(b)) 
      };
    });

    return {
      chartData: { disabilities: dCount, illness: iCount, place: pCount },
      paragraphs: chunkedParas,
      fullTableData: { sexes, dTypes, iTypes },
      categoryTables: catTablesData,
      placesList: places
    };
  }, [filteredRecords]);

  // 3. Render Chart.js
  useEffect(() => {
    if (!chartJsLoaded || isLoading || !filteredRecords.length) return;
    const Chart = (window as any).Chart;
    const pieColors = ["#ff6384", "#36a2eb", "#ffcd56", "#4bc0c0", "#9966ff", "#ff9f40", "#512da8", "#8bc34a"];

    const customLegendPlugin = {
      legend: {
        position: 'right',
        labels: {
          generateLabels: function(chart: any) {
            const data = chart.data;
            const dataset = data.datasets[0];
            return data.labels.map((label: string, i: number) => {
              const value = dataset.data[i];
              const total = dataset.data.reduce((a: number, b: number) => a + b, 0);
              const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
              return { text: `${label}: ${value} (${percent}%)`, fillStyle: dataset.backgroundColor[i], index: i };
            });
          }
        }
      }
    };

    if (chartInstances.current.pie1) chartInstances.current.pie1.destroy();
    if (chartInstances.current.pie2) chartInstances.current.pie2.destroy();
    if (chartInstances.current.bar) chartInstances.current.bar.destroy();

    if (pie1Ref.current) {
      chartInstances.current.pie1 = new Chart(pie1Ref.current, {
        type: "pie",
        data: { labels: Object.keys(chartData.disabilities), datasets: [{ data: Object.values(chartData.disabilities), backgroundColor: pieColors }] },
        options: { animation: false, responsive: true, maintainAspectRatio: false, plugins: customLegendPlugin }
      });
    }

    if (pie2Ref.current) {
      chartInstances.current.pie2 = new Chart(pie2Ref.current, {
        type: "pie",
        data: { labels: Object.keys(chartData.illness), datasets: [{ data: Object.values(chartData.illness), backgroundColor: pieColors }] },
        options: { animation: false, responsive: true, maintainAspectRatio: false, plugins: customLegendPlugin }
      });
    }

    if (barRef.current) {
      chartInstances.current.bar = new Chart(barRef.current, {
        type: "bar",
        data: { labels: Object.keys(chartData.place), datasets: [{ label: "Population", data: Object.values(chartData.place), backgroundColor: "#36a2eb" }] },
        options: { animation: false, responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { stepSize: 1, precision: 0 } } } }
      });
    }
  }, [chartData, chartJsLoaded, isLoading, filteredRecords]);

  // 4. Filter Interactions
  const toggleAccordion = (category: string) => {
    setOpenCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const handleFilterToggle = (category: string, value: string) => {
    setFilters(prev => {
        const current = prev[category as keyof typeof prev];
        const updated = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
        return { ...prev, [category]: updated };
    });
  };

  const applyFilter = () => {
    const filtered = globalRecords.filter(record => {
      return (
        (!filters.sex.length || filters.sex.includes(record.sex)) &&
        (!filters.place.length || filters.place.includes(record.place)) &&
        (!filters.disabilities.length || filters.disabilities.includes(record.disabilities)) &&
        (!filters.illness.length || filters.illness.includes(record.illness))
      );
    });
    setFilteredRecords(filtered);
  };

  const clearFilters = () => {
    setFilters({ sex: [], place: [], disabilities: [], illness: [] });
    setFilteredRecords(globalRecords);
  };

  // 5. Download PDF
  const downloadPDF = async () => {
    if (!h2cLoaded || !jspdfLoaded) return alert("PDF Libraries are still loading...");
    
    const html2canvas = (window as any).html2canvas;
    const jsPDF = (window as any).jspdf.jsPDF;
    
    let pdf;
    if(paperSize==="a4") pdf = new jsPDF('p','mm','a4');
    else if(paperSize==="letter") pdf = new jsPDF('p','mm','letter');
    else if(paperSize==="long") pdf = new jsPDF('p','mm',[330,216]);

    const pages = document.querySelectorAll(".Analytics-paper");
    for(let i=0; i<pages.length; i++){
      const canvas = await html2canvas(pages[i] as HTMLElement, {scale: 2});
      const imgData = canvas.toDataURL("image/png");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = canvas.height * pdfWidth / canvas.width;

      if(i > 0) pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    }
    pdf.save("Disability_Analytics.pdf");
  };

  const currentPaper = paperDimensions[paperSize] || paperDimensions.letter;

  return (
    <>
      <Script src="https://cdn.jsdelivr.net/npm/chart.js" onReady={() => setChartJsLoaded(true)} />
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js" onReady={() => setH2cLoaded(true)} />
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" onReady={() => setJsPdfLoaded(true)} />

      <style dangerouslySetInnerHTML={{__html: `
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: "Segoe UI", Arial, sans-serif; }
        
        /* ✅ FIXED: The root spans perfectly between the header and footer, allowing the scrollbars to appear naturally */
        .analytics-root { 
          position: fixed; 
          top: 150px; 
          bottom: 60px; 
          left: 0; 
          right: 0; 
          background-color: #ffffff; 
          display: block; 
          overflow: auto; 
        }
        
        /* ✅ FIXED: By using fit-content and text-align: center, the pages expand to the right without clipping the left edge! */
        .page-container { 
          background-color: white; 
          min-width: 100%; 
          width: fit-content; 
          min-height: 100%; 
          box-shadow: 0 10px 30px rgb(255, 255, 255); s
          display: block; 
          text-align: center; 
          padding-top: 40px; 
          padding-bottom: 40px; 
        }

        #pagesContainer { 
          display: inline-flex; 
          flex-direction: column; 
          align-items: center; 
          gap: 40px; 
          text-align: left; 
          padding: 0 40px; 
        }
        
        #pagesContainer.two-page { 
          display: inline-grid; 
          grid-template-columns: repeat(2, auto); 
          justify-content: center; 
          align-items: start; 
          gap: 40px; 
        }

        /* --- Header --- */
        .header { position: fixed; top: 0; left: 0; width: 100%; background-color: #a68cb0; padding: 12px 25px; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #8e6e9e; z-index: 1000; height: 80px;}
        .header-title { color: white; font-weight: bold; }
        .header-left { display: flex; align-items: center; gap: 15px; }
        .logo-box { width: 50px; height: 50px; background-color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .logo-box img { width: 100%; height: 100%; object-fit: contain; }

        /* --- Dropdowns --- */
        .dropdown { position: relative; display: inline-block; }
        .dropdown-content { display: none; position: absolute; background-color: white; min-width: 280px; box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.2); z-index: 100; border: 1px solid #ccc; border-radius: 8px; padding: 20px; margin-top: 5px; }
        .dropdown:hover .dropdown-content { display: block; }
        .user-dropdown { right: 0; min-width: 150px; padding: 0; }
        .user-dropdown a { display: block; padding: 8px; text-decoration: none; color: #333; }
        .user-dropdown a:hover { background-color: #f1f1f1; }

        /* --- Action Bar (FIXED TO TOP) --- */
        .action-bar { padding: 25px; display: flex; gap: 12px; align-items: center; position: fixed; top: 80px; left: 0; width: 100%; height: 70px; background: white; border-bottom: 1px solid #ddd; z-index: 999; box-shadow: 0 4px 6px -2px rgba(0,0,0,0.05); }
        .btn { padding: 10px 25px; border: none; border-radius: 20px; font-weight: bold; cursor: pointer; color: white; display: flex; align-items: center; justify-content: center;}
        .btn-paper { background-color: #512da8; }
        .btn-print { background-color: #8bc34a; }
        .btn-download { background-color: #ff854c; }
        .btn-back { background-color: #f1f1f1; border: 1px solid #ccc; padding: 8px 18px; }

        .paper-choice-dropdown { display: none; position: absolute; background-color: #512da8; min-width: 100px; z-index: 100; padding: 10px; flex-direction: column; gap: 10px; margin-top: -5px; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; }
        .size { border: none; font-weight: bold; cursor: pointer; color: white; transition: 0.2s; width: 94px; height: 25px; border-radius: 20px; }
        .paper-choice-dropdown.show { display: flex; }
        .paper-choice-dropdown a { display: block; padding: 10px 15px; text-decoration: none; color: #333; }
        .paper-choice-dropdown a:hover { background-color: #f1f1f1; color: #512da8; cursor: pointer; }
        .back-Icon { width: 20px; height: 20px; }

        /* --- Paper Container --- */
        .Analytics-paper { width: 100%; padding: 30px; border-color: black; border: 1px solid #ccc; box-shadow: 0 3px 3px rgba(0, 0, 0, 0.2); display: flex; flex-direction: column; overflow: hidden; background-color: white; }

        /* --- Charts & Typography --- */
        .Analytics-paper h1 { font-size: 24px; color: #2a1b3c; border-bottom: 2px solid #8c6d8c; padding-bottom: 10px; margin-bottom: 20px; }
        .chartCard { width: 100%; margin-bottom: 30px; }
        .chartCard h4 { margin-bottom: 10px; color: #333; font-size: 16px; }

        /* ✅ BULLETPROOF BORDERS: 2px ensures it scales down to exactly 1px at 50% zoom */
        table { width: 100%; border-collapse: separate; border-spacing: 0; border-top: 2px solid #000; border-left: 2px solid #000; margin-bottom: 20px; }
        th, td { border-right: 2px solid #000; border-bottom: 2px solid #000; padding: 8px; text-align: center; font-size: 12px; }
        th { background-color: #f2f2f2; font-weight: bold; text-align: center; }

        /* --- Bottom Navi (Fixed to Bottom) --- */
        .bottom_navi { width: 100%; height: 60px; left: 0; background-color: #a68cb0; position: fixed; padding: 0 100px; display: flex; justify-content: space-between; align-items: center; z-index: 1000; bottom: 0px; }
        .zoom { display: flex; align-items: center; gap: 5px; }
        .zoom p { font-size: 15px; font-weight: bold; color: white; margin: 0; }

        /* --- Filter Sidebar (LOCKED TO SCREEN) --- */
        .filter-sidebar-wrapper { position: fixed; top: 150px; right: 0; bottom: 60px; width: 360px; z-index: 998; pointer-events: none; padding: 20px; display: flex; flex-direction: column; }
        
        .filter-group-container { pointer-events: auto; background: white; border: 1px solid #ccc; box-shadow: -4px 4px 15px rgba(0, 0, 0, 0.15); border-radius: 8px; display: flex; flex-direction: column; width: 100%; height: 100%; transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); transform: translateX(0); }
        .filter-group-container.closed { transform: translateX(120%); }
        
        .filter-header-icons { padding: 15px 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; background: white; border-radius: 8px 8px 0 0; flex-shrink: 0; }
        
        .filter-scrollable-content { flex: 1; overflow-y: auto; padding: 15px 20px; }
        
        .category-header { cursor: pointer; display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #eee; user-select: none; font-weight: bold; }
        .category-checklist { display: none; padding-top: 10px; background-color: #f9f9f9; border-radius: 4px; padding: 10px; width: 100%; border: 1px solid #ccc; box-shadow: inset 0 2px 4px rgba(0,0,0,0.05); margin-top: 5px; }
        .filter-category.active .category-checklist { display: block; }
        .filter-category.active .category-indicator { transform: rotate(180deg); }
        .category-indicator { transition: transform 0.2s ease; display: inline-block; }
        .checkbox-item { display: flex; align-items: center; gap: 8px; margin-bottom: 5px; font-size: 0.9rem; cursor: pointer; }

        .filter-footer { padding: 15px 20px; border-top: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; background: white; border-radius: 0 0 8px 8px; flex-shrink: 0; }
        .btn-apply { background-color: #512da8 !important; color: white; padding: 8px 22px !important; border-radius: 30px !important; font-size: 0.9rem; border: none; cursor: pointer;}
        .btn-clear-all { color: #666; text-decoration: underline; padding: 5px 8px; background: none; border: none; cursor: pointer; }

        /* --- PRINT CSS --- */
        @media print {
          html, body, #__next, #__next > div { height: auto !important; min-height: auto !important; margin: 0 !important; padding: 0 !important; overflow: visible !important; background: white !important; width: 100% !important;}
          .action-bar, .bottom_navi, .header, .filter-sidebar-wrapper { display: none !important; }
          .analytics-root { position: static !important; overflow: visible !important; height: auto !important; width: 100% !important; background: white !important; display: block !important;}
          .page-container { background: white !important; padding: 0 !important; margin: 0 !important; height: auto !important; overflow: visible !important; box-shadow: none !important; display: block !important; width: 100% !important;}
          #pagesContainer { transform: scale(1) !important; gap: 0 !important; display: block !important; padding: 0 !important; margin: 0 !important; width: 100% !important;}
          .Analytics-paper { box-shadow: none !important; margin: 0 !important; padding: 0.5in !important; page-break-after: always !important; break-after: page !important; page-break-inside: avoid !important; overflow: visible !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          table, tr, td, th { page-break-inside: avoid !important; break-inside: avoid !important; }
        }
      `}} />

      <div className="analytics-root">
        <div className="page-container" style={{ paddingRight: isFilterOpen ? '360px' : '0', transition: 'padding-right 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
          
          {/* HEADER */}
          <header className="header">
            <div className="header-left">
              <div className="logo-box">
                <img src="/images.png" alt="Logo" onError={(e) => e.currentTarget.style.display='none'} />
              </div>
              <span className="header-title"><b>CSWDO - Binan City</b></span>
            </div>

            <div className="dropdown" onMouseLeave={() => setUserDropdownOpen(false)}>
              <button className="btn" style={{color: 'white', background: 'none'}} onClick={() => setUserDropdownOpen(!userDropdownOpen)}>
                Username &#9662;
              </button>
              <div className="dropdown-content user-dropdown" style={{display: userDropdownOpen ? 'block' : 'none'}}>
                <a href="#">Profile</a>
                <a href="#" id="logoutBtn" style={{color: 'red', borderTop: '1px solid #eee'}}>Logout</a>
              </div>
            </div>
          </header>

          {/* FIXED ACTION BAR */}
          <div className="action-bar">
            <button className="btn btn-back" onClick={() => router.push('/table')}>
              <img src="/back.png" alt="backbutton" className="back-Icon" />
            </button>
            
            <div className="dropdown" id="paperSize" onMouseLeave={() => setPaperDropdownOpen(false)}>
              <button className={`btn btn-paper ${paperDropdownOpen ? 'show' : ''}`} onClick={() => setPaperDropdownOpen(!paperDropdownOpen)}>
                Paper Size
              </button>
              <div className={`paper-choice-dropdown ${paperDropdownOpen ? 'show' : ''}`}>
                <button className="size btn-a4" onClick={() => {setPaperSize('a4'); setPaperDropdownOpen(false)}}>A4</button>
                <button className="size btn-letter" onClick={() => {setPaperSize('letter'); setPaperDropdownOpen(false)}}>Letter</button>
                <button className="size btn-long" onClick={() => {setPaperSize('long'); setPaperDropdownOpen(false)}}>Long</button>
              </div>
            </div>

            <button className="btn btn-print" onClick={() => window.print()}>Print Report</button>
            <button id="downloadPdf" className="btn btn-download" onClick={downloadPDF}>Download</button>
          </div>

          {/* BOTTOM NAVI (FOOTER) */}
          <div className="bottom_navi">
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              
              <button 
                  className="btn" 
                  onClick={() => setLayout2Pages(!layout2Pages)} 
                  style={{
                    backgroundColor: layout2Pages ? '#512da8' : '#ffffff', 
                    color: layout2Pages ? 'white' : '#333',
                    border: 'none',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 20px',
                    transition: '0.2s ease',
                    fontWeight: 'bold'
                  }}
              >
                <img 
                    src="/page_layout.png" 
                    width="18" 
                    height="22" 
                    alt="layout icon" 
                    style={{ filter: layout2Pages ? 'brightness(0) invert(1)' : 'none' }}
                    onError={(e) => { 
                        e.currentTarget.src = '/window.svg'; 
                        e.currentTarget.style.filter = layout2Pages ? 'invert(1)' : 'none'; 
                    }}
                />
                {layout2Pages ? 'Double View' : 'Single View'}
              </button>
              
              {/* ✅ The Filter Button safely docked in the footer */}
              <button 
                  className="btn btn-filter" 
                  onClick={() => setIsFilterOpen(!isFilterOpen)} 
                  style={{
                    backgroundColor: isFilterOpen ? '#512da8' : '#ffffff', 
                    color: isFilterOpen ? 'white' : '#333',
                    border: 'none',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    padding: '8px 20px'
                  }}
              >
                ⚙ FILTER
              </button>
            </div>

            <div className="zoom">
              <p>Zoom</p>
              <select value={zoom} onChange={(e) => setZoom(e.target.value)} style={{borderRadius: '4px', padding: '2px', color: '#333', cursor: 'pointer'}}>
                <option value="0.5">50%</option>
                <option value="0.75">75%</option>
                <option value="1">100%</option>
                <option value="1.5">150%</option>
                <option value="1.75">175%</option>
                <option value="2">200%</option>
              </select>
            </div>
          </div>

          {/* PAGES CONTAINER */}
          {/* ✅ FIXED: Now uses the "zoom" style attribute, natively rendering scrollbars perfectly! */}
          <div id="pagesContainer" className={layout2Pages ? 'two-page' : ''} style={{ zoom: zoom }}>
            {isLoading && <h2 style={{ marginTop: '50px', textAlign: 'center' }}>Loading Data...</h2>}
            
            {!isLoading && (
              <>
                {/* PAGE 1: CHARTS */}
                <div className="Analytics-paper" style={{ width: currentPaper.width, height: currentPaper.height }}>
                  <h1>Disability Records Analytics</h1>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    <div className="chartCard">
                        <h4>Disability Summary</h4>
                        <div style={{ height: '250px', width: '100%' }}><canvas ref={pie1Ref}></canvas></div>
                    </div>
                    <div className="chartCard">
                        <h4>Illness Summary</h4>
                        <div style={{ height: '250px', width: '100%' }}><canvas ref={pie2Ref}></canvas></div>
                    </div>
                    <div className="chartCard">
                        <h4>Population Summary</h4>
                        <div style={{ height: '300px', width: '100%' }}><canvas ref={barRef}></canvas></div>
                    </div>
                  </div>
                </div>

                {/* PAGES 2+: PARAGRAPHS */}
                {paragraphs.map((paraChunk, idx) => (
                  <div key={`para-page-${idx}`} className="Analytics-paper" style={{ width: currentPaper.width, height: currentPaper.height }}>
                    <h1>Summary Paragraphs</h1>
                    {paraChunk.map((p, i) => (
                      <p key={i} dangerouslySetInnerHTML={{ __html: p }} style={{ margin: '10px 0', textAlign: 'justify', fontSize: '13px', lineHeight: '1.6' }}></p>
                    ))}
                  </div>
                ))}

                {/* FULL TABLE PAGE */}
                <div className="Analytics-paper" style={{ width: currentPaper.width, height: currentPaper.height }}>
                  <h1>Full Table Summary</h1>
                  <table>
                    <thead>
                      <tr>
                        <th rowSpan={2} style={{verticalAlign: 'middle'}}>Barangay</th>
                        <th rowSpan={2} style={{verticalAlign: 'middle'}}>Sex</th>
                        <th colSpan={fullTableData.dTypes.length + 1}>Disabilities</th>
                        <th colSpan={fullTableData.iTypes.length}>Critical Illness</th>
                      </tr>
                      <tr>
                        <th>Population</th>
                        {fullTableData.dTypes.map(d => <th key={d}>{d}</th>)}
                        {fullTableData.iTypes.map(i => <th key={i}>{i}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {placesList.map(place => 
                        fullTableData.sexes.map((sex, index) => {
                          const sexRecords = filteredRecords.filter(r => r.place === place && r.sex === sex);
                          if (sexRecords.length === 0) return null;
                          return (
                            <tr key={`${place}-${sex}`}>
                              {index === 0 && <td rowSpan={2} style={{verticalAlign: 'middle'}}><b>{place}</b></td>}
                              <td>{sex}</td>
                              <td style={{textAlign: 'center'}}><b>{sexRecords.length}</b></td>
                              {fullTableData.dTypes.map(d => <td key={d} style={{textAlign: 'center'}}>{sexRecords.filter(r => r.disabilities === d).length}</td>)}
                              {fullTableData.iTypes.map(i => <td key={i} style={{textAlign: 'center'}}>{sexRecords.filter(r => r.illness === i).length}</td>)}
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* CATEGORY TABLES PAGE */}
                <div className="Analytics-paper" style={{ width: currentPaper.width, height: currentPaper.height }}>
                  <h1>Category Tables</h1>
                  {categoryTables.map((catData, idx) => (
                    <table key={idx} style={{ marginBottom: '30px' }}>
                      <thead>
                        <tr>
                          <th>{catData.label}</th>
                          <th>Population</th>
                        </tr>
                      </thead>
                      <tbody>
                        {catData.counts.map(([type, count]: any) => (
                          <tr key={type}>
                            <td style={{ textAlign: 'left' }}>{type}</td>
                            <td style={{ textAlign: 'center' }}><b>{count}</b></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* FILTER SIDEBAR */}
          <div className="filter-sidebar-wrapper">
            <div className={`filter-group-container ${isFilterOpen ? '' : 'closed'}`}>
              
              <div className="filter-header-icons">
                 <h3 style={{ margin: 0, color: '#2a1b3c', fontSize: '18px' }}>Filter Options</h3>
                 <button onClick={() => setIsFilterOpen(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#888' }}>&times;</button>
              </div>

              <div className="filter-scrollable-content">
                  <div className={`filter-category ${openCategories['sex'] ? 'active' : ''}`}>
                    <div className="category-header" onClick={() => toggleAccordion('sex')}>
                      <span className="Gender-header">Gender</span>
                      <span className="category-indicator">▼</span>
                    </div>
                    <div className="category-checklist">
                      {["Female", "Male"].map(opt => (
                          <div className="checkbox-item" key={opt} onClick={() => handleFilterToggle('sex', opt)}>
                            <input type="checkbox" value={opt} checked={filters.sex.includes(opt)} readOnly />
                            <label>{opt}</label>
                          </div>
                      ))}
                    </div>
                  </div>

                  <div className={`filter-category ${openCategories['place'] ? 'active' : ''}`}>
                    <div className="category-header" onClick={() => toggleAccordion('place')}>
                      <span className="Barangay-header">Barangay</span>
                      <span className="category-indicator">▼</span>
                    </div>
                    <div className="category-checklist">
                      {["Biñan", "Bungahan", "Canlalay", "Casile", "De La Paz", "Ganado", "Langkiwa", "Loma", "Malaban", "Malamig", "Mampalasan", "Platero", "Poblacion", "San Antonio", "San Francisco", "San Jose", "San Vicente", "Santo Domingo", "Santo Niño", "Santo Tomas", "Soro-Soro", "Timbao", "Tubigan", "Zapote"].map(opt => (
                          <div className="checkbox-item" key={opt} onClick={() => handleFilterToggle('place', opt)}>
                            <input type="checkbox" value={opt} checked={filters.place.includes(opt)} readOnly />
                            <label>{opt}</label>
                          </div>
                      ))}
                    </div>
                  </div>

                  <div className={`filter-category ${openCategories['disabilities'] ? 'active' : ''}`}>
                    <div className="category-header" onClick={() => toggleAccordion('disabilities')}>
                      <span className="disability-header">Disability/Special Needs</span>
                      <span className="category-indicator">▼</span>
                    </div>
                    <div className="category-checklist">
                      {["None", "Physical", "Intellectual", "Learning", "Visual", "Mental", "Psychosocial", "Deaf/Hard of Hearing", "Speech and Language Impairment", "Cancer", "Rare Diseases"].map(opt => (
                          <div className="checkbox-item" key={opt} onClick={() => handleFilterToggle('disabilities', opt)}>
                            <input type="checkbox" value={opt} checked={filters.disabilities.includes(opt)} readOnly />
                            <label>{opt}</label>
                          </div>
                      ))}
                    </div>
                  </div>

                  <div className={`filter-category ${openCategories['illness'] ? 'active' : ''}`}>
                    <div className="category-header" onClick={() => toggleAccordion('illness')}>
                      <span className="illness-header">Critical Illness</span>
                      <span className="category-indicator">▼</span>
                    </div>
                    <div className="category-checklist">
                      {["None", "Cancer", "Cardio-vascular Disease", "Paralysis", "Organ Failure", "Others"].map(opt => (
                          <div className="checkbox-item" key={opt} onClick={() => handleFilterToggle('illness', opt)}>
                            <input type="checkbox" value={opt} checked={filters.illness.includes(opt)} readOnly />
                            <label>{opt}</label>
                          </div>
                      ))}
                    </div>
                  </div>
              </div>

              <div className="filter-footer">
                <button className="btn-clear-all" onClick={clearFilters}>Clear All</button>
                <button className="btn-apply" onClick={applyFilter}>Apply</button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}