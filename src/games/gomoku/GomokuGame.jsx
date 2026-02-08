import { useState, useCallback, useMemo, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useGameSave } from '../../hooks/useGameSave';
import ResumeModal from '../../components/ResumeModal';
import styles from './GomokuGame.module.css';

const EMPTY = 0;
const BLACK = 1; // Player
const WHITE = 2; // AI

function createBoard(size) {
  return Array.from({ length: size }, () => Array(size).fill(EMPTY));
}

// Check for 5 in a row
function checkWin(board, row, col, player) {
  const size = board.length;
  const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];

  for (const [dr, dc] of directions) {
    let count = 1;
    for (let i = 1; i < 5; i++) {
      const r = row + dr * i, c = col + dc * i;
      if (r < 0 || r >= size || c < 0 || c >= size || board[r][c] !== player) break;
      count++;
    }
    for (let i = 1; i < 5; i++) {
      const r = row - dr * i, c = col - dc * i;
      if (r < 0 || r >= size || c < 0 || c >= size || board[r][c] !== player) break;
      count++;
    }
    if (count >= 5) return true;
  }
  return false;
}

// Simple AI
function getAiMove(board, difficulty) {
  const size = board.length;
  const empty = [];
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++)
      if (board[r][c] === EMPTY) empty.push([r, c]);

  if (empty.length === 0) return null;

  // Score each position
  function scorePosition(r, c, player) {
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
    let totalScore = 0;

    for (const [dr, dc] of directions) {
      let count = 0;
      let openEnds = 0;

      // Count forward
      let blocked = false;
      for (let i = 1; i <= 5; i++) {
        const nr = r + dr * i, nc = c + dc * i;
        if (nr < 0 || nr >= size || nc < 0 || nc >= size) { blocked = true; break; }
        if (board[nr][nc] === player) count++;
        else { if (board[nr][nc] === EMPTY) openEnds++; break; }
      }
      if (!blocked && count === 0) openEnds = 0; // reset if no chain

      // Count backward
      let count2 = 0;
      for (let i = 1; i <= 5; i++) {
        const nr = r - dr * i, nc = c - dc * i;
        if (nr < 0 || nr >= size || nc < 0 || nc >= size) { blocked = true; break; }
        if (board[nr][nc] === player) count2++;
        else { if (board[nr][nc] === EMPTY) openEnds++; break; }
      }

      const total = count + count2;
      if (total >= 4) totalScore += 100000;
      else if (total === 3 && openEnds >= 2) totalScore += 10000;
      else if (total === 3 && openEnds >= 1) totalScore += 1000;
      else if (total === 2 && openEnds >= 2) totalScore += 500;
      else if (total === 2 && openEnds >= 1) totalScore += 100;
      else if (total === 1 && openEnds >= 2) totalScore += 50;
      else totalScore += total * 10;
    }
    return totalScore;
  }

  // Easy: mostly random with some blocking
  // Medium: decent evaluation
  if (difficulty === 'easy' && Math.random() < 0.4) {
    // Pick near existing stones
    const near = empty.filter(([r, c]) => {
      for (let dr = -2; dr <= 2; dr++)
        for (let dc = -2; dc <= 2; dc++) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < size && nc >= 0 && nc < size && board[nr][nc] !== EMPTY)
            return true;
        }
      return false;
    });
    if (near.length > 0) return near[Math.floor(Math.random() * near.length)];
    return empty[Math.floor(Math.random() * empty.length)];
  }

  let bestScore = -1;
  let bestMoves = [];

  for (const [r, c] of empty) {
    // Only consider positions near existing stones
    let hasNeighbor = false;
    for (let dr = -2; dr <= 2 && !hasNeighbor; dr++)
      for (let dc = -2; dc <= 2 && !hasNeighbor; dc++) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size && board[nr][nc] !== EMPTY)
          hasNeighbor = true;
      }
    if (!hasNeighbor && empty.length < size * size - 1) continue;

    // Score: offense (AI) + defense (block player)
    const attackScore = scorePosition(r, c, WHITE);
    const defendScore = scorePosition(r, c, BLACK);
    const score = attackScore * 1.1 + defendScore;

    if (score > bestScore) {
      bestScore = score;
      bestMoves = [[r, c]];
    } else if (score === bestScore) {
      bestMoves.push([r, c]);
    }
  }

  if (bestMoves.length === 0) {
    // First move: center
    const center = Math.floor(size / 2);
    return [center, center];
  }

  return bestMoves[Math.floor(Math.random() * bestMoves.length)];
}

export default function GomokuGame({ onBack }) {
  const [boardSize, setBoardSize] = useState(9);
  const [board, setBoard] = useState(() => createBoard(9));
  const [currentPlayer, setCurrentPlayer] = useState(BLACK);
  const [winner, setWinner] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState('easy');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [lastMove, setLastMove] = useState(null);
  const [history, setHistory] = useState([]);
  const [winLine, setWinLine] = useState(null);

  const isGameOver = !!winner;

  const { showResumeModal, handleResume, handleNewGame: handleNewFromModal } = useGameSave('gomoku', {
    getState: () => ({ board: board.map(r=>[...r]), currentPlayer, boardSize, difficulty, moveHistory: history }),
    onResume: (state) => {
      setBoardSize(state.boardSize);
      setBoard(state.board);
      setCurrentPlayer(state.currentPlayer);
      setDifficulty(state.difficulty);
      setHistory(state.moveHistory || []);
      setGameStarted(true);
      setWinner(null); setLastMove(null); setWinLine(null);
    },
    gameStarted,
    gameOver: isGameOver,
  });

  const isBoardFull = useMemo(() => {
    return board.every(row => row.every(cell => cell !== EMPTY));
  }, [board]);

  const isDraw = !winner && isBoardFull;

  // Celebrate on win
  useEffect(() => {
    if (winner === BLACK) {
      const duration = 3000;
      const end = Date.now() + duration;
      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#a8d5ba', '#f8bbd9', '#fff59d', '#d1c4e9', '#ffccbc'],
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#a8d5ba', '#f8bbd9', '#fff59d', '#d1c4e9', '#ffccbc'],
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }
  }, [winner]);

  const handleCellClick = useCallback((row, col) => {
    if (board[row][col] !== EMPTY || winner || isAiThinking || currentPlayer !== BLACK) return;

    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = BLACK;
    setBoard(newBoard);
    setLastMove([row, col]);
    setHistory(prev => [...prev, { board: board.map(r => [...r]), lastMove }]);

    if (checkWin(newBoard, row, col, BLACK)) {
      setWinner(BLACK);
      return;
    }

    setCurrentPlayer(WHITE);
    setIsAiThinking(true);

    // AI move with delay
    setTimeout(() => {
      const aiMove = getAiMove(newBoard, difficulty);
      if (aiMove) {
        const [ar, ac] = aiMove;
        const aiBoard = newBoard.map(r => [...r]);
        aiBoard[ar][ac] = WHITE;
        setBoard(aiBoard);
        setLastMove(aiMove);
        setHistory(prev => [...prev, { board: newBoard.map(r => [...r]), lastMove: [row, col] }]);

        if (checkWin(aiBoard, ar, ac, WHITE)) {
          setWinner(WHITE);
        }
      }
      setCurrentPlayer(BLACK);
      setIsAiThinking(false);
    }, 400 + Math.random() * 400);
  }, [board, winner, isAiThinking, currentPlayer, difficulty, lastMove]);

  const handleUndo = useCallback(() => {
    if (history.length < 2 || isAiThinking) return;
    // Undo both AI and player moves
    const prev = history[history.length - 2];
    setBoard(prev.board);
    setLastMove(prev.lastMove);
    setHistory(h => h.slice(0, -2));
    setCurrentPlayer(BLACK);
    setWinner(null);
  }, [history, isAiThinking]);

  const handleNewGame = useCallback((size, diff) => {
    const s = size || boardSize;
    setBoardSize(s);
    setBoard(createBoard(s));
    setCurrentPlayer(BLACK);
    setWinner(null);
    setIsAiThinking(false);
    setLastMove(null);
    setHistory([]);
    setDifficulty(diff || difficulty);
    setGameStarted(true);
  }, [boardSize, difficulty]);

  if (!gameStarted) {
    return (
      <div className={styles.setupScreen}>
        <h1 className={styles.setupTitle}>⚫ 오목</h1>
        <p className={styles.setupSubtitle}>다섯 개를 한 줄로 놓으면 이겨요!</p>

        <div className={styles.setupSection}>
          <p className={styles.sectionLabel}>📏 판 크기</p>
          <div className={styles.sizeButtons}>
            {[9, 13, 15].map(size => (
              <button
                key={size}
                className={`${styles.sizeButton} ${boardSize === size ? styles.sizeActive : ''}`}
                onClick={() => setBoardSize(size)}
              >
                {size}×{size}
                {size === 9 && <span className={styles.recommended}>추천!</span>}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.setupSection}>
          <p className={styles.sectionLabel}>🎯 난이도</p>
          <div className={styles.diffButtons}>
            <button
              className={`${styles.diffButton} ${difficulty === 'easy' ? styles.diffActive : ''}`}
              onClick={() => setDifficulty('easy')}
            >
              🐣 쉬움
            </button>
            <button
              className={`${styles.diffButton} ${difficulty === 'medium' ? styles.diffActive : ''}`}
              onClick={() => setDifficulty('medium')}
            >
              🐱 보통
            </button>
          </div>
        </div>

        <button className={styles.startButton} onClick={() => handleNewGame()}>
          🎮 게임 시작!
        </button>

        <button className={styles.backButton} onClick={onBack}>
          🏠 홈으로
        </button>
      </div>
    );
  }

  const maxBoardPx = Math.min(window.innerWidth - 32, 560);
  const cellSize = Math.min(Math.floor(maxBoardPx / boardSize), 48);

  return (
    <>
    <ResumeModal isOpen={showResumeModal} onResume={handleResume} onNewGame={handleNewFromModal} />
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.headerBackBtn} onClick={onBack}>🏠</button>
        <h1 className={styles.title}>⚫ 오목</h1>
      </div>

      <div className={styles.turnIndicator}>
        {winner ? (
          winner === BLACK ? (
            <span className={styles.winText}>🎉 이겼어요! 축하해요! 🎉</span>
          ) : (
            <span className={styles.loseText}>😢 졌어요... 다시 해봐요!</span>
          )
        ) : isDraw ? (
          <span className={styles.drawText}>🤝 비겼어요!</span>
        ) : isAiThinking ? (
          <span className={styles.thinkingText}>🤔 컴퓨터가 생각 중...</span>
        ) : (
          <span className={styles.yourTurnText}>⚫ 내 차례! 돌을 놓아요!</span>
        )}
      </div>

      <div className={styles.boardWrapper}>
        <div
          className={styles.board}
          style={{
            gridTemplateColumns: `repeat(${boardSize}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${boardSize}, ${cellSize}px)`,
          }}
        >
          {board.map((row, r) =>
            row.map((cell, c) => (
              <button
                key={`${r}-${c}`}
                className={`${styles.cell} ${
                  lastMove && lastMove[0] === r && lastMove[1] === c ? styles.lastMove : ''
                }`}
                style={{ width: cellSize, height: cellSize }}
                onClick={() => handleCellClick(r, c)}
                disabled={!!winner || isAiThinking || cell !== EMPTY}
              >
                {/* Grid lines */}
                <div className={styles.gridLines}>
                  <div className={`${styles.hLine} ${c === 0 ? styles.hLineLeft : ''} ${c === boardSize - 1 ? styles.hLineRight : ''}`} />
                  <div className={`${styles.vLine} ${r === 0 ? styles.vLineTop : ''} ${r === boardSize - 1 ? styles.vLineBottom : ''}`} />
                </div>
                {/* Star points */}
                {boardSize >= 9 && isStarPoint(r, c, boardSize) && cell === EMPTY && (
                  <div className={styles.starPoint} />
                )}
                {/* Stone */}
                {cell !== EMPTY && (
                  <div className={`${styles.stone} ${cell === BLACK ? styles.blackStone : styles.whiteStone} ${
                    lastMove && lastMove[0] === r && lastMove[1] === c ? styles.stoneNew : ''
                  }`} />
                )}
              </button>
            ))
          )}
        </div>
      </div>

      <div className={styles.controls}>
        <button
          className={styles.controlBtn}
          onClick={handleUndo}
          disabled={history.length < 2 || isAiThinking || !!winner}
        >
          ↩️ 되돌리기
        </button>
        <button
          className={styles.controlBtn}
          onClick={() => { setGameStarted(false); }}
        >
          🔄 새 게임
        </button>
      </div>
    </div>
    </>
  );
}

function isStarPoint(r, c, size) {
  if (size === 9) {
    return (r === 2 || r === 4 || r === 6) && (c === 2 || c === 4 || c === 6);
  }
  if (size === 13) {
    return (r === 3 || r === 6 || r === 9) && (c === 3 || c === 6 || c === 9);
  }
  if (size === 15) {
    return (r === 3 || r === 7 || r === 11) && (c === 3 || c === 7 || c === 11);
  }
  return false;
}
