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

function applyMove(board, r, c, player) {
  const nb = board.map(row => [...row]);
  const flips = getFlips(board, r, c, player);
  nb[r][c] = player;
  for (const [fr, fc] of flips) nb[fr][fc] = player;
  return nb;
}

export default function OthelloPuzzle({ onBack }) {
  const [selectedPuzzle, setSelectedPuzzle] = useState(null);
  const [result, setResult] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [boardState, setBoardState] = useState(null);
  const [moveStep, setMoveStep] = useState(0);
  const [stepMsg, setStepMsg] = useState(null);
  const completedPuzzles = getCompletedOthelloPuzzles();

  const currentPlayer = useMemo(() => {
    if (!selectedPuzzle) return BLACK;
    return selectedPuzzle.playerColor || BLACK;
  }, [selectedPuzzle]);

  const validMoves = useMemo(() => {
    if (!selectedPuzzle || result === 'correct' || stepMsg) return [];
    const b = boardState || selectedPuzzle.board;
    return getValidMoves(b, currentPlayer);
  }, [selectedPuzzle, result, boardState, currentPlayer, stepMsg]);

  const validSet = useMemo(() => new Set(validMoves.map(([r, c]) => `${r}-${c}`)), [validMoves]);

  const handleCellClick = useCallback((r, c) => {
    if (!selectedPuzzle || result === 'correct' || stepMsg) return;
    const board = boardState || selectedPuzzle.board;
    const flips = getFlips(board, r, c, currentPlayer);
    if (flips.length === 0) return;

    if (!selectedPuzzle.multiMove) {
      // 1수 퍼즐
      const sol = selectedPuzzle.solution;
      if (r === sol.r && c === sol.c) {
        setBoardState(applyMove(board, r, c, currentPlayer));
        setResult('correct');
        completeOthelloPuzzle(selectedPuzzle.id);
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 },
          colors: ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96e6a1'] });
      } else {
        setResult('wrong');
      }
    } else {
      // 2수 퍼즐
      const move = selectedPuzzle.moves[moveStep];
      if (r === move.r && c === move.c) {
        const nb = applyMove(board, r, c, currentPlayer);
        setBoardState(nb);

        if (moveStep === 0) {
          setStepMsg('좋아! 👏 상대가 둡니다...');
          setTimeout(() => {
            const opp = selectedPuzzle.opponentMove;
            const oppPlayer = currentPlayer === BLACK ? WHITE : BLACK;
            const nb2 = applyMove(nb, opp.r, opp.c, oppPlayer);
            setBoardState(nb2);
            setMoveStep(1);
            setStepMsg('이제 마지막 한 수!');
            setTimeout(() => setStepMsg(null), 1500);
          }, 600);
        } else {
          setResult('correct');
          setStepMsg(null);
          completeOthelloPuzzle(selectedPuzzle.id);
          confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 },
            colors: ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96e6a1'] });
        }
      } else {
        setResult('wrong');
      }
    }
  }, [selectedPuzzle, result, boardState, currentPlayer, moveStep, stepMsg]);

  const reset = (puzzle) => {
    setSelectedPuzzle(puzzle);
    setResult(null); setBoardState(null); setShowHint(false); setMoveStep(0); setStepMsg(null);
  };

  const handleRetry = useCallback(() => {
    setResult(null); setBoardState(null); setShowHint(false); setMoveStep(0); setStepMsg(null);
  }, []);

  const handleNextPuzzle = useCallback(() => {
    const idx = puzzles.findIndex(p => p.id === selectedPuzzle.id);
    if (idx < puzzles.length - 1) reset(puzzles[idx + 1]);
    else setSelectedPuzzle(null);
  }, [selectedPuzzle]);

  if (!selectedPuzzle) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>🧩 오델로 퍼즐</h1>
        <p className={styles.subtitle}>최고의 수를 찾아봐!</p>
        <div className={styles.puzzleList}>
          {puzzles.map((puzzle, index) => {
            const isCompleted = completedPuzzles.includes(puzzle.id);
            return (
              <button
                key={puzzle.id}
                className={`${styles.puzzleCard} ${isCompleted ? styles.completed : ''}`}
                onClick={() => reset(puzzle)}
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
                disabled={result === 'correct' || !!stepMsg}
              >
                {cell !== EMPTY && (
                  <div className={`${styles.piece} ${cell === BLACK ? styles.black : styles.white}`} />
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {stepMsg && !result && (
        <div className={styles.stepMsg}>{stepMsg}</div>
      )}

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
        {result !== 'correct' && !stepMsg && (
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
