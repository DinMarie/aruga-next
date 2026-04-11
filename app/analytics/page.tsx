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
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [paperDropdownOpen, setPaperDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [openCategories, setOpenCategories] = useState<{ [key: string]: boolean }>({
    sex: false, place: false, disabilities: false, illness: false
  });

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
                <h4 style="margin-bottom:10px; color:#333; font-size:16px;">Disability Summary</h4>
                <div style="height:250px; width:100%;"><canvas id="pie1Chart"></canvas></div>
            </div>
            <div style="width: 100%;">
                <h4 style="margin-bottom:10px; color:#333; font-size:16px;">Illness Summary</h4>
                <div style="height:250px; width:100%;"><canvas id="pie2Chart"></canvas></div>
            </div>
            <div style="width: 100%; margin-bottom: 60px;">
                <h4 style="margin-bottom:10px; color:#333; font-size:16px;">Population Summary</h4>
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
              const percent = ((value / total) * 100).toFixed(1);
              return {
                text: `${label}: ${value} (${percent}%)`,
                fillStyle: dataset.backgroundColor[i],
                index: i
              };
            });
          }
        }
      }
    };

    const pie1Ctx = document.getElementById("pie1Chart") as HTMLCanvasElement;
    if (pie1Ctx) {
      chartRefs.current.pie1 = new Chart(pie1Ctx, {
        type: "pie",
        data: { labels: Object.keys(disabilityCount), datasets: [{ data: Object.values(disabilityCount), backgroundColor: pieColors }] },
        options: { animation: false, responsive: true, maintainAspectRatio: false, plugins: customLegendPlugin }
      });
    }

    const pie2Ctx = document.getElementById("pie2Chart") as HTMLCanvasElement;
    if (pie2Ctx) {
      chartRefs.current.pie2 = new Chart(pie2Ctx, {
        type: "pie",
        data: { labels: Object.keys(illnessCounts), datasets: [{ data: Object.values(illnessCounts), backgroundColor: pieColors }] },
        options: { animation: false, responsive: true, maintainAspectRatio: false, plugins: customLegendPlugin }
      });
    }

    const barCtx = document.getElementById("barChart") as HTMLCanvasElement;
    if (barCtx) {
      chartRefs.current.bar = new Chart(barCtx, {
        type: "bar",
        data: { labels: Object.keys(placeCount), datasets: [{ label: "Population", data: Object.values(placeCount), backgroundColor: "#36a2eb" }] },
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

    // Full Table
    const fullTablePage = createNewPage(false, "Full Table Summary");
    const table = document.createElement("table");
    table.style.width = "100%";
    table.style.marginBottom = "20px";

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

    // Category Tables
    const categoryTablesPage = createNewPage(false, "Category Tables");
    const categoryLabels: any = { place: "Barangay", sex: "Sex", disabilities: "Disabilities", illness: "Critical Illness" };
    const categories = ["place","sex","disabilities","illness"];

    categories.forEach(cat => {
      const countMap: any = {};
      filteredRecords.forEach(r => countMap[r[cat]||"None"] = (countMap[r[cat]||"None"]||0)+1 );

      const catTable = document.createElement("table");
      catTable.style.width = "100%";
      catTable.style.marginBottom = "30px";

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
    pdf.save("Disability_Analytics.pdf");
  };

  return (
    <>
      <Script src="https://cdn.jsdelivr.net/npm/chart.js" onReady={() => setChartJsLoaded(true)} />
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js" onReady={() => setH2cLoaded(true)} />
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" onReady={() => setJsPdfLoaded(true)} />

      <style dangerouslySetInnerHTML={{__html: `
        .analytics-root-wrapper { background-color: #0f111a; display: flex; justify-content: center; min-height: 100vh; width: 100%; font-family: "Segoe UI", Arial, sans-serif; }
        .page-container { background-color: white; width: 100%; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5); display: flex; flex-direction: column; overflow: visible; gap: 20px; padding-bottom: 80px; }
        
        #pagesContainer.two-page { display: grid; grid-template-columns: repeat(2, auto); justify-content: center; gap: 20px; }

        .header { background-color: #a68cb0; padding: 12px 25px; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #8e6e9e; z-index: 1000; }
        .header-title { color: white; }
        .header-left { display: flex; align-items: center; gap: 15px; }
        .logo-box { width: 50px; height: 50px; background-color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .logo-box img { width: 100%; height: 100%; object-fit: contain; }

        .dropdown { position: relative; display: inline-block; }
        .dropdown-content { display: none; position: absolute; background-color: white; min-width: 280px; box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.2); z-index: 100; border: 1px solid #ccc; border-radius: 8px; padding: 20px; margin-top: 5px; right: 0; }
        .dropdown:hover .dropdown-content { display: block; }
        .user-dropdown { right: 0; min-width: 150px; }
        .filter-dropdown { left: 0; }

        .action-bar { padding: 25px; display: flex; gap: 12px; align-items: center; }
        .btn { padding: 10px 25px; border: none; border-radius: 20px; font-weight: bold; cursor: pointer; color: white; }
        .btn-filter { display: flex; align-items: center; gap: 10px; background-color: #f1f1f1; color: #333; border: 1px solid #ccc; padding: 8px 18px; transition: background-color 0.2s ease; }
        .btn-paper { background-color: #512da8; }
        .btn-paper.show { border-bottom-left-radius: 0; border-bottom-right-radius: 0; }
        .btn-print { background-color: #8bc34a; }
        .btn-download { background-color: #ff854c; }

        .paper-choice-dropdown { display: none; position: absolute; background-color: #512da8; min-width: 100px; z-index: 100; padding: 10px; flex-direction: column; gap: 10px; margin-top: -5px; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; }
        .size { border: none; font-weight: bold; cursor: pointer; color: white; transition: 0.2s; width: 94px; height: 25px; border-radius: 20px; }
        .btn-a4, .btn-letter, .btn-long { background-color: #ff854c; }
        .paper-choice-dropdown.show { display: flex; }
        .paper-choice-dropdown.hide { display: none; }
        .paper-choice-dropdown a { display: block; padding: 10px 15px; text-decoration: none; color: #333; transition: background 0.1s; }
        .paper-choice-dropdown a:hover { background-color: #f1f1f1; color: #512da8; cursor: pointer; }

        .checkbox-item { display: flex; align-items: center; gap: 8px; margin-bottom: 5px; font-size: 0.9rem; cursor: pointer;}
        .checkbox-item input { cursor: pointer; }
        .back-Icon { width: 20px; height: 20px; }

        .main-paper-container { display: flex; flex-direction: row; gap: 20px; align-items: flex-start; width: 100%; }
        .pagesContainer { justify-content: center; align-content: center; display: flex; gap: 5px; margin-bottom: 50px; transform-origin:top left; padding-left: 60px; }
        .Analytics-paper { width: 100%; padding: 30px; border-color: black; border: 1px solid #ccc; box-shadow: 0 3px 3px rgba(0, 0, 0, 0.2); display: flex; flex-direction: column; overflow: hidden; margin: 20px auto; background-color: white; }

        .bottom_navi { width: 100%; height: 60px; left: 0; background-color: #a68cb0; position: fixed; padding: 10px; display: flex; justify-content: space-between; align-items: center; z-index: 999; padding-right: 100px; padding-left: 100px; bottom: 0px; box-sizing: border-box;}
        
        .filter-header-icons { display: flex; justify-content: space-between; align-items: center; }
        .filter_all { width:410px; min-width:340px; z-index: 100; margin-right: 0px; background-color: transparent; height: 100vh; padding-left: 50px; position: fixed; right: 0; top: 0; pointer-events: none; }
        .filter-group-container { pointer-events: auto; width: 320px; min-width: 320px; background-color: #fff; padding: 25px; border: 1px solid #ccc; box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1); display: flex; flex-direction: column; transition: transform 0.3s ease, opacity 0.3s ease; height: fit-content; max-height: 80vh; overflow-y: auto; border-radius: 8px; margin-left: -15px; position: fixed; margin-top: 100px; transform: translateX(0); opacity: 1; }
        .filter-group-container.closed { transform: translateX(150%); opacity: 0; pointer-events: none; }

        .category-header { cursor: pointer; display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #eee; user-select: none; }
        .category-checklist { display: none; padding-top: 10px; background-color: #f9f9f9; border-radius: 4px; padding: 10px; width: 100%; border: 1px solid #ccc; box-shadow: inset 0 2px 4px rgba(0,0,0,0.05); max-height: 200px; overflow-y: auto; overflow-x: hidden; }
        .filter-category.active .category-checklist { display: block; }
        .filter-category.active .category-indicator { transform: rotate(180deg); }
        .category-indicator { transition: transform 0.2s ease; display: inline-block; }

        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ccc; padding: 12px; text-align: left; }
        th { background-color: #f8f8f8; }
        tr:nth-child(even) { background-color: #f2f2f2; }
        tr:hover { background-color: #e0e0e0; }

        .filter-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; padding-top: 12px; border-top: 2px solid #eee; }
        .btn-apply { background-color: #512da8 !important; color: white; padding: 8px 22px !important; border-radius: 30px !important; font-size: 0.9rem; border: none; cursor: pointer;}
        .btn-clear-all { color: #666; text-decoration: underline; padding: 5px 8px; background: none; border: none; cursor: pointer; }
        .zoom { display: flex; align-items: center; gap: 5px; }
        .zoom p { font-size: 15px; font-weight: bold; color: white; }

        @media print {
          .action-bar, .bottom_navi, .header, .filter_all { display: none !important; }
          body, .page-container, .analytics-root-wrapper { background: white !important; padding: 0 !important; margin: 0 !important; height: auto !important; overflow: visible !important; box-shadow: none !important; display: block !important; }
          #pagesContainer { transform: scale(1) !important; gap: 0 !important; display: block !important; padding: 0 !important; margin: 0 !important; }
          .page { box-shadow: none !important; margin: 0 !important; page-break-after: always !important; }
        }
        
        #pagesContainer { display: flex; flex-direction: column; align-items: center; gap: 40px; flex: 1; transform-origin: top center; padding-top: 20px;}
      `}} />

      {/* NEW SAFE WRAPPER */}
      <div className="analytics-root-wrapper">
        <div className="page-container">
          
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
                <a href="#" style={{display:'block', padding: '8px', textDecoration:'none', color:'#333'}}>Profile</a>
                <a href="#" id="logoutBtn" style={{display:'block', padding: '8px', textDecoration:'none', color:'red', borderTop: '1px solid #eee'}}>Logout</a>
              </div>
            </div>
          </header>

          {/* ACTION BAR */}
          <div className="action-bar">
            <button className="btn btn-filter" onClick={() => router.push('/table')}>
              <img src="/back.png" alt="backbutton" className="back-Icon" />
            </button>
            
            <div className="dropdown" id="paperSize" onMouseLeave={() => setPaperDropdownOpen(false)}>
              <button className={`btn btn-paper ${paperDropdownOpen ? 'show' : ''}`} onClick={() => setPaperDropdownOpen(!paperDropdownOpen)}>
                Paper Size
              </button>
              <div className={`paper-choice-dropdown ${paperDropdownOpen ? 'show' : 'hide'}`}>
                <button className="size btn-a4" onClick={() => {setPaperSize('a4'); setPaperDropdownOpen(false)}}>A4</button>
                <button className="size btn-letter" onClick={() => {setPaperSize('letter'); setPaperDropdownOpen(false)}}>Letter</button>
                <button className="size btn-long" onClick={() => {setPaperSize('long'); setPaperDropdownOpen(false)}}>Long</button>
              </div>
            </div>

            <button className="btn btn-print" onClick={() => window.print()}>Print Report</button>
            <button id="downloadPdf" className="btn btn-download" style={{background: '#34a853', color: 'white'}} onClick={downloadPDF}>Download</button>
          </div>

          {/* BOTTOM NAV */}
          <div className="bottom_navi">
            <button className="page_layout" onClick={() => setLayout2Pages(!layout2Pages)} id="layoutBtn" style={{background: 'none', border: 'none'}}>
              <img src="/page_layout.png" width="25" height="30" style={{margin:'7px', cursor: 'pointer'}} alt="layout" onError={(e) => { e.currentTarget.src = '/window.svg'; e.currentTarget.style.filter='invert(1)'; }}/>
            </button>
            <div className="zoom">
              <p>Zoom</p>
              <select value={zoom} onChange={(e) => setZoom(e.target.value)} style={{borderRadius: '4px', padding: '2px', color: '#333'}}>
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
          <div id="pagesContainer" ref={pagesContainerRef} className={layout2Pages ? 'two-page' : ''} style={{ transform: `scale(${zoom})` }}>
            {isLoading && <h2 style={{ marginTop: '50px', textAlign: 'center' }}>Loading Data...</h2>}
          </div>

          {/* FILTER */}
          <div className="filter_all">
            <div className={`filter-group-container ${isFilterOpen ? '' : 'closed'}`}>
              <div className="filter-header-icons">
                <button className="btn btn-filter" onClick={() => setIsFilterOpen(!isFilterOpen)} style={{backgroundColor: '#512da8', color: 'white'}}>
                  <img src="/back.png" alt="back" className="back-Icon" style={{filter: 'brightness(0) invert(1)'}} />
                  <span style={{fontSize: '15px'}}>⚙ FILTER</span>
                </button>
              </div>

              <div className={`filter-category ${openCategories['sex'] ? 'active' : ''}`} style={{marginTop: '20px'}}>
                <div className="category-header" onClick={() => toggleAccordion('sex')}>
                  <span className="Gender-header">Gender</span>
                  <span className="category-indicator">▼</span>
                </div>
                <div className="category-checklist" id="genderChecklist">
                  {["Female", "Male"].map(opt => (
                      <div className="checkbox-item" key={opt}>
                        <input type="checkbox" id={`g-${opt}`} value={opt} checked={filters.sex.includes(opt)} onChange={() => handleFilterToggle('sex', opt)} />
                        <label htmlFor={`g-${opt}`}>{opt}</label>
                      </div>
                  ))}
                </div>
              </div>

              <div className={`filter-category ${openCategories['place'] ? 'active' : ''}`}>
                <div className="category-header" onClick={() => toggleAccordion('place')}>
                  <span className="Barangay-header">Barangay</span>
                  <span className="category-indicator">▼</span>
                </div>
                <div className="category-checklist" id="barangayChecklist">
                  {["Biñan", "Bungahan", "Canlalay", "Casile", "De La Paz", "Ganado", "Langkiwa", "Loma", "Malaban", "Malamig", "Mampalasan", "Platero", "Poblacion", "San Antonio", "San Francisco", "San Jose", "San Vicente", "Santo Domingo", "Santo Niño", "Santo Tomas", "Soro-Soro", "Timbao", "Tubigan", "Zapote"].map(opt => (
                      <div className="checkbox-item" key={opt}>
                        <input type="checkbox" id={`b-${opt}`} value={opt} checked={filters.place.includes(opt)} onChange={() => handleFilterToggle('place', opt)} />
                        <label htmlFor={`b-${opt}`}>{opt}</label>
                      </div>
                  ))}
                </div>
              </div>

              <div className={`filter-category ${openCategories['disabilities'] ? 'active' : ''}`}>
                <div className="category-header" onClick={() => toggleAccordion('disabilities')}>
                  <span className="disability-header">Disability/Special Needs</span>
                  <span className="category-indicator">▼</span>
                </div>
                <div className="category-checklist" id="disabilityChecklist">
                  {["None", "Physical", "Intellectual", "Learning", "Visual", "Mental", "Psychosocial", "Deaf/Hard of Hearing", "Speech and Language Impairment", "Cancer", "Rare Diseases"].map(opt => (
                      <div className="checkbox-item" key={opt}>
                        <input type="checkbox" id={`dis-${opt}`} value={opt} checked={filters.disabilities.includes(opt)} onChange={() => handleFilterToggle('disabilities', opt)} />
                        <label htmlFor={`dis-${opt}`}>{opt}</label>
                      </div>
                  ))}
                </div>
              </div>

              <div className={`filter-category ${openCategories['illness'] ? 'active' : ''}`}>
                <div className="category-header" onClick={() => toggleAccordion('illness')}>
                  <span className="illness-header">Critical Illness</span>
                  <span className="category-indicator">▼</span>
                </div>
                <div className="category-checklist" id="illnessChecklist">
                  {["None", "Cancer", "Cardio-vascular Disease", "Paralysis", "Organ Failure", "Others"].map(opt => (
                      <div className="checkbox-item" key={opt}>
                        <input type="checkbox" id={`ill-${opt}`} value={opt} checked={filters.illness.includes(opt)} onChange={() => handleFilterToggle('illness', opt)} />
                        <label htmlFor={`ill-${opt}`}>{opt}</label>
                      </div>
                  ))}
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