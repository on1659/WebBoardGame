import { useState, useCallback, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { useGameSave } from '../../hooks/useGameSave';
import { usePlayTracking } from '../../hooks/usePlayTracking';
import ResumeModal from '../../components/ResumeModal';
import BadukTutorial from './tutorial/BadukTutorial';
import BadukPuzzle from './tutorial/BadukPuzzle';
import styles from './BadukGame.module.css';

const EMPTY = 0;
const BLACK = 1; // Player
const WHITE = 2; // AI

function createBoard(size) {
  return Array.from({ length: size }, () => Array(size).fill(EMPTY));
}

function opponent(color) {
  return color === BLACK ? WHITE : BLACK;
}

// Get group of connected same-color stones starting from (r, c)
function getGroup(board, r, c) {
  const size = board.length;
  const color = board[r][c];
  if (color === EMPTY) return { stones: [], liberties: new Set() };
  const visited = new Set();
  const stones = [];
  const liberties = new Set();
  const stack = [[r, c]];
  while (stack.length > 0) {
    const [cr, cc] = stack.pop();
    const key = cr * size + cc;
    if (visited.has(key)) continue;
    visited.add(key);
    stones.push([cr, cc]);
    for (const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0]]) {
      const nr = cr + dr, nc = cc + dc;
      if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
      if (board[nr][nc] === EMPTY) {
        liberties.add(nr * size + nc);
      } else if (board[nr][nc] === color && !visited.has(nr * size + nc)) {
        stack.push([nr, nc]);
      }
    }
  }
  return { stones, liberties };
}

// Place stone and return { newBoard, captured } or null if invalid
function placeStone(board, r, c, color, koPoint) {
  const size = board.length;
  if (board[r][c] !== EMPTY) return null;
  if (koPoint && koPoint[0] === r && koPoint[1] === c) return null;

  const newBoard = board.map(row => [...row]);
  newBoard[r][c] = color;

  // Check captures of opponent groups
  let captured = [];
  for (const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0]]) {
    const nr = r + dr, nc = c + dc;
    if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
    if (newBoard[nr][nc] === opponent(color)) {
      const group = getGroup(newBoard, nr, nc);
      if (group.liberties.size === 0) {
        for (const [gr, gc] of group.stones) {
          newBoard[gr][gc] = EMPTY;
          captured.push([gr, gc]);
        }
      }
    }
  }

  // Suicide check: if our group has no liberties and we didn't capture anything
  if (captured.length === 0) {
    const ourGroup = getGroup(newBoard, r, c);
    if (ourGroup.liberties.size === 0) return null; // suicide
  }

  // Determine new ko point
  let newKo = null;
  if (captured.length === 1) {
    // Check if this is a ko situation (single stone captured, placing stone has exactly one liberty)
    const ourGroup = getGroup(newBoard, r, c);
    if (ourGroup.stones.length === 1 && ourGroup.liberties.size === 1) {
      newKo = captured[0];
    }
  }

  return { newBoard, captured, koPoint: newKo };
}

// Count territory using Chinese rules (area scoring)
function countScore(board) {
  const size = board.length;
  const visited = Array.from({ length: size }, () => Array(size).fill(false));
  let blackScore = 0, whiteScore = 0;

  // Count stones on board
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] === BLACK) blackScore++;
      else if (board[r][c] === WHITE) whiteScore++;
    }
  }

  // Count territory (empty areas surrounded by one color)
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] !== EMPTY || visited[r][c]) continue;
      // BFS to find connected empty region
      const region = [];
      const stack = [[r, c]];
      let touchesBlack = false, touchesWhite = false;
      while (stack.length > 0) {
        const [cr, cc] = stack.pop();
        if (cr < 0 || cr >= size || cc < 0 || cc >= size) continue;
        if (visited[cr][cc]) continue;
        if (board[cr][cc] === BLACK) { touchesBlack = true; continue; }
        if (board[cr][cc] === WHITE) { touchesWhite = true; continue; }
        visited[cr][cc] = true;
        region.push([cr, cc]);
        for (const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0]]) {
          stack.push([cr + dr, cc + dc]);
        }
      }
      if (touchesBlack && !touchesWhite) blackScore += region.length;
      else if (touchesWhite && !touchesBlack) whiteScore += region.length;
    }
  }

  return { blackScore, whiteScore };
}

// Get all valid moves for a color
function getValidMoves(board, color, koPoint) {
  const size = board.length;
  const moves = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (placeStone(board, r, c, color, koPoint)) {
        moves.push([r, c]);
      }
    }
  }
  return moves;
}

// AI move selection
function getAiMove(board, difficulty, koPoint) {
  const size = board.length;
  const validMoves = getValidMoves(board, WHITE, koPoint);
  if (validMoves.length === 0) return null; // AI passes

  const center = Math.floor(size / 2);

  if (difficulty === 'easy') {
    // Prefer moves near existing stones and center
    const scored = validMoves.map(([r, c]) => {
      let score = Math.random() * 5;
      // Prefer center
      const dist = Math.abs(r - center) + Math.abs(c - center);
      score += Math.max(0, size - dist) * 0.5;
      // Prefer near existing stones
      for (const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]]) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size && board[nr][nc] !== EMPTY) {
          score += 3;
        }
      }
      return { r, c, score };
    });
    scored.sort((a, b) => b.score - a.score);
    // Pick from top candidates with some randomness
    const topN = Math.min(5, scored.length);
    const pick = scored[Math.floor(Math.random() * topN)];
    return [pick.r, pick.c];
  }

  // Medium: heuristic-based
  let bestScore = -Infinity;
  let bestMoves = [];

  for (const [r, c] of validMoves) {
    let score = 0;
    const result = placeStone(board, r, c, WHITE, koPoint);
    if (!result) continue;

    // Captures are very valuable
    score += result.captured.length * 20;

    // Check if this defends a group with 1 liberty
    for (const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0]]) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < size && nc >= 0 && nc < size && board[nr][nc] === WHITE) {
        const group = getGroup(board, nr, nc);
        if (group.liberties.size === 1) score += 15; // defend atari
      }
    }

    // Check if placing here puts opponent in atari (threatens capture)
    for (const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0]]) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < size && nc >= 0 && nc < size && result.newBoard[nr][nc] === BLACK) {
        const group = getGroup(result.newBoard, nr, nc);
        if (group.liberties.size === 1) score += 10; // atari opponent
      }
    }

    // Avoid self-atari (placing stone that immediately has 1 liberty and doesn't capture)
    if (result.captured.length === 0) {
      const ourGroup = getGroup(result.newBoard, r, c);
      if (ourGroup.liberties.size === 1) score -= 12;
    }

    // Prefer center
    const dist = Math.abs(r - center) + Math.abs(c - center);
    score += Math.max(0, size - dist) * 0.3;

    // Prefer near existing stones
    let hasNeighbor = false;
    for (const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0]]) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < size && nc >= 0 && nc < size && board[nr][nc] !== EMPTY) {
        hasNeighbor = true;
        break;
      }
    }
    if (hasNeighbor) score += 2;

    // Small random factor
    score += Math.random() * 2;

    if (score > bestScore) {
      bestScore = score;
      bestMoves = [[r, c]];
    } else if (Math.abs(score - bestScore) < 0.5) {
      bestMoves.push([r, c]);
    }
  }

  if (bestMoves.length === 0) return null;
  return bestMoves[Math.floor(Math.random() * bestMoves.length)];
}

function isStarPoint(r, c, size) {
  if (size === 9) {
    return (r === 2 || r === 4 || r === 6) && (c === 2 || c === 4 || c === 6);
  }
  if (size === 13) {
    return (r === 3 || r === 6 || r === 9) && (c === 3 || c === 6 || c === 9);
  }
  if (size === 19) {
    return (r === 3 || r === 9 || r === 15) && (c === 3 || c === 9 || c === 15);
  }
  return false;
}

export default function BadukGame({ onBack, skipResume }) {
  const [mode, setMode] = useState(null); // null=setup, 'tutorial', 'puzzle'
  const [boardSize, setBoardSize] = useState(9);
  const [board, setBoard] = useState(() => createBoard(9));
  const [currentPlayer, setCurrentPlayer] = useState(BLACK);
  const [gameStarted, setGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState('easy');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [lastMove, setLastMove] = useState(null);
  const [history, setHistory] = useState([]);
  const [koPoint, setKoPoint] = useState(null);
  const [capturedBlack, setCapturedBlack] = useState(0); // stones captured BY black
  const [capturedWhite, setCapturedWhite] = useState(0); // stones captured BY white
  const [consecutivePasses, setConsecutivePasses] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameResult, setGameResult] = useState(null); // { blackScore, whiteScore, winner }
  const [resigned, setResigned] = useState(false);

  const gameTypeKey = `baduk_${boardSize}x${boardSize}_${difficulty}`;
  const { startTracking, endTracking } = usePlayTracking(gameTypeKey);
  const endTrackingRef = useRef(endTracking);
  endTrackingRef.current = endTracking;

  const { showResumeModal, handleResume, handleNewGame: handleNewFromModal } = useGameSave('baduk', { skipResume,
    getState: () => ({
      board: board.map(r => [...r]), currentPlayer, boardSize, difficulty,
      koPoint, capturedBlack, capturedWhite, consecutivePasses,
      history: history.slice(-20), // limit saved history size
    }),
    onResume: (state) => {
      setBoardSize(state.boardSize);
      setBoard(state.board);
      setCurrentPlayer(state.currentPlayer);
      setDifficulty(state.difficulty);
      setKoPoint(state.koPoint);
      setCapturedBlack(state.capturedBlack || 0);
      setCapturedWhite(state.capturedWhite || 0);
      setConsecutivePasses(state.consecutivePasses || 0);
      setHistory(state.history || []);
      setGameStarted(true);
      setGameOver(false);
      setGameResult(null);
      setResigned(false);
      setLastMove(null);
      startTracking();
    },
    gameStarted,
    gameOver,
  });

  // End game when two consecutive passes
  useEffect(() => {
    if (consecutivePasses >= 2 && !gameOver) {
      const scores = countScore(board);
      // Apply komi (6.5 for white)
      const komi = 6.5;
      const finalWhite = scores.whiteScore + komi;
      const winner = scores.blackScore > finalWhite ? 'black' : 'white';
      setGameResult({ blackScore: scores.blackScore, whiteScore: finalWhite, winner });
      setGameOver(true);
    }
  }, [consecutivePasses, board, gameOver]);

  // Track result
  useEffect(() => {
    if (!gameOver || !gameResult) return;
    if (gameResult.winner === 'black') {
      endTrackingRef.current('win');
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#a8d5ba', '#f8bbd9', '#fff59d', '#d1c4e9', '#ffccbc'],
      });
    } else {
      endTrackingRef.current('lose');
    }
  }, [gameOver, gameResult]);

  const handleCellClick = useCallback((row, col) => {
    if (gameOver || isAiThinking || currentPlayer !== BLACK) return;

    const result = placeStone(board, row, col, BLACK, koPoint);
    if (!result) return;

    const prevState = {
      board: board.map(r => [...r]),
      currentPlayer, koPoint, capturedBlack, capturedWhite,
      consecutivePasses, lastMove,
    };

    setBoard(result.newBoard);
    setLastMove([row, col]);
    setKoPoint(result.koPoint);
    setCapturedBlack(prev => prev + result.captured.length);
    setConsecutivePasses(0);
    setHistory(prev => [...prev, prevState]);
    setCurrentPlayer(WHITE);
    setIsAiThinking(true);

    // AI move
    setTimeout(() => {
      const aiMove = getAiMove(result.newBoard, difficulty, result.koPoint);
      if (aiMove) {
        const aiResult = placeStone(result.newBoard, aiMove[0], aiMove[1], WHITE, result.koPoint);
        if (aiResult) {
          setBoard(aiResult.newBoard);
          setLastMove(aiMove);
          setKoPoint(aiResult.koPoint);
          setCapturedWhite(prev => prev + aiResult.captured.length);
          setConsecutivePasses(0);
        } else {
          // AI passes if move fails
          setConsecutivePasses(prev => prev + 1);
        }
      } else {
        // AI passes
        setConsecutivePasses(prev => prev + 1);
        setLastMove(null);
      }
      setCurrentPlayer(BLACK);
      setIsAiThinking(false);
    }, 400 + Math.random() * 400);
  }, [board, gameOver, isAiThinking, currentPlayer, difficulty, koPoint, capturedBlack, capturedWhite, consecutivePasses, lastMove]);

  const handlePass = useCallback(() => {
    if (gameOver || isAiThinking || currentPlayer !== BLACK) return;

    const prevState = {
      board: board.map(r => [...r]),
      currentPlayer, koPoint, capturedBlack, capturedWhite,
      consecutivePasses, lastMove,
    };
    setHistory(prev => [...prev, prevState]);

    const newPasses = consecutivePasses + 1;
    setConsecutivePasses(newPasses);
    setLastMove(null);
    setKoPoint(null);

    if (newPasses >= 2) return; // game ends via useEffect

    setCurrentPlayer(WHITE);
    setIsAiThinking(true);

    setTimeout(() => {
      const aiMove = getAiMove(board, difficulty, null);
      if (aiMove) {
        const aiResult = placeStone(board, aiMove[0], aiMove[1], WHITE, null);
        if (aiResult) {
          setBoard(aiResult.newBoard);
          setLastMove(aiMove);
          setKoPoint(aiResult.koPoint);
          setCapturedWhite(prev => prev + aiResult.captured.length);
          setConsecutivePasses(0);
        } else {
          setConsecutivePasses(prev => prev + 1);
        }
      } else {
        setConsecutivePasses(prev => prev + 1);
      }
      setCurrentPlayer(BLACK);
      setIsAiThinking(false);
    }, 400 + Math.random() * 400);
  }, [board, gameOver, isAiThinking, currentPlayer, difficulty, koPoint, capturedBlack, capturedWhite, consecutivePasses, lastMove]);

  const handleResign = useCallback(() => {
    if (gameOver) return;
    const scores = countScore(board);
    setGameResult({ blackScore: scores.blackScore, whiteScore: scores.whiteScore + 6.5, winner: 'white' });
    setGameOver(true);
    setResigned(true);
  }, [board, gameOver]);

  const handleUndo = useCallback(() => {
    if (history.length === 0 || isAiThinking || gameOver) return;
    const prev = history[history.length - 1];
    setBoard(prev.board);
    setCurrentPlayer(prev.currentPlayer);
    setKoPoint(prev.koPoint);
    setCapturedBlack(prev.capturedBlack);
    setCapturedWhite(prev.capturedWhite);
    setConsecutivePasses(prev.consecutivePasses);
    setLastMove(prev.lastMove);
    setHistory(h => h.slice(0, -1));
    setGameOver(false);
    setGameResult(null);
    setResigned(false);
  }, [history, isAiThinking, gameOver]);

  const handleNewGame = useCallback((size, diff) => {
    const s = size || boardSize;
    setBoardSize(s);
    setBoard(createBoard(s));
    setCurrentPlayer(BLACK);
    setIsAiThinking(false);
    setLastMove(null);
    setHistory([]);
    setKoPoint(null);
    setCapturedBlack(0);
    setCapturedWhite(0);
    setConsecutivePasses(0);
    setGameOver(false);
    setGameResult(null);
    setResigned(false);
    setDifficulty(diff || difficulty);
    setGameStarted(true);
    startTracking();
  }, [boardSize, difficulty, startTracking]);

  // Current score estimate
  const currentScores = gameOver ? null : countScore(board);

  if (mode === 'tutorial') {
    return <BadukTutorial onBack={() => setMode(null)} />;
  }

  if (mode === 'puzzle') {
    return <BadukPuzzle onBack={() => setMode(null)} />;
  }

  if (!gameStarted) {
    return (
      <div className={styles.setupScreen}>
        <h1 className={styles.setupTitle}>⚪ 바둑</h1>
        <p className={styles.setupSubtitle}>돌로 땅을 많이 차지하면 이겨요!</p>

        <div className={styles.setupSection}>
          <p className={styles.sectionLabel}>📏 판 크기</p>
          <div className={styles.sizeButtons}>
            {[9, 13, 19].map(size => (
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

        <div className={styles.learnButtons}>
          <button className={styles.learnButton} onClick={() => setMode('tutorial')}>
            📚 배우기
          </button>
          <button className={styles.learnButton} onClick={() => setMode('puzzle')}>
            🧩 퍼즐
          </button>
        </div>

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

      {/* Game Over Modal */}
      {gameOver && gameResult && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>
              {gameResult.winner === 'black' ? '🎉 이겼어요! 🎉' : resigned ? '🏳️ 기권했어요' : '😢 졌어요...'}
            </h2>
            <div className={styles.scoreBoard}>
              <div className={styles.scoreRow}>
                <span className={styles.scoreLabel}>⚫ 나</span>
                <span className={styles.scoreValue}>{gameResult.blackScore}점</span>
              </div>
              <div className={styles.scoreRow}>
                <span className={styles.scoreLabel}>⚪ 컴퓨터</span>
                <span className={styles.scoreValue}>{gameResult.whiteScore}점</span>
              </div>
              <div className={styles.scoreDiff}>
                {gameResult.winner === 'black'
                  ? `${(gameResult.blackScore - gameResult.whiteScore).toFixed(1)}점 차이로 이겼어요!`
                  : `${(gameResult.whiteScore - gameResult.blackScore).toFixed(1)}점 차이로 졌어요`}
              </div>
            </div>
            <div className={styles.modalButtons}>
              <button className={styles.modalBtn} onClick={() => { setGameStarted(false); }}>
                🔄 새 게임
              </button>
              <button className={styles.modalBtn} onClick={onBack}>
                🏠 홈으로
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.container}>
        <div className={styles.header}>
          <button className={styles.headerBackBtn} onClick={onBack}>🏠</button>
          <h1 className={styles.title}>⚪ 바둑</h1>
        </div>

        <div className={styles.turnIndicator}>
          {gameOver ? (
            gameResult?.winner === 'black' ? (
              <span className={styles.winText}>🎉 이겼어요! 🎉</span>
            ) : (
              <span className={styles.loseText}>😢 졌어요...</span>
            )
          ) : isAiThinking ? (
            <span className={styles.thinkingText}>⚪ 컴퓨터가 생각 중...</span>
          ) : (
            <span className={styles.yourTurnText}>⚫ 내 차례! 돌을 놓아요!</span>
          )}
        </div>

        {/* Captured stones & score info */}
        <div className={styles.infoBar}>
          <div className={styles.infoItem}>
            <span>⚫ 잡은 돌: {capturedBlack}</span>
          </div>
          <div className={styles.infoItem}>
            <span>⚪ 잡은 돌: {capturedWhite}</span>
          </div>
          {currentScores && (
            <div className={styles.infoItem}>
              <span>⚫{currentScores.blackScore} vs ⚪{(currentScores.whiteScore + 6.5).toFixed(1)}</span>
            </div>
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
                  disabled={gameOver || isAiThinking || cell !== EMPTY}
                >
                  <div className={styles.gridLines}>
                    <div className={`${styles.hLine} ${c === 0 ? styles.hLineLeft : ''} ${c === boardSize - 1 ? styles.hLineRight : ''}`} />
                    <div className={`${styles.vLine} ${r === 0 ? styles.vLineTop : ''} ${r === boardSize - 1 ? styles.vLineBottom : ''}`} />
                  </div>
                  {isStarPoint(r, c, boardSize) && cell === EMPTY && (
                    <div className={styles.starPoint} />
                  )}
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
            className={styles.passBtn}
            onClick={handlePass}
            disabled={gameOver || isAiThinking || currentPlayer !== BLACK}
          >
            ✋ 패스
          </button>
          <button
            className={styles.controlBtn}
            onClick={handleUndo}
            disabled={history.length === 0 || isAiThinking || gameOver}
          >
            ↩️ 되돌리기
          </button>
          <button
            className={styles.resignBtn}
            onClick={handleResign}
            disabled={gameOver}
          >
            🏳️ 기권
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
