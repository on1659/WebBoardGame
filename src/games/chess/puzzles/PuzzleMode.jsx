import { useState, useCallback, useMemo } from 'react';
import { Chess } from 'chess.js';
import confetti from 'canvas-confetti';
import { puzzles } from './puzzleData';
import TutorialBoard from '../tutorial/TutorialBoard';
import { completePuzzle, getCompletedPuzzles } from '../progress';
import styles from './PuzzleMode.module.css';

export default function PuzzleMode({ onBack }) {
  const [selectedPuzzle, setSelectedPuzzle] = useState(null);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [result, setResult] = useState(null); // 'correct' | 'wrong' | null
  const [showHint, setShowHint] = useState(false);
  const completedPuzzles = getCompletedPuzzles();

  const validMoves = useMemo(() => {
    if (!selectedPuzzle || !selectedSquare) return [];
    try {
      const chess = new Chess(selectedPuzzle.fen);
      return chess.moves({ square: selectedSquare, verbose: true }).map(m => m.to);
    } catch {
      return [];
    }
  }, [selectedPuzzle, selectedSquare]);

  const handleSquareClick = useCallback((square) => {
    if (!selectedPuzzle || result === 'correct') return;

    const chess = new Chess(selectedPuzzle.fen);
    const playerColor = selectedPuzzle.playerColor || 'w';
    const piece = chess.get(square);

    if (!selectedSquare) {
      if (piece && piece.color === playerColor) {
        setSelectedSquare(square);
      }
      return;
    }

    if (square === selectedSquare) {
      setSelectedSquare(null);
      return;
    }

    if (piece && piece.color === playerColor) {
      setSelectedSquare(square);
      return;
    }

    // Check if this is the solution
    const sol = selectedPuzzle.solution;
    if (selectedSquare === sol.from && square === sol.to) {
      setResult('correct');
      completePuzzle(selectedPuzzle.id);
      setSelectedSquare(null);
      // Confetti!
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96e6a1'],
      });
    } else {
      // Check if it's a legal move at all
      try {
        chess.move({ from: selectedSquare, to: square, promotion: 'q' });
        setResult('wrong');
      } catch {
        // not a legal move
      }
      setSelectedSquare(null);
    }
  }, [selectedPuzzle, selectedSquare, result]);

  const handleRetry = useCallback(() => {
    setResult(null);
    setSelectedSquare(null);
    setShowHint(false);
  }, []);

  const handleNextPuzzle = useCallback(() => {
    const currentIdx = puzzles.findIndex(p => p.id === selectedPuzzle.id);
    if (currentIdx < puzzles.length - 1) {
      setSelectedPuzzle(puzzles[currentIdx + 1]);
      setResult(null);
      setSelectedSquare(null);
      setShowHint(false);
    } else {
      setSelectedPuzzle(null);
    }
  }, [selectedPuzzle]);

  // Puzzle list
  if (!selectedPuzzle) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>🧩 체스 퍼즐</h1>
        <p className={styles.subtitle}>체크메이트를 만들어봐!</p>

        <div className={styles.puzzleList}>
          {puzzles.map((puzzle, index) => {
            const isCompleted = completedPuzzles.includes(puzzle.id);
            return (
              <button
                key={puzzle.id}
                className={`${styles.puzzleCard} ${isCompleted ? styles.completed : ''}`}
                onClick={() => {
                  setSelectedPuzzle(puzzle);
                  setResult(null);
                  setSelectedSquare(null);
                  setShowHint(false);
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

        <button className={styles.backButton} onClick={onBack}>
          ⬅️ 돌아가기
        </button>
      </div>
    );
  }

  // Active puzzle
  const highlights = selectedSquare ? [selectedSquare, ...validMoves] : [];

  return (
    <div className={styles.container}>
      <div className={styles.puzzleHeader}>
        <button className={styles.headerBackButton} onClick={() => setSelectedPuzzle(null)}>
          ⬅️
        </button>
        <h2 className={styles.puzzleHeaderTitle}>
          퍼즐 #{selectedPuzzle.id}: {selectedPuzzle.title}
        </h2>
      </div>

      <p className={styles.puzzleDesc}>{selectedPuzzle.description}</p>

      <TutorialBoard
        fen={selectedPuzzle.fen}
        highlightSquares={highlights}
        onSquareClick={handleSquareClick}
      />

      {result === 'correct' && (
        <div className={styles.resultCorrect}>
          <span className={styles.resultEmoji}>🎉</span>
          <span>정답이에요! 체크메이트! 🏆</span>
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
          <button className={styles.hintButton} onClick={() => setShowHint(true)}>
            💡 힌트
          </button>
        )}
        {result === 'wrong' && (
          <button className={styles.retryButton} onClick={handleRetry}>
            🔄 다시 시도
          </button>
        )}
        {result === 'correct' && (
          <button className={styles.nextButton} onClick={handleNextPuzzle}>
            {puzzles.findIndex(p => p.id === selectedPuzzle.id) < puzzles.length - 1
              ? '다음 퍼즐 ➡️'
              : '🏠 퍼즐 목록'}
          </button>
        )}
      </div>

      {showHint && result !== 'correct' && (
        <div className={styles.hintBox}>
          💡 {selectedPuzzle.hint}
        </div>
      )}
    </div>
  );
}
