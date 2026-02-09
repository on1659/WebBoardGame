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
    CREATE TABLE IF NOT EXISTS game_saves (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      game_type TEXT NOT NULL,
      game_state JSONB NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, game_type)
    );
    CREATE TABLE IF NOT EXISTS leaderboard (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      game_type TEXT NOT NULL,
      score NUMERIC NOT NULL,
      metric_type TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS game_plays (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      game_type TEXT NOT NULL,
      result TEXT,
      duration_seconds INT,
      played_at TIMESTAMPTZ DEFAULT NOW()
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

// Check if name exists
app.get('/api/users/check/:name', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id FROM users WHERE LOWER(name)=LOWER($1)', [req.params.name.trim()]);
    res.json({ exists: rows.length > 0 });
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

// Save game state (only 1 save per user across all games)
app.post('/api/game-save', async (req, res) => {
  const { user_id, game_type, game_state } = req.body;
  if (!user_id || !game_type || !game_state) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  try {
    // Delete any other game saves for this user (only 1 save allowed)
    await pool.query(
      'DELETE FROM game_saves WHERE user_id=$1 AND game_type!=$2',
      [user_id, game_type]
    );
    const { rows } = await pool.query(
      `INSERT INTO game_saves (user_id, game_type, game_state)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, game_type)
       DO UPDATE SET game_state = $3, updated_at = NOW()
       RETURNING *`,
      [user_id, game_type, JSON.stringify(game_state)]
    );
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get user's current save (any game)
app.get('/api/game-save/:userId', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT game_type, updated_at FROM game_saves WHERE user_id=$1 LIMIT 1',
      [req.params.userId]
    );
    if (rows.length === 0) return res.json(null);
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Load game state
app.get('/api/game-save/:userId/:gameType', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT game_state, updated_at FROM game_saves WHERE user_id=$1 AND game_type=$2',
      [req.params.userId, req.params.gameType]
    );
    if (rows.length === 0) return res.json(null);
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Delete game save (when game completes)
app.delete('/api/game-save/:userId/:gameType', async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM game_saves WHERE user_id=$1 AND game_type=$2',
      [req.params.userId, req.params.gameType]
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- Game Plays (Statistics) ---
app.post('/api/plays', async (req, res) => {
  const { user_id, game_type, result, duration_seconds } = req.body;
  if (!game_type) return res.status(400).json({ error: 'game_type required' });
  try {
    const { rows } = await pool.query(
      'INSERT INTO game_plays (user_id, game_type, result, duration_seconds) VALUES ($1,$2,$3,$4) RETURNING *',
      [user_id || null, game_type, result || null, duration_seconds || null]
    );
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const total = await pool.query('SELECT COUNT(*)::int as total FROM game_plays');
    const perGame = await pool.query('SELECT game_type, COUNT(*)::int as count FROM game_plays GROUP BY game_type ORDER BY count DESC');
    const users = await pool.query('SELECT COUNT(DISTINCT user_id)::int as total FROM game_plays WHERE user_id IS NOT NULL');
    const popular = perGame.rows[0] || null;
    res.json({
      totalPlays: total.rows[0].total,
      totalUsers: users.rows[0].total,
      mostPopular: popular?.game_type || null,
      perGame: perGame.rows,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/stats/games', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT game_type,
        COUNT(*)::int as play_count,
        ROUND(100.0 * COUNT(*) FILTER (WHERE result='win') / NULLIF(COUNT(*),0), 1) as win_rate,
        ROUND(AVG(duration_seconds)) as avg_duration
      FROM game_plays GROUP BY game_type ORDER BY play_count DESC
    `);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/stats/user/:userId', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT game_type,
        COUNT(*)::int as play_count,
        COUNT(*) FILTER (WHERE result='win')::int as wins,
        COUNT(*) FILTER (WHERE result='lose')::int as losses,
        COUNT(*) FILTER (WHERE result='draw')::int as draws,
        ROUND(AVG(duration_seconds)) as avg_duration
      FROM game_plays WHERE user_id=$1 GROUP BY game_type ORDER BY play_count DESC
    `, [req.params.userId]);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- Leaderboard ---
app.post('/api/leaderboard', async (req, res) => {
  const { user_id, game_type, score, metric_type } = req.body;
  if (!user_id || !game_type || score == null || !metric_type) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  try {
    // For 'moves' and 'time', keep best (lowest). For 'wins' and 'score', keep best (highest).
    const lowerBetter = ['moves', 'time'].includes(metric_type);
    const existing = await pool.query(
      'SELECT id, score FROM leaderboard WHERE user_id=$1 AND game_type=$2',
      [user_id, game_type]
    );
    if (existing.rows.length > 0) {
      const old = Number(existing.rows[0].score);
      const shouldUpdate = lowerBetter ? score < old : score > old;
      if (shouldUpdate) {
        const { rows } = await pool.query(
          'UPDATE leaderboard SET score=$1, created_at=NOW() WHERE id=$2 RETURNING *',
          [score, existing.rows[0].id]
        );
        return res.json(rows[0]);
      }
      return res.json(existing.rows[0]);
    }
    const { rows } = await pool.query(
      'INSERT INTO leaderboard (user_id, game_type, score, metric_type) VALUES ($1,$2,$3,$4) RETURNING *',
      [user_id, game_type, score, metric_type]
    );
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/leaderboard/:gameType', async (req, res) => {
  try {
    const gt = req.params.gameType;
    // Determine sort order from first entry or default
    const sample = await pool.query('SELECT metric_type FROM leaderboard WHERE game_type=$1 LIMIT 1', [gt]);
    const metric = sample.rows[0]?.metric_type || 'time';
    const order = ['moves','time'].includes(metric) ? 'ASC' : 'DESC';
    const { rows } = await pool.query(
      `SELECT l.id, l.user_id, u.name as user_name, l.score, l.metric_type, l.created_at
       FROM leaderboard l JOIN users u ON l.user_id = u.id
       WHERE l.game_type=$1 ORDER BY l.score ${order} LIMIT 10`,
      [gt]
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/leaderboard/user/:userId', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT l.game_type, l.score, l.metric_type, l.created_at
       FROM leaderboard l WHERE l.user_id=$1 ORDER BY l.game_type`,
      [req.params.userId]
    );
    res.json(rows);
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
