import express from 'express';
import pg from 'pg';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());

// PostgreSQL
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('railway') ? { rejectUnauthorized: false } : false,
});

// Auto-create tables
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      pin_code TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS progress (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      stage_type TEXT NOT NULL,
      stage_id TEXT NOT NULL,
      completed BOOLEAN DEFAULT true,
      stars INT DEFAULT 1,
      completed_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, stage_type, stage_id)
    );
  `);
  console.log('✅ DB tables ready');
}

// --- API Routes ---

// Create profile
app.post('/api/users', async (req, res) => {
  const { name, pin } = req.body;
  if (!name?.trim() || !pin || !/^\d{4}$/.test(pin)) {
    return res.status(400).json({ error: '이름과 4자리 숫자 암호가 필요해요' });
  }
  try {
    // Check if name already exists
    const existing = await pool.query('SELECT id FROM users WHERE LOWER(name)=LOWER($1)', [name.trim()]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: '이미 있는 이름이야! 다른 이름을 써줘 😊' });
    }
    const { rows } = await pool.query(
      'INSERT INTO users (name, pin_code) VALUES ($1, $2) RETURNING id, name, created_at',
      [name.trim(), pin]
    );
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Login by name + pin
app.post('/api/users/login', async (req, res) => {
  const { name, pin } = req.body;
  if (!name?.trim() || !pin) {
    return res.status(400).json({ error: '이름과 암호를 입력해줘' });
  }
  try {
    const { rows } = await pool.query(
      'SELECT id, name, created_at FROM users WHERE LOWER(name)=LOWER($1) AND pin_code=$2',
      [name.trim(), pin]
    );
    if (rows.length === 0) return res.status(401).json({ error: '이름이나 암호가 틀렸어요 😢' });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get progress
app.get('/api/progress/:userId', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT stage_type, stage_id, stars, completed_at FROM progress WHERE user_id=$1',
      [req.params.userId]
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Save progress
app.post('/api/progress', async (req, res) => {
  const { user_id, stage_type, stage_id, stars = 1 } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO progress (user_id, stage_type, stage_id, stars)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, stage_type, stage_id)
       DO UPDATE SET stars = GREATEST(progress.stars, $4), completed_at = NOW()
       RETURNING *`,
      [user_id, stage_type, stage_id, stars]
    );
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Serve static files in production
const distPath = join(__dirname, '..', 'dist');
app.use(express.static(distPath));
app.get('*', (req, res) => {
  res.sendFile(join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 3001;

initDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}).catch(err => {
  console.error('DB init failed:', err);
  process.exit(1);
});
