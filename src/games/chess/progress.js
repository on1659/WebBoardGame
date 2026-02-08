// Chess learning progress — PostgreSQL backed via API
// Uses a simple in-memory cache per session, synced with server

import { fetchProgress, saveProgress as apiSave } from '../../profile/api';

let _cache = null; // { userId, tutorials: [], puzzles: [] }

function ensureCache() {
  if (!_cache) _cache = { userId: null, tutorials: [], puzzles: [] };
  return _cache;
}

// Call this when user logs in to load their progress
export async function loadProgress(userId) {
  try {
    const rows = await fetchProgress(userId);
    _cache = {
      userId,
      tutorials: rows.filter(r => r.stage_type === 'tutorial').map(r => parseInt(r.stage_id)),
      puzzles: rows.filter(r => r.stage_type === 'puzzle').map(r => parseInt(r.stage_id)),
    };
  } catch {
    _cache = { userId, tutorials: [], puzzles: [] };
  }
  return _cache;
}

export function clearProgressCache() {
  _cache = null;
}

export async function completeTutorial(lessonId) {
  const c = ensureCache();
  if (!c.tutorials.includes(lessonId)) {
    c.tutorials.push(lessonId);
  }
  if (c.userId) {
    try { await apiSave(c.userId, 'tutorial', String(lessonId), 1); } catch {}
  }
}

export async function completePuzzle(puzzleId) {
  const c = ensureCache();
  if (!c.puzzles.includes(puzzleId)) {
    c.puzzles.push(puzzleId);
  }
  if (c.userId) {
    try { await apiSave(c.userId, 'puzzle', String(puzzleId), 1); } catch {}
  }
}

export function getCompletedTutorials() {
  return ensureCache().tutorials;
}

export function getCompletedPuzzles() {
  return ensureCache().puzzles;
}

export function getTotalProgress() {
  const c = ensureCache();
  return {
    tutorialsCompleted: c.tutorials.length,
    tutorialsTotal: 6,
    puzzlesCompleted: c.puzzles.length,
    puzzlesTotal: 10,
  };
}
