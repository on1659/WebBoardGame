// Chess learning progress — API backed with localStorage cache
import { fetchProgress, saveProgress as apiSaveProgress } from '../../profile/api';

let currentUserId = null;
let cachedProgress = { tutorials: [], puzzles: [] };

export function setProgressUser(userId) {
  currentUserId = userId;
}

export async function loadProgressFromServer(userId) {
  currentUserId = userId;
  try {
    const rows = await fetchProgress(userId);
    cachedProgress = { tutorials: [], puzzles: [] };
    for (const r of rows) {
      if (r.stage_type === 'tutorial') cachedProgress.tutorials.push(r.stage_id);
      else if (r.stage_type === 'puzzle') cachedProgress.puzzles.push(r.stage_id);
    }
  } catch {
    cachedProgress = { tutorials: [], puzzles: [] };
  }
  return cachedProgress;
}

export function completeTutorial(lessonId) {
  if (!cachedProgress.tutorials.includes(lessonId)) {
    cachedProgress.tutorials.push(lessonId);
  }
  if (currentUserId) {
    apiSaveProgress(currentUserId, 'tutorial', lessonId, 1).catch(() => {});
  }
}

export function completePuzzle(puzzleId) {
  if (!cachedProgress.puzzles.includes(puzzleId)) {
    cachedProgress.puzzles.push(puzzleId);
  }
  if (currentUserId) {
    apiSaveProgress(currentUserId, 'puzzle', puzzleId, 1).catch(() => {});
  }
}

export function getCompletedTutorials() {
  return cachedProgress.tutorials;
}

export function getCompletedPuzzles() {
  return cachedProgress.puzzles;
}

export function getTotalProgress() {
  return {
    tutorialsCompleted: cachedProgress.tutorials.length,
    tutorialsTotal: 6,
    puzzlesCompleted: cachedProgress.puzzles.length,
    puzzlesTotal: 10,
  };
}
