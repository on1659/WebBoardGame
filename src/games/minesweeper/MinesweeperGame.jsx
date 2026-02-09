import { useState, useEffect, useRef, useCallback } from 'react';
import { useUser } from '../../profile/UserContext';
import { submitScore } from '../../profile/api';
import { usePlayTracking } from '../../hooks/usePlayTracking';
import styles from './MinesweeperGame.module.css';

const DIFFICULTIES = {
  easy: { size: 5, mines: 3, label: '쉬움 (5×5)' },
  medium: { size: 7, mines: 7, label: '보통 (7×7)' },
  hard: { size: 9, mines: 12, label: '어려움 (9×9)' },
};

const NUM_COLORS = ['','#1976d2','#388e3c','#d32f2f','#7b1fa2','#ff8f00','#0097a7','#333','#777'];

function createBoard(size, mines, safeIdx) {
  const total = size * size;
  const board = Array(total).fill(0);
  // 첫 클릭 + 주변 8칸 모두 안전
  const safeR = Math.floor(safeIdx / size), safeC = safeIdx % size;
  const safeSet = new Set();
  for (let dr = -1; dr <= 1; dr++)
    for (let dc = -1; dc <= 1; dc++) {
      const nr = safeR+dr, nc = safeC+dc;
      if (nr >= 0 && nr < size && nc >= 0 && nc < size) safeSet.add(nr*size+nc);
    }
  const positions = Array.from({length: total}, (_,i) => i).filter(i => !safeSet.has(i));
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }
  positions.slice(0, Math.min(mines, positions.length)).forEach(p => board[p] = -1);
  // Count neighbors
  for (let i = 0; i < total; i++) {
    if (board[i] === -1) continue;
    const r = Math.floor(i / size), c = i % size;
    let count = 0;
    for (let dr = -1; dr <= 1; dr++)
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r+dr, nc = c+dc;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size && board[nr*size+nc] === -1) count++;
      }
    board[i] = count;
  }
  return board;
}

export default function MinesweeperGame({ onBack }) {
  const { user } = useUser();
  const [difficulty, setDifficulty] = useState(null);
  const { startTracking, endTracking } = usePlayTracking(difficulty ? `minesweeper_${difficulty}` : 'minesweeper');
  const [board, setBoard] = useState([]);
  const [revealed, setRevealed] = useState(new Set());
  const [flagged, setFlagged] = useState(new Set());
  const [questioned, setQuestioned] = useState(new Set());
  const [gameState, setGameState] = useState('playing'); // playing|won|lost
  const [time, setTime] = useState(0);
  const [flagMode, setFlagMode] = useState(false);
  const [firstClick, setFirstClick] = useState(true);
  const timerRef = useRef(null);
  const sizeRef = useRef(5);
  const minesRef = useRef(3);

  const startGame = useCallback((diff) => {
    const { size, mines } = DIFFICULTIES[diff];
    sizeRef.current = size;
    minesRef.current = mines;
    setBoard(Array(size*size).fill(0));
    setRevealed(new Set());
    setFlagged(new Set());
    setQuestioned(new Set());
    setGameState('playing');
    setTime(0);
    setFlagMode(false);
    setFirstClick(true);
    setDifficulty(diff);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setTime(t => t + 1), 1000);
    startTracking();
  }, [startTracking]);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const revealCell = useCallback((idx, brd, rev) => {
    const size = sizeRef.current;
    const newRev = new Set(rev);
    const stack = [idx];
    while (stack.length) {
      const i = stack.pop();
      if (newRev.has(i)) continue;
      newRev.add(i);
      if (brd[i] === 0) {
        const r = Math.floor(i / size), c = i % size;
        for (let dr = -1; dr <= 1; dr++)
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r+dr, nc = c+dc;
            if (nr >= 0 && nr < size && nc >= 0 && nc < size) stack.push(nr*size+nc);
          }
      }
    }
    return newRev;
  }, []);

  const handleClick = useCallback((idx) => {
    if (gameState !== 'playing') return;
    const size = sizeRef.current;
    const mines = minesRef.current;

    if (flagMode) {
      if (revealed.has(idx)) return;
      // 순환: 빈칸 → 깃발 → 물음표 → 빈칸
      const nf = new Set(flagged);
      const nq = new Set(questioned);
      if (nf.has(idx)) {
        nf.delete(idx);
        nq.add(idx);
      } else if (nq.has(idx)) {
        nq.delete(idx);
      } else {
        nf.add(idx);
      }
      setFlagged(nf);
      setQuestioned(nq);
      return;
    }

    // 코드(chord): 이미 열린 숫자 칸 클릭 → 주변 깃발 수 = 숫자면 나머지 자동 오픈
    if (revealed.has(idx) && board[idx] > 0) {
      const r = Math.floor(idx / size), c = idx % size;
      let flagCount = 0;
      const neighbors = [];
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r+dr, nc = c+dc;
          if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
            const ni = nr*size+nc;
            if (flagged.has(ni)) flagCount++;
            else if (!revealed.has(ni)) neighbors.push(ni);
          }
        }
      if (flagCount === board[idx] && neighbors.length > 0) {
        let newRev = new Set(revealed);
        let hitMine = false;
        for (const ni of neighbors) {
          if (board[ni] === -1) { hitMine = true; break; }
          newRev = revealCell(ni, board, newRev);
        }
        if (hitMine) {
          clearInterval(timerRef.current);
          setRevealed(new Set(Array.from({length: size*size}, (_,i) => i)));
          setGameState('lost');
          endTracking('lose');
        } else {
          setRevealed(newRev);
          const nonMines = size * size - mines;
          if (newRev.size >= nonMines) {
            clearInterval(timerRef.current);
            setGameState('won');
            endTracking('win');
            if (user) submitScore(user.id, `minesweeper_${difficulty}`, time, 'time').catch(() => {});
          }
        }
      }
      return;
    }

    if (flagged.has(idx) || revealed.has(idx)) return;

    let brd = board;
    if (firstClick) {
      brd = createBoard(size, mines, idx);
      setBoard(brd);
      setFirstClick(false);
    }

    if (brd[idx] === -1) {
      // Game over
      clearInterval(timerRef.current);
      setRevealed(new Set(Array.from({length: size*size}, (_,i) => i)));
      setGameState('lost');
      endTracking('lose');
      return;
    }

    const newRev = revealCell(idx, brd, revealed);
    setRevealed(newRev);

    // Check win
    const nonMines = size * size - mines;
    if (newRev.size >= nonMines) {
      clearInterval(timerRef.current);
      setGameState('won');
      endTracking('win');
      if (user) submitScore(user.id, `minesweeper_${difficulty}`, time, 'time').catch(() => {});
    }
  }, [gameState, flagMode, flagged, questioned, revealed, board, firstClick, revealCell, time, user, difficulty, endTracking]);

  const handleLongPress = useCallback((idx) => {
    if (gameState !== 'playing' || revealed.has(idx)) return;
    const nf = new Set(flagged);
    const nq = new Set(questioned);
    if (nf.has(idx)) { nf.delete(idx); nq.add(idx); }
    else if (nq.has(idx)) { nq.delete(idx); }
    else { nf.add(idx); }
    setFlagged(nf);
    setQuestioned(nq);
  }, [gameState, flagged, questioned, revealed]);

  const formatTime = (s) => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;

  if (!difficulty) {
    return (
      <div className={styles.container}>
        <button className={styles.backBtn} onClick={onBack}>← 뒤로</button>
        <h1 className={styles.title}>💣 미니 지뢰찾기</h1>
        <p className={styles.subtitle}>난이도를 골라줘!</p>
        <div className={styles.diffGrid}>
          {Object.entries(DIFFICULTIES).map(([key, val]) => (
            <button key={key} className={styles.diffBtn} onClick={() => startGame(key)}>
              {val.label} ({val.mines}개 💣)
            </button>
          ))}
        </div>
      </div>
    );
  }

  const size = sizeRef.current;

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={onBack}>← 뒤로</button>
        <span className={styles.stat}>⏱️ {formatTime(time)}</span>
        <span className={styles.stat}>🚩 {flagged.size}/{minesRef.current}</span>
      </div>
      <h2 className={styles.title}>💣 미니 지뢰찾기</h2>

      <button
        className={`${styles.flagToggle} ${flagMode ? styles.flagActive : ''}`}
        onClick={() => setFlagMode(f => !f)}
      >
        {flagMode ? '🚩 깃발 모드' : '👆 열기 모드'}
      </button>

      {gameState !== 'playing' && (
        <div className={styles.modal}>
          <h2>{gameState === 'won' ? '🎉 승리! 🎉' : '💥 펑! 💥'}</h2>
          <p>{gameState === 'won' ? `⏱️ ${formatTime(time)}만에 클리어!` : '다시 도전해봐!'}</p>
          <div className={styles.modalBtns}>
            <button onClick={() => startGame(difficulty)}>🔄 다시하기</button>
            <button onClick={onBack}>🏠 홈으로</button>
          </div>
        </div>
      )}

      <div className={styles.board} style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
        {board.map((val, idx) => {
          const isRevealed = revealed.has(idx);
          const isFlagged = flagged.has(idx);
          let content = '';
          let cellStyle = {};
          if (isRevealed) {
            if (val === -1) content = '🌸';
            else if (val > 0) { content = val; cellStyle = { color: NUM_COLORS[val] }; }
          } else if (isFlagged) {
            content = '🚩';
          } else if (questioned.has(idx)) {
            content = '❓';
          }
          return (
            <button
              key={idx}
              className={`${styles.cell} ${isRevealed ? styles.revealed : styles.hidden}`}
              style={cellStyle}
              onClick={() => handleClick(idx)}
              onContextMenu={(e) => { e.preventDefault(); handleLongPress(idx); }}
            >
              {content}
            </button>
          );
        })}
      </div>
      <button className={styles.restartBtn} onClick={() => startGame(difficulty)}>🔄 다시하기</button>
    </div>
  );
}
