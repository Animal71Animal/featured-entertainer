// Vercel serverless function — returns available weekends (not yet taken)
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'taken-weekends.json');

// All possible weekends
const ALL_WEEKENDS = [
  { value: '2026-07-10', label: 'July 10 & 11, 2026 (Fri–Sat)' },
  { value: '2026-07-24', label: 'July 24 & 25, 2026 (Fri–Sat)' },
  { value: '2026-08-07', label: 'August 7 & 8, 2026 (Fri–Sat)' },
  { value: '2026-08-21', label: 'August 21 & 22, 2026 (Fri–Sat)' },
  { value: '2026-09-04', label: 'September 4 & 5, 2026 (Fri–Sat)' },
  { value: '2026-09-18', label: 'September 18 & 19, 2026 (Fri–Sat)' },
];

function getTakenWeekends() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
      fs.writeFileSync(DATA_FILE, JSON.stringify([]));
      return [];
    }
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET - return available weekends
  if (req.method === 'GET') {
    const taken = getTakenWeekends();
    const takenValues = taken.map(t => t.weekend);
    const available = ALL_WEEKENDS.filter(w => !takenValues.includes(w.value));
    return res.status(200).json({ available, taken });
  }

  // POST - mark a weekend as taken
  if (req.method === 'POST') {
    const { weekend, stageName } = req.body;
    if (!weekend) {
      return res.status(400).json({ error: 'Missing weekend' });
    }

    const taken = getTakenWeekends();
    
    // Check if already taken
    if (taken.some(t => t.weekend === weekend)) {
      return res.status(409).json({ error: 'Weekend already taken' });
    }

    // Add to taken
    const weekendLabel = ALL_WEEKENDS.find(w => w.value === weekend)?.label || weekend;
    taken.push({
      weekend,
      weekendLabel,
      stageName: stageName || 'Unknown',
      takenAt: new Date().toISOString()
    });

    fs.writeFileSync(DATA_FILE, JSON.stringify(taken, null, 2));
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
