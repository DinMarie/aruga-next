'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const paperDimensions: any = {
  a4: { width: "284mm", minHeight: "297mm", limitPx: 850 },
  letter: { width: "290mm", minHeight: "279mm", limitPx: 800 },
  long: { width: "290mm", minHeight: "330mm", limitPx: 1080 }
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
  const [openCategories, setOpenCategories] = useState<{ [key: string]: boolean }>({});

  // Filter States
  const [filters, setFilters] = useState<{sex: string[], place: string[], disabilities: string[], illness: string[]}>({
    sex: [], place: [], disabilities: [], illness: []
  });

  const pagesContainerRef = useRef<HTMLDivElement>(null);
  const chartRefs = useRef<{ pie1: any, pie2: any, bar: any }>({ pie1: null, pie2: null, bar: null });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ((window as any).Chart) setChartJsLoaded(true);
      if ((window as any).html2canvas) setH2cLoaded(true);
      if ((window as any).jspdf) setJsPdfLoaded(true);
    }
  }, []);

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

  // 2. DOM Manipulation & Rendering
  useEffect(() => {
    if (!pagesContainerRef.current || !chartJsLoaded || isLoading) return;

    const container = pagesContainerRef.current;
    container.innerHTML = ""; 
    const paper = paperDimensions[paperSize];

    function createNewPage(isFirstPage: boolean, pageTitle: string) {
      const page = document.createElement("div");
      page.className = "page Analytics-paper";
      page.style.width = paper.width;
      page.style.minHeight = paper.minHeight;

      if (isFirstPage) {
        page.innerHTML = `
          <h1 style="font-size: 24px; color: #2a1b3c; border-bottom: 2px solid #8c6d8c; padding-bottom: 10px; margin-bottom: 20px;">${pageTitle}</h1>
          <div style="display: flex; flex-direction: column; gap: 30px;">
            <div style="width: 100%;">
                <h4 style="margin-bottom:10px; color:#512da8; text-transform:uppercase; font-size:14px;">Disability Summary</h4>
                <div style="height:250px; width:100%;"><canvas id="pie1Chart"></canvas></div>
            </div>
            <div style="width: 100%;">
                <h4 style="margin-bottom:10px; color:#512da8; text-transform:uppercase; font-size:14px;">Illness Summary</h4>
                <div style="height:250px; width:100%;"><canvas id="pie2Chart"></canvas></div>
            </div>
            <div style="width: 100%; margin-bottom: 60px;">
                <h4 style="margin-bottom:10px; color:#512da8; text-transform:uppercase; font-size:14px;">Population Summary</h4>
                <div style="height:300px; width:100%;"><canvas id="barChart"></canvas></div>
            </div>
          </div>
        `;
      }

      container.appendChild(page);
      return page;
    }

    createNewPage(true, "Disability Records Analytics");

    if (chartRefs.current.pie1) chartRefs.current.pie1.destroy();
    if (chartRefs.current.pie2) chartRefs.current.pie2.destroy();
    if (chartRefs.current.bar) chartRefs.current.bar.destroy();

    const Chart = (window as any).Chart;

    const disabilityCount: any = {};
    const illnessCounts: any = {};
    const placeCount: any = {};
    filteredRecords.forEach(r => { 
        disabilityCount[r.disabilities] = (disabilityCount[r.disabilities] || 0) + 1;
        illnessCounts[r.illness] = (illnessCounts[r.illness] || 0) + 1;
        placeCount[r.place] = (placeCount[r.place] || 0) + 1;
    });

    const pieColors = ["#512da8", "#8c6d8c", "#8bc34a", "#2a1b3c", "#facc15", "#e53935", "#36a2eb", "#4bc0c0"];

    const pie1Ctx = document.getElementById("pie1Chart") as HTMLCanvasElement;
    if (pie1Ctx) {
      chartRefs.current.pie1 = new Chart(pie1Ctx, {
        type: "pie",
        data: { labels: Object.keys(disabilityCount), datasets: [{ data: Object.values(disabilityCount), backgroundColor: pieColors }] },
        options: { animation: false, responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }
      });
    }

    const pie2Ctx = document.getElementById("pie2Chart") as HTMLCanvasElement;
    if (pie2Ctx) {
      chartRefs.current.pie2 = new Chart(pie2Ctx, {
        type: "pie",
        data: { labels: Object.keys(illnessCounts), datasets: [{ data: Object.values(illnessCounts), backgroundColor: pieColors }] },
        options: { animation: false, responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }
      });
    }

    const barCtx = document.getElementById("barChart") as HTMLCanvasElement;
    if (barCtx) {
      chartRefs.current.bar = new Chart(barCtx, {
        type: "bar",
        data: { labels: Object.keys(placeCount), datasets: [{ label: "Population", data: Object.values(placeCount), backgroundColor: "#512da8" }] },
        options: { animation: false, responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { stepSize: 1, precision: 0 } } } }
      });
    }

    const places = [...new Set(filteredRecords.map(r => r.place))].sort((a: any, b: any) => a.localeCompare(b));
    const paragraphs: string[] = [];

    places.forEach(place => {
      const placeRecords = filteredRecords.filter(r => r.place === place);
      const totalPopulation = placeRecords.length;
      if (totalPopulation === 0) return;

      const males = placeRecords.filter(r => r.sex === "Male").length;
      const females = placeRecords.filter(r => r.sex === "Female").length;

      const disabilityText: string[] = [];
      placeRecords.forEach(person => {
        if (person.disabilities !== "None") {
          disabilityText.push(`${person.sex.toLowerCase()} with ${person.disabilities.toLowerCase()} disability`);
        }
      });

      const illnessText: string[] = [];
      placeRecords.forEach(person => {
        if (person.illness !== "None") {
          illnessText.push(`${person.sex.toLowerCase()} with ${person.illness.toLowerCase()}`);
        }
      });

      const dCount = disabilityText.length;
      const dString = dCount > 0 ? `, including <b>${disabilityText.join(", ")}</b>` : "";
      
      const iCount = illnessText.length;
      const iString = iCount > 0 ? `, including <b>${illnessText.join(", ")}</b>` : "";

      paragraphs.push(`
        The Barangay of <b>${place}</b> has a total population of <b>${totalPopulation}</b> residents, consisting of <b>${males}</b> males and <b>${females}</b> females. 
        Among them, <b>${dCount}</b> individuals have disabilities${dString}. 
        In terms of health, <b>${iCount}</b> residents have reported illnesses${iString}.
      `);
    });

    let paragraphsPage = createNewPage(false, "Summary Paragraphs");
    
    paragraphs.forEach(text => {
      const p = document.createElement("p");
      p.innerHTML = text;
      p.style.margin = "10px 0";
      p.style.textAlign = "justify";
      p.style.fontSize = "13px";
      p.style.lineHeight = "1.6";
      paragraphsPage.appendChild(p);

      if (paragraphsPage.scrollHeight > paper.limitPx) {
        paragraphsPage.removeChild(p);
        paragraphsPage = createNewPage(false, "Summary");
        paragraphsPage.appendChild(p);
      }
    });

    // Step 3: Full Table (Cleaned up HTML)
    const fullTablePage = createNewPage(false, "Full Table Summary");
    const table = document.createElement("table");
    table.className = "reportTable";

    const sexes = [...new Set(filteredRecords.map(r => r.sex))].sort();
    const disabilityTypes = [...new Set(filteredRecords.map(r => r.disabilities))].sort();
    const illnessTypes = [...new Set(filteredRecords.map(r => r.illness))].sort();

    table.innerHTML = `
      <thead>
        <tr>
          <th rowspan="2">Barangay</th>
          <th rowspan="2">Sex</th>
          <th colspan="${disabilityTypes.length + 1}">Disabilities</th>
          <th colspan="${illnessTypes.length}">Critical Illness</th>
        </tr>
        <tr>
          <th>Pop.</th>
          ${disabilityTypes.map(d=>`<th>${d}</th>`).join("")}
          ${illnessTypes.map(i=>`<th>${i}</th>`).join("")}
        </tr>
      </thead>
      <tbody>
        ${places.map(place => sexes.map((sex, index) => {
          const sexRecords = filteredRecords.filter(r => r.place===place && r.sex===sex);
          if (sexRecords.length === 0) return "";
          
          const dCounts = disabilityTypes.map(d => sexRecords.filter(r => r.disabilities===d).length);
          const iCounts = illnessTypes.map(i => sexRecords.filter(r => r.illness===i).length);

          return `<tr>
            ${index===0 ? `<td rowspan="2"><b>${place}</b></td>` : ""}
            <td>${sex}</td>
            <td><b>${sexRecords.length}</b></td>
            ${dCounts.map(c=>`<td>${c}</td>`).join("")}
            ${iCounts.map(c=>`<td>${c}</td>`).join("")}
          </tr>`;
        }).join("")).join("")}
      </tbody>
    `;
    fullTablePage.appendChild(table);

    // Step 4: Category Tables
    const categoryTablesPage = createNewPage(false, "Category Tables");
    
    const categoryLabels: any = { place: "Barangay", sex: "Sex", disabilities: "Disabilities", illness: "Critical Illness" };
    const categories = ["place","sex","disabilities","illness"];

    categories.forEach(cat => {
      const countMap: any = {};
      filteredRecords.forEach(r => countMap[r[cat]||"None"] = (countMap[r[cat]||"None"]||0)+1 );

      const catTable = document.createElement("table");
      catTable.className = "categoryTable";

      catTable.innerHTML = `
        <thead>
          <tr>
            <th>${categoryLabels[cat]}</th>
            <th>Population</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(countMap).sort(([a]: any, [b]: any) => a.localeCompare(b)).map(([type,count])=>
            `<tr>
              <td>${type}</td>
              <td><b>${count}</b></td>
            </tr>`
          ).join("")}
        </tbody>
      `;
      categoryTablesPage.appendChild(catTable);
    });

  }, [filteredRecords, paperSize, chartJsLoaded, isLoading]);


  // 3. Filter Interactions
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


  // 4. Download PDF
  const downloadPDF = async () => {
    if (!h2cLoaded || !jspdfLoaded) return alert("PDF Libraries are still loading...");
    
    const html2canvas = (window as any).html2canvas;
    const jsPDF = (window as any).jspdf.jsPDF;
    
    let pdf;
    if(paperSize==="a4") pdf = new jsPDF('p','mm','a4');
    else if(paperSize==="letter") pdf = new jsPDF('p','mm','letter');
    else if(paperSize==="long") pdf = new jsPDF('p','mm',[330,216]);

    const pages = document.querySelectorAll(".page");
    for(let i=0; i<pages.length; i++){
      const canvas = await html2canvas(pages[i] as HTMLElement, {scale: 2});
      const imgData = canvas.toDataURL("image/png");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = canvas.height * pdfWidth / canvas.width;

      if(i > 0) pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    }
    pdf.save("Aruga_Project_Analytics.pdf");
  };


  return (
    <div className="dashboard-root">
      <Script src="https://cdn.jsdelivr.net/npm/chart.js" onReady={() => setChartJsLoaded(true)} />
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js" onReady={() => setH2cLoaded(true)} />
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" onReady={() => setJsPdfLoaded(true)} />

      <style dangerouslySetInnerHTML={{__html: `
        .dashboard-root { background-color: #0f111a; min-height: 100vh; display: flex; flex-direction: column; font-family: "Segoe UI", Arial, sans-serif; overflow: hidden; }
        .page-container { background-color: white; width: 100%; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5); display: flex; flex-direction: column; overflow: hidden; gap: 20px; flex: 1; position: relative; }
        
        /* HEADER */
        .header { background-color: #a68cb0; padding: 12px 25px; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #8e6e9e; z-index: 1000; }
        .logo-box { width: 50px; height: 50px; background-color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        
        /* ACTION BAR */
        .action-bar { padding: 25px; display: flex; gap: 12px; align-items: center; }
        .btn { padding: 10px 25px; border: none; border-radius: 20px; font-weight: bold; cursor: pointer; color: white; display: flex; align-items: center; gap: 10px; transition: 0.2s; }
        .btn:hover { opacity: 0.85; }
        .btn-filter { background-color: #f1f1f1; color: #333; border: 1px solid #ccc; }
        .btn-paper { background-color: #512da8; }
        .btn-print { background-color: #8bc34a; }
        .btn-download { background-color: #ff854c; }
        .back-Icon { width: 20px; height: 20px; }

        /* PAPER DROPDOWN */
        .paper-dropdown { position: relative; display: inline-block; }
        .paper-choice-dropdown { display: flex; position: absolute; background-color: #512da8; min-width: 100px; z-index: 100; padding: 10px; flex-direction: column; gap: 10px; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; top: 100%; left: 0; }
        .size { border: none; font-weight: bold; cursor: pointer; color: white; background-color: #ff854c; width: 100%; padding: 8px; border-radius: 20px; transition: 0.2s; }
        .size:hover { filter: brightness(1.1); }

        /* MAIN CONTENT AREA */
        .main-workspace { display: flex; flex: 1; overflow: hidden; position: relative; padding-bottom: 60px; }
        .pagesContainer { width: 100%; display: flex; flex-direction: column; align-items: center; gap: 40px; transform-origin: top center; padding: 20px; overflow-y: auto; padding-right: 360px; transition: transform 0.2s; }
        .pagesContainer.two-page { display: grid; grid-template-columns: repeat(2, auto); justify-content: center; align-content: start; }
        .Analytics-paper { padding: 30px; border: 1px solid #ccc; box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2); background-color: white; }

        /* --- BEAUTIFUL TABLE FORMATTING --- */
        .reportTable { width: 100%; border-collapse: collapse; margin-bottom: 20px; table-layout: auto; }
        .reportTable th, .reportTable td { padding: 6px 4px; font-size: 9px; text-align: center; border: 1px solid #ccc; vertical-align: middle; }
        .reportTable th { background: #ede7f6; color: #2a1b3c; font-weight: bold; }
        .reportTable tbody tr:nth-child(even) { background-color: #fcfbfe; }
        .reportTable tbody tr:hover { background-color: #f3ebfc; }

        .categoryTable { width: 80%; margin: 0 auto 30px auto; border-collapse: collapse; }
        .categoryTable th, .categoryTable td { padding: 8px; font-size: 11px; text-align: center; border: 1px solid #ccc; }
        .categoryTable th { background: #ede7f6; color: #2a1b3c; font-weight: bold; font-size: 12px; }
        .categoryTable tbody tr:nth-child(even) { background-color: #fcfbfe; }

        /* RIGHT FILTER SIDEBAR */
        .filter-sidebar { width: 340px; background-color: white; height: 100%; position: absolute; right: 0; top: 0; border-left: 1px solid #ccc; box-shadow: -3px 0 10px rgba(0,0,0,0.1); padding: 25px; overflow-y: auto; z-index: 100; transition: transform 0.3s ease; }
        .filter-sidebar.closed { transform: translateX(100%); }
        .filter-category { margin-bottom: 12px; border-radius: 8px; background: #f9f9fc; border: 1px solid #e0dce5; overflow: hidden; }
        .category-header { background-color: #ede7f6; padding: 12px 16px; font-weight: 600; color: #2a1b3c; cursor: pointer; display: flex; justify-content: space-between; align-items: center; user-select: none; }
        .category-header:hover { background-color: #e0d4f0; }
        .category-checklist { padding: 12px 16px; background: white; border-top: 1px solid #e6dfed; max-height: 250px; overflow-y: auto; }
        .checkbox-item { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-size: 14px; color: #1e1428; cursor: pointer; }
        .checkbox-item input[type="checkbox"] { width: 16px; height: 16px; accent-color: #512da8; cursor: pointer; }
        
        .filter-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; padding-top: 15px; border-top: 2px solid #eee; }
        .btn-apply { background-color: #512da8; color: white; padding: 8px 22px; border-radius: 25px; border: none; font-weight: bold; cursor: pointer; }
        .btn-clear-all { color: #666; text-decoration: underline; background: none; border: none; cursor: pointer; }

        /* BOTTOM NAV */
        .bottom_navi { width: 100%; height: 60px; background-color: #a68cb0; position: fixed; bottom: 0; left: 0; display: flex; justify-content: space-between; align-items: center; padding: 0 100px; z-index: 999; }
        .page_layout { background: none; border: none; cursor: pointer; border-radius: 8px; padding: 5px; transition: background 0.2s; display: flex; align-items: center; gap: 10px; color: white; font-weight: bold; font-size: 16px; }
        .page_layout:hover { background: rgba(255,255,255,0.2); }
        .zoom { display: flex; align-items: center; gap: 10px; color: white; font-weight: bold; }
        .zoom select { padding: 6px 12px; border-radius: 20px; border: none; outline: none; font-weight: bold; }

        @media print {
            body, .dashboard-root, .page-container, .main-workspace { height: auto !important; overflow: visible !important; background: white !important; padding: 0 !important; margin: 0 !important; }
            .header, .action-bar, .bottom_navi, .filter-sidebar { display: none !important; }
            .pagesContainer { padding: 0 !important; transform: scale(1) !important; display: block !important; }
            .Analytics-paper { box-shadow: none !important; border: none !important; margin: 0 !important; padding: 0 !important; page-break-after: always !important; width: 100% !important; min-height: 0 !important; }
        }
      `}} />

      <div className="page-container">
        <header className="header">
          <div className="header-left">
            <div className="logo-box">
              <img src="/logo1.png" alt="Logo" onError={(e) => e.currentTarget.style.display='none'} />
            </div>
            <span className="header-title" style={{ color: 'white', fontWeight: 'bold' }}>CSWDO - Biñan City</span>
          </div>
        </header>

        <div className="action-bar">
          <button className="btn btn-filter" onClick={() => router.push('/table')}>
            <img src="/back.png" alt="backbutton" className="back-Icon" /> Back
          </button>
          
          <div className="paper-dropdown" onMouseLeave={() => setPaperDropdownOpen(false)}>
            <button className="btn btn-paper" style={{ borderBottomLeftRadius: paperDropdownOpen ? '0' : '20px', borderBottomRightRadius: paperDropdownOpen ? '0' : '20px' }} onClick={() => setPaperDropdownOpen(!paperDropdownOpen)}>
              Paper Size: {paperSize.toUpperCase()} ▼
            </button>
            <div className="paper-choice-dropdown" style={{ display: paperDropdownOpen ? 'flex' : 'none' }}>
              <button className="size" onClick={() => { setPaperSize('a4'); setPaperDropdownOpen(false); }}>A4</button>
              <button className="size" onClick={() => { setPaperSize('letter'); setPaperDropdownOpen(false); }}>Letter</button>
              <button className="size" onClick={() => { setPaperSize('long'); setPaperDropdownOpen(false); }}>Long</button>
            </div>
          </div>

          <div style={{ flex: 1 }}></div>

          <button className="btn btn-print" onClick={() => window.print()}>Print Report</button>
          <button className="btn btn-download" onClick={downloadPDF}>Download PDF</button>
        </div>

        <div className="main-workspace">
          <div id="pagesContainer" ref={pagesContainerRef} className={`pagesContainer ${layout2Pages ? 'two-page' : ''}`} style={{ transform: `scale(${zoom})` }}>
            {isLoading && <h2 style={{ marginTop: '50px' }}>Loading Data from Database...</h2>}
          </div>

          <div className={`filter-sidebar ${isFilterOpen ? '' : 'closed'}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, color: '#2a1b3c' }}>Filters</h2>
                <button onClick={() => setIsFilterOpen(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#666' }}>✕</button>
            </div>

            <div className="filter-category">
              <header className="category-header" onClick={() => toggleAccordion('sex')}>Sex <span>{openCategories['sex'] ? '▲' : '▼'}</span></header>
              <div className="category-checklist" style={{ display: openCategories['sex'] ? 'block' : 'none' }}>
                {["Female", "Male"].map(opt => (
                  <label className="checkbox-item" key={opt}><input type="checkbox" checked={filters.sex.includes(opt)} onChange={() => handleFilterToggle('sex', opt)} /> {opt}</label>
                ))}
              </div>
            </div>

            <div className="filter-category">
              <header className="category-header" onClick={() => toggleAccordion('place')}>Barangay <span>{openCategories['place'] ? '▲' : '▼'}</span></header>
              <div className="category-checklist" style={{ display: openCategories['place'] ? 'block' : 'none', maxHeight: '250px', overflowY: 'auto' }}>
                {["Biñan", "Bungahan", "Canlalay", "Casile", "De La Paz", "Ganado", "Langkiwa", "Loma", "Malaban", "Malamig", "Mampalasan", "Platero", "Poblacion", "San Antonio", "San Francisco", "San Jose", "San Vicente", "Santo Domingo", "Santo Niño", "Santo Tomas", "Soro-Soro", "Timbao", "Tubigan", "Zapote"].map(opt => (
                  <label className="checkbox-item" key={opt}><input type="checkbox" checked={filters.place.includes(opt)} onChange={() => handleFilterToggle('place', opt)} /> {opt}</label>
                ))}
              </div>
            </div>

            <div className="filter-category">
              <header className="category-header" onClick={() => toggleAccordion('disability')}>Disabilities <span>{openCategories['disability'] ? '▲' : '▼'}</span></header>
              <div className="category-checklist" style={{ display: openCategories['disability'] ? 'block' : 'none' }}>
                {["None", "Physical", "Intellectual", "Learning", "Visual", "Mental", "Psychosocial", "Deaf/Hard of Hearing", "Speech and Language Impairment", "Cancer", "Rare Diseases"].map(opt => (
                  <label className="checkbox-item" key={opt}><input type="checkbox" checked={filters.disabilities.includes(opt)} onChange={() => handleFilterToggle('disabilities', opt)} /> {opt}</label>
                ))}
              </div>
            </div>

            <div className="filter-category">
              <header className="category-header" onClick={() => toggleAccordion('illness')}>Critical Illness <span>{openCategories['illness'] ? '▲' : '▼'}</span></header>
              <div className="category-checklist" style={{ display: openCategories['illness'] ? 'block' : 'none' }}>
                {["None", "Cancer", "Cardio-vascular Disease", "Paralysis", "Organ Failure", "Others"].map(opt => (
                  <label className="checkbox-item" key={opt}><input type="checkbox" checked={filters.illness.includes(opt)} onChange={() => handleFilterToggle('illness', opt)} /> {opt}</label>
                ))}
              </div>
            </div>

            <div className="filter-footer">
              <button className="btn-clear-all" onClick={clearFilters}>Clear All</button>
              <button className="btn-apply" onClick={applyFilter}>Apply Filter</button>
            </div>
          </div>
        </div>

        <div className="bottom_navi">
          <div style={{ display: 'flex', gap: '20px' }}>
            <button className="page_layout" onClick={() => setLayout2Pages(!layout2Pages)}>
                <img src="/window.svg" width="20" height="20" style={{ filter: 'invert(1)' }} alt="layout" />
                {layout2Pages ? "View as 1 Page" : "View as 2 Pages"}
            </button>
            
            <button className="page_layout" onClick={() => setIsFilterOpen(!isFilterOpen)} style={{ background: isFilterOpen ? 'rgba(255,255,255,0.2)' : 'transparent' }}>
                <img src="/file.svg" width="20" height="20" style={{ filter: 'invert(1)' }} alt="filter" />
                Toggle Filters
            </button>
          </div>

          <div className="zoom">
            <p style={{ margin: 0 }}>Zoom:</p>
            <select value={zoom} onChange={(e) => setZoom(e.target.value)}>
              <option value="0.5">50%</option>
              <option value="0.75">75%</option>
              <option value="1">100%</option>
              <option value="1.5">150%</option>
              <option value="1.75">175%</option>
              <option value="2">200%</option>
            </select>
          </div>
        </div>

      </div>
    </div>
  );
}