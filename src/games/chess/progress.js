// Chess learning progress - localStorage backed

const STORAGE_KEY = 'chess-learning-progress';

function getProgress() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : { tutorials: [], puzzles: [] };
  } catch {
    return { tutorials: [], puzzles: [] };
  }
}

function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function completeTutorial(lessonId) {
  const progress = getProgress();
  if (!progress.tutorials.includes(lessonId)) {
    progress.tutorials.push(lessonId);
    saveProgress(progress);
  }
}

export function completePuzzle(puzzleId) {
  const progress = getProgress();
  if (!progress.puzzles.includes(puzzleId)) {
    progress.puzzles.push(puzzleId);
    saveProgress(progress);
  }
}

export function getCompletedTutorials() {
  return getProgress().tutorials;
}

export function getCompletedPuzzles() {
  return getProgress().puzzles;
}

export function getTotalProgress() {
  const progress = getProgress();
  return {
    tutorialsCompleted: progress.tutorials.length,
    tutorialsTotal: 6,
    puzzlesCompleted: progress.puzzles.length,
    puzzlesTotal: 10,
  };
}
