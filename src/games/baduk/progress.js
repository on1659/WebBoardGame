// Baduk learning progress — PostgreSQL backed via API

import { fetchProgress, saveProgress as apiSave } from '../../profile/api';

let _cache = null;

function ensureCache() {
  if (!_cache) _cache = { userId: null, tutorials: [], puzzles: [] };
  return _cache;
}

export async function loadBadukProgress(userId) {
  try {
    const rows = await fetchProgress(userId);
    _cache = {
      userId,
      tutorials: rows.filter(r => r.stage_type === 'baduk_tutorial').map(r => parseInt(r.stage_id)),
      puzzles: rows.filter(r => r.stage_type === 'baduk_puzzle').map(r => parseInt(r.stage_id)),
    };
  } catch {
    _cache = { userId, tutorials: [], puzzles: [] };
  }
  return _cache;
}

export function clearBadukProgressCache() {
  _cache = null;
}

export async function completeBadukTutorial(lessonId) {
  const c = ensureCache();
  if (!c.tutorials.includes(lessonId)) {
    c.tutorials.push(lessonId);
  }
  if (c.userId) {
    try { await apiSave(c.userId, 'baduk_tutorial', String(lessonId), 1); } catch {}
  }
}

export async function completeBadukPuzzle(puzzleId) {
  const c = ensureCache();
  if (!c.puzzles.includes(puzzleId)) {
    c.puzzles.push(puzzleId);
  }
  if (c.userId) {
    try { await apiSave(c.userId, 'baduk_puzzle', String(puzzleId), 1); } catch {}
  }
}

export function getCompletedBadukTutorials() {
  return ensureCache().tutorials;
}

export function getCompletedBadukPuzzles() {
  return ensureCache().puzzles;
}
