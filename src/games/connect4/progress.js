// Connect4 puzzle progress — PostgreSQL backed via API

import { fetchProgress, saveProgress as apiSave } from '../../profile/api';

let _cache = null;

function ensureCache() {
  if (!_cache) _cache = { userId: null, puzzles: [] };
  return _cache;
}

export async function loadConnect4Progress(userId) {
  try {
    const rows = await fetchProgress(userId);
    _cache = {
      userId,
      puzzles: rows.filter(r => r.stage_type === 'connect4_puzzle').map(r => parseInt(r.stage_id)),
    };
  } catch {
    _cache = { userId, puzzles: [] };
  }
  return _cache;
}

export function clearConnect4ProgressCache() {
  _cache = null;
}

export async function completeConnect4Puzzle(puzzleId) {
  const c = ensureCache();
  if (!c.puzzles.includes(puzzleId)) {
    c.puzzles.push(puzzleId);
  }
  if (c.userId) {
    try { await apiSave(c.userId, 'connect4_puzzle', String(puzzleId), 1); } catch {}
  }
}

export function getCompletedConnect4Puzzles() {
  return ensureCache().puzzles;
}
