import { useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { puzzles } from './puzzleData';
import { completeConnect4Puzzle, getCompletedConnect4Puzzles } from '../progress';
import styles from './Connect4Puzzle.module.css';

const ROWS = 6, COLS = 7;
const EMPTY = 0, PLAYER = 1, AI = 2;

function dropRow(board, col) {
  for (let r = ROWS - 1; r >= 0; r--) if (board[r][col] === EMPTY) return r;
  return -1;
}

export default function Connect4Puzzle({ onBack }) {
  const [selectedPuzzle, setSelectedPuzzle] = useState(null);
  const [result, setResult] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [boardState, setBoardState] = useState(null);
  const [droppedCell, setDroppedCell] = useState(null);
  const completedPuzzles = getCompletedConnect4Puzzles();

  const handleDrop = useCallback((col) => {
    if (!selectedPuzzle || result === 'correct') return;
    const board = boardState || selectedPuzzle.board;
    const row = dropRow(board, col);
    if (row < 0) return;

    if (col === selectedPuzzle.solution) {
      const nb = board.map(r => [...r]);
      nb[row][col] = PLAYER;
      setBoardState(nb);
      setDroppedCell([row, col]);
      setResult('correct');
      completeConnect4Puzzle(selectedPuzzle.id);
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
    setDroppedCell(null);
    setShowHint(false);
  }, []);

  const handleNextPuzzle = useCallback(() => {
    const idx = puzzles.findIndex(p => p.id === selectedPuzzle.id);
    if (idx < puzzles.length - 1) {
      setSelectedPuzzle(puzzles[idx + 1]);
      setResult(null); setBoardState(null); setDroppedCell(null); setShowHint(false);
    } else {
      setSelectedPuzzle(null);
    }
  }, [selectedPuzzle]);

  if (!selectedPuzzle) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>🧩 사목 퍼즐</h1>
        <p className={styles.subtitle}>한 수로 4줄을 만들어봐!</p>
        <div className={styles.puzzleList}>
          {puzzles.map((puzzle, index) => {
            const isCompleted = completedPuzzles.includes(puzzle.id);
            return (
              <button
                key={puzzle.id}
                className={`${styles.puzzleCard} ${isCompleted ? styles.completed : ''}`}
                onClick={() => {
                  setSelectedPuzzle(puzzle);
                  setResult(null); setBoardState(null); setDroppedCell(null); setShowHint(false);
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
        <div className={styles.colButtons}>
          {Array.from({ length: COLS }, (_, c) => (
            <button
              key={c}
              className={`${styles.colBtn} ${showHint && c === selectedPuzzle.solution ? styles.colBtnHighlight : ''}`}
              onClick={() => handleDrop(c)}
              disabled={result === 'correct' || dropRow(board, c) < 0}
            >
              ⬇️
            </button>
          ))}
        </div>
        <div className={styles.board}>
          {board.map((row, r) =>
            row.map((cell, c) => {
              const isDropped = droppedCell && droppedCell[0] === r && droppedCell[1] === c;
              return (
                <div key={`${r}-${c}`} className={styles.cell}>
                  <div className={`${styles.piece} ${
                    cell === PLAYER ? styles.red :
                    cell === AI ? styles.yellow :
                    styles.empty
                  } ${isDropped ? styles.pieceNew : ''}`} />
                </div>
              );
            })
          )}
        </div>
      </div>

      {result === 'correct' && (
        <div className={styles.resultCorrect}>
          <span className={styles.resultEmoji}>🎉</span>
          <span>정답이에요! 4줄 완성! 🏆</span>
        </div>
      )}
      {result === 'wrong' && (
        <div className={styles.resultWrong}>
          <span className={styles.resultEmoji}>🤔</span>
          <span>아쉬워요! 다시 해볼까요?</span>
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
