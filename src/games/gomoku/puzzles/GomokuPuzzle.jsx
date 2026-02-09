import { useState, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { puzzles } from './puzzleData';
import { completeGomokuPuzzle, getCompletedGomokuPuzzles } from '../progress';
import styles from './GomokuPuzzle.module.css';

function isStarPoint(r, c, size) {
  if (size === 9) return (r === 2 || r === 4 || r === 6) && (c === 2 || c === 4 || c === 6);
  if (size === 15) return (r === 3 || r === 7 || r === 11) && (c === 3 || c === 7 || c === 11);
  return false;
}

export default function GomokuPuzzle({ onBack }) {
  const [selectedPuzzle, setSelectedPuzzle] = useState(null);
  const [result, setResult] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [placedStone, setPlacedStone] = useState(null);
  const completedPuzzles = getCompletedGomokuPuzzles();

  const handleCellClick = useCallback((r, c) => {
    if (!selectedPuzzle || result === 'correct') return;
    if (selectedPuzzle.board[r][c] !== 0) return;

    const sol = selectedPuzzle.solution;
    if (r === sol.r && c === sol.c) {
      setResult('correct');
      setPlacedStone({ r, c });
      completeGomokuPuzzle(selectedPuzzle.id);
      confetti({
        particleCount: 150, spread: 80, origin: { y: 0.6 },
        colors: ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96e6a1'],
      });
    } else {
      setResult('wrong');
      setPlacedStone(null);
    }
  }, [selectedPuzzle, result]);

  const handleRetry = useCallback(() => {
    setResult(null);
    setPlacedStone(null);
    setShowHint(false);
  }, []);

  const handleNextPuzzle = useCallback(() => {
    const idx = puzzles.findIndex(p => p.id === selectedPuzzle.id);
    if (idx < puzzles.length - 1) {
      setSelectedPuzzle(puzzles[idx + 1]);
      setResult(null); setPlacedStone(null); setShowHint(false);
    } else {
      setSelectedPuzzle(null);
    }
  }, [selectedPuzzle]);

  if (!selectedPuzzle) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>🧩 오목 퍼즐</h1>
        <p className={styles.subtitle}>한 수로 5줄을 만들어봐!</p>
        <div className={styles.puzzleList}>
          {puzzles.map((puzzle, index) => {
            const isCompleted = completedPuzzles.includes(puzzle.id);
            return (
              <button
                key={puzzle.id}
                className={`${styles.puzzleCard} ${isCompleted ? styles.completed : ''}`}
                onClick={() => {
                  setSelectedPuzzle(puzzle);
                  setResult(null); setPlacedStone(null); setShowHint(false);
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

  const { board, boardSize } = selectedPuzzle;
  const maxPx = Math.min(typeof window !== 'undefined' ? window.innerWidth - 48 : 400, 420);
  const cellSize = Math.min(Math.floor(maxPx / boardSize), 44);

  return (
    <div className={styles.container}>
      <div className={styles.puzzleHeader}>
        <button className={styles.headerBackBtn} onClick={() => setSelectedPuzzle(null)}>⬅️</button>
        <h2 className={styles.headerTitle}>퍼즐 #{selectedPuzzle.id}: {selectedPuzzle.title}</h2>
      </div>
      <p className={styles.puzzleDesc}>{selectedPuzzle.description}</p>

      <div className={styles.boardWrapper}>
        <div
          className={styles.board}
          style={{
            gridTemplateColumns: `repeat(${boardSize}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${boardSize}, ${cellSize}px)`,
          }}
        >
          {board.map((row, r) =>
            row.map((cell, c) => {
              const isPlaced = placedStone && placedStone.r === r && placedStone.c === c;
              const showCell = cell !== 0 || isPlaced;
              const color = isPlaced ? 1 : cell;
              return (
                <button
                  key={`${r}-${c}`}
                  className={styles.cell}
                  style={{ width: cellSize, height: cellSize }}
                  onClick={() => handleCellClick(r, c)}
                  disabled={result === 'correct'}
                >
                  <div className={styles.gridLines}>
                    <div className={`${styles.hLine} ${c === 0 ? styles.hLineLeft : ''} ${c === boardSize - 1 ? styles.hLineRight : ''}`} />
                    <div className={`${styles.vLine} ${r === 0 ? styles.vLineTop : ''} ${r === boardSize - 1 ? styles.vLineBottom : ''}`} />
                  </div>
                  {isStarPoint(r, c, boardSize) && !showCell && (
                    <div className={styles.starPoint} />
                  )}
                  {showHint && !showCell && r === selectedPuzzle.solution.r && c === selectedPuzzle.solution.c && (
                    <div className={styles.solutionHighlight} />
                  )}
                  {showCell && (
                    <div className={`${styles.stone} ${color === 1 ? styles.blackStone : styles.whiteStone} ${isPlaced ? styles.stoneNew : ''}`} />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {result === 'correct' && (
        <div className={styles.resultCorrect}>
          <span className={styles.resultEmoji}>🎉</span>
          <span>정답이에요! 5줄 완성! 🏆</span>
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
