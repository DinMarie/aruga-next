'use client';

import { useState } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where } from "firebase/firestore";
import { db } from '../lib/firebase'; // adjust path as needed

// ── Randomization pools ────────────────────────────────────────────────────────

const FIRST_NAMES = [
  "Maria", "Jose", "Juan", "Ana", "Pedro", "Rosa", "Carlos", "Luz",
  "Miguel", "Elena", "Ramon", "Gloria", "Antonio", "Nora", "Eduardo",
  "Liza", "Roberto", "Celia", "Fernando", "Marita", "Reynaldo", "Cristina",
  "Danilo", "Rowena", "Alfredo", "Teresita", "Ernesto", "Mylene", "Renato", "Josie"
];

const LAST_NAMES = [
  "Santos", "Reyes", "Cruz", "Garcia", "Mendoza", "Torres", "Flores",
  "Ramos", "Dela Cruz", "Lopez", "Gonzales", "Aquino", "Bautista",
  "Villanueva", "Castillo", "Morales", "Hernandez", "Diaz", "Perez", "Aguilar"
];

const BARANGAYS = [
  "Biñan", "Bungahan", "Canlalay", "Casile", "De La Paz", "Ganado",
  "Langkiwa", "Loma", "Malaban", "Malamig", "Mamplasan", "Platero",
  "Poblacion", "San Antonio", "San Francisco", "San Jose", "San Vicente",
  "Santo Domingo", "Santo Niño", "Santo Tomas", "Soro-soro", "Timbao",
  "Tubigan", "Zapote"
];

const RELIGIONS = [
  "Roman Catholic", "Iglesia ni Cristo", "Aglipay", "Islam",
  "Bible Baptist Church", "Seventh Day Adventist", "Jehovah's Witness",
  "United Methodists Church", "None"
];

const IP_OPTIONS = [
  "Non-IP", "Aeta", "Ati", "Badjao", "Dumagat",
  "Ibaloi", "Mangyan", "Manobo", "Subanen"
];

const DISABILITIES = [
  "None", "Physical", "Intellectual", "Learning",
  "Visual", "Mental", "Psychosocial", "Deaf/Hard of Hearing",
  "Speech and Language Impairment", "Rare Disease"
];

const ILLNESSES = [
  "None", "None", "None", // weighted so most have None
  "Cancer", "Cardio-vascular Disease", "Paralysis", "Organ Failure"
];

const STREET_TYPES = ["Blk", "Lot", "Ph", "St.", "Ave.", "Road", "Purok"];

// ── Helpers ────────────────────────────────────────────────────────────────────

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const randomDate = (startYear: number, endYear: number): string => {
  const y = startYear + Math.floor(Math.random() * (endYear - startYear));
  const m = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  const d = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const randomContact = (): string =>
  "09" + String(Math.floor(Math.random() * 1_000_000_000)).padStart(9, '0');

const randomAddress = (): string => {
  const blk = Math.floor(Math.random() * 30) + 1;
  const lot = Math.floor(Math.random() * 20) + 1;
  const brgy = pick(BARANGAYS);
  return `Blk ${blk} Lot ${lot} ${pick(STREET_TYPES)} ${pick(BARANGAYS)} St. Brgy. ${brgy} Biñan City`;
};

const generateProfile = () => ({
  name: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
  birthday: randomDate(1950, 2015),
  sex: pick(["Male", "Female"]),
  contact: randomContact(),
  address: randomAddress(),
  religion: pick(RELIGIONS),
  ip: pick(IP_OPTIONS),
  disability: pick(DISABILITIES),
  illness: pick(ILLNESSES),
  _isTestData: true, // ← flag used for bulk delete
});

// ── Component ──────────────────────────────────────────────────────────────────

export default function TestDataUtil() {
  const [count, setCount] = useState(20);
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleAdd = async () => {
    setIsLoading(true);
    setStatus(`Adding ${count} test profiles...`);
    try {
      const promises = Array.from({ length: count }, () =>
        addDoc(collection(db, "profiles"), generateProfile())
      );
      await Promise.all(promises);
      setStatus(`✅ Successfully added ${count} test profiles.`);
    } catch (err) {
      setStatus(`❌ Error adding profiles: ${err}`);
    }
    setIsLoading(false);
  };

  const handleDelete = async () => {
    setIsLoading(true);
    setStatus("Deleting all test profiles...");
    try {
      const q = query(collection(db, "profiles"), where("_isTestData", "==", true));
      const snapshot = await getDocs(q);
      const deletes = snapshot.docs.map(d => deleteDoc(doc(db, "profiles", d.id)));
      await Promise.all(deletes);
      setStatus(`✅ Deleted ${snapshot.docs.length} test profiles.`);
    } catch (err) {
      setStatus(`❌ Error deleting: ${err}`);
    }
    setIsLoading(false);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(o => !o)}
        style={{
          position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999,
          background: '#ff6f00', color: 'white', border: 'none',
          borderRadius: '50px', padding: '12px 20px', fontWeight: 'bold',
          fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          display: 'flex', alignItems: 'center', gap: '8px'
        }}
      >
        🧪 {isOpen ? 'Close Dev Tool' : 'Test Data'}
      </button>

      {/* Panel */}
      {isOpen && (
        <div style={{
          position: 'fixed', bottom: '75px', right: '20px', zIndex: 9998,
          background: 'white', border: '2px solid #ff6f00', borderRadius: '12px',
          padding: '20px', width: '300px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          fontFamily: 'Segoe UI, Arial, sans-serif'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <h3 style={{ margin: 0, color: '#ff6f00', fontSize: '1rem' }}>🧪 Test Data Utility</h3>
            <span style={{ fontSize: '0.7rem', background: '#fff3e0', color: '#e65100', padding: '2px 8px', borderRadius: '20px', fontWeight: 'bold' }}>DEV ONLY</span>
          </div>

          <p style={{ fontSize: '0.78rem', color: '#888', marginBottom: '16px', marginTop: '4px' }}>
            Adds randomized profiles with <code style={{background:'#f5f5f5', padding:'1px 4px', borderRadius:'3px'}}>_isTestData: true</code> flag for easy cleanup.
          </p>

          {/* Count Selector */}
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#333', display: 'block', marginBottom: '6px' }}>
            Number of profiles to add
          </label>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
            {[10, 20, 50, 100].map(n => (
              <button
                key={n}
                onClick={() => setCount(n)}
                style={{
                  padding: '6px 14px', border: `2px solid ${count === n ? '#ff6f00' : '#ddd'}`,
                  borderRadius: '20px', background: count === n ? '#ff6f00' : 'white',
                  color: count === n ? 'white' : '#333', fontWeight: 'bold',
                  cursor: 'pointer', fontSize: '0.85rem'
                }}
              >
                {n}
              </button>
            ))}
            <input
              type="number"
              min={1} max={500}
              value={count}
              onChange={e => setCount(Math.min(500, Math.max(1, Number(e.target.value))))}
              style={{
                width: '65px', padding: '6px 10px', border: '2px solid #ddd',
                borderRadius: '20px', fontSize: '0.85rem', outline: 'none', textAlign: 'center'
              }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
            <button
              onClick={handleAdd}
              disabled={isLoading}
              style={{
                flex: 1, padding: '10px', background: isLoading ? '#ccc' : '#512da8',
                color: 'white', border: 'none', borderRadius: '8px',
                fontWeight: 'bold', cursor: isLoading ? 'not-allowed' : 'pointer', fontSize: '0.85rem'
              }}
            >
              ➕ Add {count}
            </button>
            <button
              onClick={handleDelete}
              disabled={isLoading}
              style={{
                flex: 1, padding: '10px', background: isLoading ? '#ccc' : '#d32f2f',
                color: 'white', border: 'none', borderRadius: '8px',
                fontWeight: 'bold', cursor: isLoading ? 'not-allowed' : 'pointer', fontSize: '0.85rem'
              }}
            >
              🗑️ Delete All
            </button>
          </div>

          {/* Status */}
          {status && (
            <div style={{
              padding: '10px 12px', borderRadius: '8px', fontSize: '0.82rem',
              background: status.startsWith('✅') ? '#e8f5e9' : status.startsWith('❌') ? '#ffebee' : '#e3f2fd',
              color: status.startsWith('✅') ? '#2e7d32' : status.startsWith('❌') ? '#c62828' : '#1565c0',
              fontWeight: 500
            }}>
              {status}
            </div>
          )}

          <p style={{ fontSize: '0.72rem', color: '#aaa', marginTop: '12px', marginBottom: 0, textAlign: 'center' }}>
            ⚠️ Remove this component before deploying to production
          </p>
        </div>
      )}
    </>
  );
}