import { useState, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { puzzles } from './puzzleData';
import { completeOthelloPuzzle, getCompletedOthelloPuzzles } from '../progress';
import styles from './OthelloPuzzle.module.css';

const EMPTY = 0, BLACK = 1, WHITE = 2;
const DIRS = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];

function getFlips(board, r, c, player) {
  if (board[r][c] !== EMPTY) return [];
  const opp = player === BLACK ? WHITE : BLACK;
  const allFlips = [];
  for (const [dr, dc] of DIRS) {
    const line = [];
    let nr = r + dr, nc = c + dc;
    while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && board[nr][nc] === opp) {
      line.push([nr, nc]); nr += dr; nc += dc;
    }
    if (line.length > 0 && nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && board[nr][nc] === player) {
      allFlips.push(...line);
    }
  }
  return allFlips;
}

function getValidMoves(board, player) {
  const moves = [];
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if (getFlips(board, r, c, player).length > 0) moves.push([r, c]);
  return moves;
}

export default function OthelloPuzzle({ onBack }) {
  const [selectedPuzzle, setSelectedPuzzle] = useState(null);
  const [result, setResult] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [boardState, setBoardState] = useState(null);
  const completedPuzzles = getCompletedOthelloPuzzles();

  const validMoves = useMemo(() => {
    if (!selectedPuzzle || result === 'correct') return [];
    const b = boardState || selectedPuzzle.board;
    return getValidMoves(b, selectedPuzzle.playerColor);
  }, [selectedPuzzle, result, boardState]);

  const validSet = useMemo(() => new Set(validMoves.map(([r, c]) => `${r}-${c}`)), [validMoves]);

  const handleCellClick = useCallback((r, c) => {
    if (!selectedPuzzle || result === 'correct') return;
    const board = boardState || selectedPuzzle.board;
    const flips = getFlips(board, r, c, selectedPuzzle.playerColor);
    if (flips.length === 0) return;

    const sol = selectedPuzzle.solution;
    if (r === sol.r && c === sol.c) {
      // Apply the move visually
      const nb = board.map(row => [...row]);
      nb[r][c] = selectedPuzzle.playerColor;
      for (const [fr, fc] of flips) nb[fr][fc] = selectedPuzzle.playerColor;
      setBoardState(nb);
      setResult('correct');
      completeOthelloPuzzle(selectedPuzzle.id);
      confetti({
        particleCount: 150, spread: 80, origin: { y: 0.6 },
        colors: ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96e6a1'],
      });
    } else {
      setResult('wrong');
    }
  }, [selectedPuzzle, result, boardState]);

  const handleRetry = useCallback(() => {
    setResult(null);
    setBoardState(null);
    setShowHint(false);
  }, []);

  const handleNextPuzzle = useCallback(() => {
    const idx = puzzles.findIndex(p => p.id === selectedPuzzle.id);
    if (idx < puzzles.length - 1) {
      setSelectedPuzzle(puzzles[idx + 1]);
      setResult(null); setBoardState(null); setShowHint(false);
    } else {
      setSelectedPuzzle(null);
    }
  }, [selectedPuzzle]);

  if (!selectedPuzzle) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>🧩 오델로 퍼즐</h1>
        <p className={styles.subtitle}>최고의 한 수를 찾아봐!</p>
        <div className={styles.puzzleList}>
          {puzzles.map((puzzle, index) => {
            const isCompleted = completedPuzzles.includes(puzzle.id);
            return (
              <button
                key={puzzle.id}
                className={`${styles.puzzleCard} ${isCompleted ? styles.completed : ''}`}
                onClick={() => {
                  setSelectedPuzzle(puzzle);
                  setResult(null); setBoardState(null); setShowHint(false);
                }}
                style={{ animationDelay: `${index * 0.06}s` }}
              >
                <span className={styles.puzzleNumber}>#{puzzle.id}</span>
                <span className={styles.puzzleTitle}>{puzzle.title}</span>
                {isCompleted && <span className={styles.checkmark}>✅</span>}
              </button>
            );
          })}
        </div>
        <button className={styles.backButton} onClick={onBack}>⬅️ 돌아가기</button>
      </div>
    );
  }

  const board = boardState || selectedPuzzle.board;

  return (
    <div className={styles.container}>
      <div className={styles.puzzleHeader}>
        <button className={styles.headerBackBtn} onClick={() => { setSelectedPuzzle(null); setBoardState(null); }}>⬅️</button>
        <h2 className={styles.headerTitle}>퍼즐 #{selectedPuzzle.id}: {selectedPuzzle.title}</h2>
      </div>
      <p className={styles.puzzleDesc}>{selectedPuzzle.description}</p>

      <div className={styles.boardFrame}>
        <div className={styles.board}>
          {board.map((row, r) =>
            row.map((cell, c) => (
              <button
                key={`${r}-${c}`}
                className={`${styles.cell} ${validSet.has(`${r}-${c}`) && result !== 'correct' ? styles.validCell : ''}`}
                onClick={() => handleCellClick(r, c)}
                disabled={result === 'correct'}
              >
                {cell !== EMPTY && (
                  <div className={`${styles.piece} ${cell === BLACK ? styles.black : styles.white}`} />
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {result === 'correct' && (
        <div className={styles.resultCorrect}>
          <span className={styles.resultEmoji}>🎉</span>
          <span>정답이에요! 잘했어요! 🏆</span>
        </div>
      )}
      {result === 'wrong' && (
        <div className={styles.resultWrong}>
          <span className={styles.resultEmoji}>🤔</span>
          <span>더 좋은 자리가 있어요! 다시 해볼까요?</span>
        </div>
      )}

      <div className={styles.puzzleActions}>
        {result !== 'correct' && (
          <button className={styles.hintButton} onClick={() => setShowHint(true)}>💡 힌트</button>
        )}
        {result === 'wrong' && (
          <button className={styles.retryButton} onClick={handleRetry}>🔄 다시 시도</button>
        )}
        {result === 'correct' && (
          <button className={styles.nextButton} onClick={handleNextPuzzle}>
            {puzzles.findIndex(p => p.id === selectedPuzzle.id) < puzzles.length - 1 ? '다음 퍼즐 ➡️' : '🏠 퍼즐 목록'}
          </button>
        )}
      </div>

      {showHint && result !== 'correct' && (
        <div className={styles.hintBox}>💡 {selectedPuzzle.hint}</div>
      )}
    </div>
  );
}
