===========================
//   KCR HEALTH TRACKER — NODE.JS BACKEND
//   Armaan ka kaam yahan hai!
// ===========================

const express = require('express');
const mysql = require('mysql2');
const app = express();

// ===== MIDDLEWARE =====

// JSON data parse karo
app.use(express.json());

// CORS — Frontend ko allow karo connect hone ke liye
// Bina CORS ke browser block kar dega!
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  next();
});

// ===== MYSQL CONNECTION =====
// Punam ka kaam — database connect karo
const db = mysql.createConnection({
  host:     'localhost',
  user:     'root',        // apna MySQL username
  password: '',            // apna MySQL password
  database: 'kcr_health'  // database naam
});

db.connect((err) => {
  if (err) {
    console.log('Database connect nahi hua:', err.message);
    console.log('App bina database ke chalega...');
  } else {
    console.log('MySQL connected!');
  }
});

// ===== API ROUTES =====

// Route 1 — Test karo server chal raha hai
// Browser mein kholo: http://localhost:3000/
app.get('/', (req, res) => {
  res.json({ message: '⚔️ KCR Health API chal raha hai!' });
});

// Route 2 — Health data save karo
// Frontend yahan POST request bhejega
app.post('/api/health', (req, res) => {

  // Step 1 — Frontend ka data lo
  const { name, age, weight, height, water, sleep, steps, mood } = req.body;

  // Step 2 — Validation
  if (!name || !age || !weight || !height) {
    return res.status(400).json({ error: 'Required fields missing!' });
  }

  // Step 3 — BMI Calculate karo
  const heightM = height / 100;
  const bmi = (weight / (heightM * heightM)).toFixed(1);

  let bmiStatus = '';
  if (bmi < 18.5)      bmiStatus = 'Underweight';
  else if (bmi < 25)   bmiStatus = 'Normal — bilkul sahi!';
  else if (bmi < 30)   bmiStatus = 'Overweight';
  else                 bmiStatus = 'Obese';

  // Step 4 — Health status calculate karo
  const result = {
    name,
    bmi,
    bmiStatus,
    waterStatus: water >= 2 ? 'Goal complete!' : ${(2 - water).toFixed(1)}L aur peena hai,
    sleepStatus: sleep >= 7 ? 'Bahut achha!' : 'Thodi aur neend lo',
    stepsStatus: steps >= 8000 ? 'Fantastic!' : ${8000 - steps} steps aur chalo,
    mood,
    tip: getTip(mood),
  };

  // Step 5 — Database mein save karo (Punam ka kaam)
  const sql = `INSERT INTO health_logs
    (name, age, weight, height, bmi, water, sleep, steps, mood)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(sql, [name, age, weight, height, bmi, water, sleep, steps, mood], (err) => {
    if (err) {
      console.log('DB save nahi hua:', err.message);
      // DB error hone pe bhi result bhejo
    } else {
      console.log('Data saved in database!');
    }
  });

  // Step 6 — Frontend ko result bhejo
  res.json(result);
});

// Route 3 — Saara data lo (dashboard ke liye)
app.get('/api/health', (req, res) => {
  db.query('SELECT * FROM health_logs ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// ===== HELPER FUNCTION =====
function getTip(mood) {
  const tips = {
    great:   'Zabardast! Aaj ka din productive hoga!',
    good:    'Achha feel ho raha hai — keep it up!',
    okay:    'Thodi walk karo — energy aayegi!',
    tired:   'Aaj jaldi so jao — kal fresh feel hoga!',
    stressed:'5 min deep breathing karo — stress kam hoga!',
  };
  return tips[mood] || 'Apna khayal rakho!';
}

// ===== SERVER START =====
app.listen(3000, () => {
  console.log('');
  console.log('⚔️  KCR Health Server chal raha hai!');
  console.log('🌐  http://localhost:3000');
  console.log('');
});