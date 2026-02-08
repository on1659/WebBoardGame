import { useState, useEffect, useRef, useCallback } from 'react';
import { useUser } from '../../profile/UserContext';
import { submitScore } from '../../profile/api';
import styles from './SudokuGame.module.css';

// 4x4 sudoku puzzles: [solution, puzzle (0=empty)]
const PUZZLES = {
  easy: [
    { sol: [1,2,3,4,3,4,1,2,2,1,4,3,4,3,2,1], puzzle: [1,0,3,4,3,4,0,2,2,1,4,0,0,3,2,1] },
    { sol: [2,1,4,3,4,3,2,1,1,2,3,4,3,4,1,2], puzzle: [2,0,4,3,0,3,2,1,1,2,0,4,3,4,1,0] },
    { sol: [3,4,1,2,1,2,3,4,4,3,2,1,2,1,4,3], puzzle: [3,4,0,2,1,0,3,4,4,3,2,0,0,1,4,3] },
    { sol: [4,3,2,1,2,1,4,3,3,4,1,2,1,2,3,4], puzzle: [4,0,2,1,2,1,0,3,0,4,1,2,1,2,3,0] },
    { sol: [1,3,4,2,4,2,1,3,2,4,3,1,3,1,2,4], puzzle: [1,3,0,2,4,0,1,3,0,4,3,1,3,1,0,4] },
  ],
  medium: [
    { sol: [1,2,3,4,3,4,1,2,2,1,4,3,4,3,2,1], puzzle: [0,0,3,4,3,0,0,2,2,0,0,3,4,3,0,0] },
    { sol: [2,1,4,3,4,3,2,1,1,2,3,4,3,4,1,2], puzzle: [0,1,0,3,4,0,2,0,0,2,3,0,3,0,0,2] },
    { sol: [3,4,1,2,1,2,3,4,4,3,2,1,2,1,4,3], puzzle: [0,4,0,2,1,0,3,0,0,3,0,1,2,0,4,0] },
    { sol: [4,3,2,1,2,1,4,3,3,4,1,2,1,2,3,4], puzzle: [0,3,0,1,2,0,4,0,0,4,0,2,1,0,3,0] },
    { sol: [1,3,4,2,4,2,1,3,2,4,3,1,3,1,2,4], puzzle: [0,0,4,0,4,0,0,3,0,4,0,0,3,0,0,4] },
  ],
};

export default function SudokuGame({ onBack }) {
  const { user } = useUser();
  const [difficulty, setDifficulty] = useState(null);
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const [grid, setGrid] = useState([]);
  const [fixed, setFixed] = useState([]);
  const [selected, setSelected] = useState(null);
  const [time, setTime] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [conflicts, setConflicts] = useState(new Set());
  const timerRef = useRef(null);
  const solRef = useRef([]);

  const startGame = useCallback((diff, idx = 0) => {
    const p = PUZZLES[diff][idx];
    solRef.current = p.sol;
    setGrid([...p.puzzle]);
    setFixed(p.puzzle.map(v => v !== 0));
    setSelected(null);
    setTime(0);
    setGameOver(false);
    setConflicts(new Set());
    setDifficulty(diff);
    setPuzzleIdx(idx);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setTime(t => t + 1), 1000);
  }, []);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const findConflicts = useCallback((g) => {
    const c = new Set();
    for (let i = 0; i < 16; i++) {
      if (!g[i]) continue;
      const row = Math.floor(i / 4), col = i % 4;
      const boxR = Math.floor(row / 2) * 2, boxC = Math.floor(col / 2) * 2;
      for (let j = 0; j < 16; j++) {
        if (j === i || !g[j]) continue;
        const r2 = Math.floor(j / 4), c2 = j % 4;
        const bR2 = Math.floor(r2 / 2) * 2, bC2 = Math.floor(c2 / 2) * 2;
        if (g[i] === g[j] && (r2 === row || c2 === col || (bR2 === boxR && bC2 === boxC))) {
          c.add(i); c.add(j);
        }
      }
    }
    return c;
  }, []);

  const placeNumber = useCallback((num) => {
    if (selected === null || fixed[selected] || gameOver) return;
    const newGrid = [...grid];
    newGrid[selected] = num;
    setGrid(newGrid);
    setConflicts(findConflicts(newGrid));
    if (newGrid.every((v, i) => v === solRef.current[i])) {
      clearInterval(timerRef.current);
      setGameOver(true);
      if (user) submitScore(user.id, 'sudoku', time, 'time').catch(() => {});
    }
  }, [selected, fixed, grid, gameOver, findConflicts, time, user]);

  const giveHint = useCallback(() => {
    const empties = grid.map((v, i) => (!v && !fixed[i]) ? i : -1).filter(i => i >= 0);
    if (!empties.length) return;
    const idx = empties[Math.floor(Math.random() * empties.length)];
    const newGrid = [...grid];
    newGrid[idx] = solRef.current[idx];
    setGrid(newGrid);
    setConflicts(findConflicts(newGrid));
    if (newGrid.every((v, i) => v === solRef.current[i])) {
      clearInterval(timerRef.current);
      setGameOver(true);
    }
  }, [grid, fixed, findConflicts]);

  const formatTime = (s) => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;

  if (!difficulty) {
    return (
      <div className={styles.container}>
        <button className={styles.backBtn} onClick={onBack}>← 뒤로</button>
        <h1 className={styles.title}>🧩 미니 스도쿠</h1>
        <p className={styles.subtitle}>4×4 스도쿠! 난이도를 골라줘!</p>
        <div className={styles.diffGrid}>
          <button className={styles.diffBtn} onClick={() => startGame('easy')}>쉬움 (힌트 많음)</button>
          <button className={styles.diffBtn} onClick={() => startGame('medium')}>보통 (힌트 적음)</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={onBack}>← 뒤로</button>
        <span className={styles.stat}>⏱️ {formatTime(time)}</span>
        <span className={styles.stat}>#{puzzleIdx + 1}</span>
      </div>
      <h2 className={styles.title}>🧩 미니 스도쿠</h2>

      {gameOver && (
        <div className={styles.modal}>
          <h2>🎉 완성! 🎉</h2>
          <p>⏱️ {formatTime(time)}만에 풀었어!</p>
          <div className={styles.modalBtns}>
            <button onClick={() => startGame(difficulty, (puzzleIdx + 1) % PUZZLES[difficulty].length)}>다음 문제</button>
            <button onClick={onBack}>🏠 홈으로</button>
          </div>
        </div>
      )}

      <div className={styles.board}>
        {grid.map((val, idx) => {
          const row = Math.floor(idx / 4), col = idx % 4;
          return (
            <button
              key={idx}
              className={`${styles.cell} ${fixed[idx] ? styles.fixed : ''} ${selected === idx ? styles.selected : ''} ${conflicts.has(idx) ? styles.conflict : ''}`}
              style={{
                borderRight: col === 1 ? '3px solid #333' : undefined,
                borderBottom: row === 1 ? '3px solid #333' : undefined,
              }}
              onClick={() => !fixed[idx] && !gameOver && setSelected(idx)}
            >
              {val || ''}
            </button>
          );
        })}
      </div>

      <div className={styles.numRow}>
        {[1,2,3,4].map(n => (
          <button key={n} className={styles.numBtn} onClick={() => placeNumber(n)}>{n}</button>
        ))}
        <button className={styles.numBtn} onClick={() => placeNumber(0)}>✕</button>
      </div>
      <button className={styles.hintBtn} onClick={giveHint}>💡 힌트</button>
      <button className={styles.restartBtn} onClick={() => startGame(difficulty, puzzleIdx)}>🔄 다시하기</button>
    </div>
  );
}
