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
  // multiMove 상태
  const [moveStep, setMoveStep] = useState(0); // 0=첫수, 1=두번째수
  const [currentFen, setCurrentFen] = useState(null);
  const [stepMsg, setStepMsg] = useState(null);
  const completedPuzzles = getCompletedPuzzles();

  const activeFen = currentFen || (selectedPuzzle && selectedPuzzle.fen);

  const validMoves = useMemo(() => {
    if (!selectedPuzzle || !selectedSquare || !activeFen) return [];
    try {
      const chess = new Chess(activeFen);
      return chess.moves({ square: selectedSquare, verbose: true }).map(m => m.to);
    } catch {
      return [];
    }
  }, [selectedPuzzle, selectedSquare, activeFen]);

  const handleSquareClick = useCallback((square) => {
    if (!selectedPuzzle || result === 'correct') return;
    if (stepMsg) return; // 상대 응수 애니메이션 중

    const fen = currentFen || selectedPuzzle.fen;
    const chess = new Chess(fen);
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

    // multiMove 퍼즐
    if (selectedPuzzle.multiMove) {
      if (moveStep === 0) {
        // 첫 수: moves[0]과 일치해야 함
        const expected = selectedPuzzle.moves[0];
        if (selectedSquare === expected.from && square === expected.to) {
          try {
            chess.move({ from: selectedSquare, to: square, promotion: 'q' });
          } catch { setSelectedSquare(null); return; }
          setCurrentFen(chess.fen());
          setSelectedSquare(null);
          setStepMsg('좋아! 👏 상대가 응수해요...');
          // 상대 자동 응수 (0.6초 후)
          setTimeout(() => {
            const opChess = new Chess(chess.fen());
            const legalMoves = opChess.moves({ verbose: true });
            if (legalMoves.length > 0) {
              opChess.move(legalMoves[0].san);
              setCurrentFen(opChess.fen());
            }
            setMoveStep(1);
            setStepMsg('이제 마지막 한 수! 체크메이트를 만들어봐!');
            setTimeout(() => setStepMsg(null), 2000);
          }, 600);
        } else {
          // 틀린 수
          try {
            chess.move({ from: selectedSquare, to: square, promotion: 'q' });
            setResult('wrong');
          } catch { /* illegal move */ }
          setSelectedSquare(null);
        }
      } else {
        // 두 번째 수: 체크메이트가 되면 정답
        try {
          chess.move({ from: selectedSquare, to: square, promotion: 'q' });
          if (chess.isCheckmate()) {
            setCurrentFen(chess.fen());
            setResult('correct');
            completePuzzle(selectedPuzzle.id);
            setSelectedSquare(null);
            confetti({
              particleCount: 150, spread: 80, origin: { y: 0.6 },
              colors: ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96e6a1'],
            });
          } else {
            setResult('wrong');
            setSelectedSquare(null);
          }
        } catch {
          setSelectedSquare(null);
        }
      }
      return;
    }

    // 1수 퍼즐
    const sol = selectedPuzzle.solution;
    if (selectedSquare === sol.from && square === sol.to) {
      setResult('correct');
      completePuzzle(selectedPuzzle.id);
      setSelectedSquare(null);
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
  }, [selectedPuzzle, selectedSquare, result, moveStep, currentFen, stepMsg]);

  const handleRetry = useCallback(() => {
    setResult(null);
    setSelectedSquare(null);
    setShowHint(false);
    setMoveStep(0);
    setCurrentFen(null);
    setStepMsg(null);
  }, []);

  const handleNextPuzzle = useCallback(() => {
    const currentIdx = puzzles.findIndex(p => p.id === selectedPuzzle.id);
    if (currentIdx < puzzles.length - 1) {
      setSelectedPuzzle(puzzles[currentIdx + 1]);
      setResult(null);
      setSelectedSquare(null);
      setShowHint(false);
      setMoveStep(0);
      setCurrentFen(null);
      setStepMsg(null);
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
                  setMoveStep(0);
                  setCurrentFen(null);
                  setStepMsg(null);
                }}
                style={{ animationDelay: `${index * 0.06}s` }}
              >
                <span className={styles.puzzleNumber}>#{puzzle.id}</span>
                <span className={styles.puzzleTitle}>{puzzle.title}</span>
                {puzzle.multiMove && <span className={styles.diffBadge}>⭐⭐</span>}
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
        fen={activeFen}
        highlightSquares={highlights}
        onSquareClick={handleSquareClick}
      />

      {stepMsg && !result && (
        <div className={styles.stepMsg}>{stepMsg}</div>
      )}

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
