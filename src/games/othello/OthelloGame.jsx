import { useState, useCallback, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { useGameSave } from '../../hooks/useGameSave';
import { usePlayTracking } from '../../hooks/usePlayTracking';
import ResumeModal from '../../components/ResumeModal';
import OthelloPuzzle from './puzzles/OthelloPuzzle';
import styles from './OthelloGame.module.css';

const SIZE = 8;
const EMPTY = 0, BLACK = 1, WHITE = 2;

function createBoard() {
  const b = Array.from({length:SIZE},()=>Array(SIZE).fill(EMPTY));
  b[3][3]=WHITE; b[3][4]=BLACK; b[4][3]=BLACK; b[4][4]=WHITE;
  return b;
}

const DIRS = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];

function getFlips(board, r, c, player) {
  if (board[r][c] !== EMPTY) return [];
  const opp = player===BLACK?WHITE:BLACK;
  const allFlips = [];
  for (const [dr,dc] of DIRS) {
    const line = [];
    let nr=r+dr, nc=c+dc;
    while(nr>=0&&nr<SIZE&&nc>=0&&nc<SIZE&&board[nr][nc]===opp) {
      line.push([nr,nc]); nr+=dr; nc+=dc;
    }
    if(line.length>0&&nr>=0&&nr<SIZE&&nc>=0&&nc<SIZE&&board[nr][nc]===player)
      allFlips.push(...line);
  }
  return allFlips;
}

function getValidMoves(board, player) {
  const moves = [];
  for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++)
    if(getFlips(board,r,c,player).length>0) moves.push([r,c]);
  return moves;
}

function countPieces(board) {
  let b=0,w=0;
  for(const row of board) for(const cell of row) { if(cell===BLACK)b++; if(cell===WHITE)w++; }
  return {black:b, white:w};
}

function getAiMove(board, difficulty) {
  const moves = getValidMoves(board, WHITE);
  if (!moves.length) return null;
  if (difficulty==='easy' && Math.random()<0.4)
    return moves[Math.floor(Math.random()*moves.length)];

  // Corner priority
  const corners = moves.filter(([r,c])=>(r===0||r===7)&&(c===0||c===7));
  if (corners.length) return corners[Math.floor(Math.random()*corners.length)];

  // Avoid cells next to corners
  const dangerous = new Set(['0-1','1-0','1-1','0-6','1-7','1-6','6-0','7-1','6-1','6-7','7-6','6-6']);

  let best=-1, bestMoves=[];
  for (const [r,c] of moves) {
    let score = getFlips(board,r,c,WHITE).length;
    if(dangerous.has(`${r}-${c}`)) score -= 10;
    // Edge bonus
    if(r===0||r===7||c===0||c===7) score += 3;
    if(score>best){best=score;bestMoves=[[r,c]];}
    else if(score===best) bestMoves.push([r,c]);
  }
  return bestMoves[Math.floor(Math.random()*bestMoves.length)];
}

export default function OthelloGame({ onBack, skipResume }) {
  const [mode, setMode] = useState('menu');
  const [board, setBoard] = useState(createBoard);
  const [currentPlayer, setCurrentPlayer] = useState(BLACK);
  const [winner, setWinner] = useState(null);
  const [difficulty, setDifficulty] = useState('easy');
  const [gameStarted, setGameStarted] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [flipping, setFlipping] = useState(new Set());
  const [lastMove, setLastMove] = useState(null);

  const isGameOver = !!winner;
  const { startTracking, endTracking } = usePlayTracking(`othello_${difficulty}`);

  const { showResumeModal, handleResume, handleNewGame: handleNewFromModal } = useGameSave('othello', { skipResume,
    getState: () => ({ board: board.map(r=>[...r]), currentPlayer, difficulty }),
    onResume: (state) => {
      setBoard(state.board);
      setCurrentPlayer(state.currentPlayer);
      setDifficulty(state.difficulty);
      setGameStarted(true);
      setWinner(null); setLastMove(null); setFlipping(new Set());
      startTracking();
    },
    gameStarted,
    gameOver: isGameOver,
  });

  const validMoves = useMemo(() => getValidMoves(board, currentPlayer), [board, currentPlayer]);
  const validSet = useMemo(() => new Set(validMoves.map(([r,c])=>`${r}-${c}`)), [validMoves]);
  const pieces = useMemo(() => countPieces(board), [board]);

  const checkGameEnd = useCallback((b) => {
    const bMoves = getValidMoves(b, BLACK);
    const wMoves = getValidMoves(b, WHITE);
    if (bMoves.length===0 && wMoves.length===0) {
      const p = countPieces(b);
      setWinner(p.black>p.white?BLACK:p.white>p.black?WHITE:'draw');
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    if (winner === BLACK) {
      confetti({ particleCount:100, spread:70, origin:{y:0.6},
        colors:['#a8d5ba','#f8bbd9','#fff59d','#d1c4e9','#ffccbc'] });
      endTracking('win');
    } else if (winner === WHITE) {
      endTracking('lose');
    } else if (winner === 'draw') {
      endTracking('draw');
    }
  }, [winner, endTracking]);

  // Handle AI turn or pass
  useEffect(() => {
    if (winner || !gameStarted) return;
    if (currentPlayer === WHITE) {
      const moves = getValidMoves(board, WHITE);
      if (moves.length === 0) {
        // Pass
        if (getValidMoves(board, BLACK).length === 0) { checkGameEnd(board); return; }
        setCurrentPlayer(BLACK);
        return;
      }
      setAiThinking(true);
      const timer = setTimeout(() => {
        const move = getAiMove(board, difficulty);
        if (move) {
          const [r,c] = move;
          const flips = getFlips(board,r,c,WHITE);
          const nb = board.map(r=>[...r]);
          nb[r][c] = WHITE;
          setFlipping(new Set(flips.map(([r,c])=>`${r}-${c}`)));
          setTimeout(() => {
            for(const [fr,fc] of flips) nb[fr][fc] = WHITE;
            setBoard(nb.map(r=>[...r]));
            setFlipping(new Set());
            setLastMove([r,c]);
            if (!checkGameEnd(nb)) {
              if (getValidMoves(nb,BLACK).length > 0) setCurrentPlayer(BLACK);
              // else stays WHITE, will trigger this effect again
            }
            setAiThinking(false);
          }, 400);
        } else {
          setAiThinking(false);
        }
      }, 300+Math.random()*300);
      return () => clearTimeout(timer);
    } else {
      // Player turn - check if must pass
      if (validMoves.length === 0) {
        if (getValidMoves(board, WHITE).length === 0) { checkGameEnd(board); return; }
        setTimeout(() => setCurrentPlayer(WHITE), 500);
      }
    }
  }, [currentPlayer, board, winner, gameStarted, difficulty, checkGameEnd, validMoves]);

  const handleClick = useCallback((r, c) => {
    if (winner || aiThinking || currentPlayer !== BLACK) return;
    const flips = getFlips(board, r, c, BLACK);
    if (flips.length === 0) return;

    const nb = board.map(r=>[...r]);
    nb[r][c] = BLACK;
    setFlipping(new Set(flips.map(([r,c])=>`${r}-${c}`)));
    setTimeout(() => {
      for(const [fr,fc] of flips) nb[fr][fc] = BLACK;
      setBoard(nb.map(r=>[...r]));
      setFlipping(new Set());
      setLastMove([r,c]);
      if (!checkGameEnd(nb)) setCurrentPlayer(WHITE);
    }, 400);
  }, [board, winner, aiThinking, currentPlayer, checkGameEnd]);

  const reset = useCallback(() => {
    setBoard(createBoard()); setCurrentPlayer(BLACK); setWinner(null);
    setAiThinking(false); setFlipping(new Set()); setLastMove(null);
  }, []);

  if (mode === 'puzzle') {
    return <OthelloPuzzle onBack={() => setMode('menu')} />;
  }

  if (!gameStarted) {
    return (
      <div className={styles.setup}>
        <h1 className={styles.setupTitle}>🟢 오델로</h1>
        <p className={styles.setupSub}>상대 돌을 뒤집어서 더 많이 차지해요!</p>
        <div className={styles.diffSection}>
          <p className={styles.label}>🎯 난이도</p>
          <div className={styles.diffBtns}>
            <button className={`${styles.diffBtn} ${difficulty==='easy'?styles.active:''}`} onClick={()=>setDifficulty('easy')}>🐣 쉬움</button>
            <button className={`${styles.diffBtn} ${difficulty==='medium'?styles.active:''}`} onClick={()=>setDifficulty('medium')}>🐱 보통</button>
          </div>
        </div>
        <button className={styles.startBtn} onClick={()=>{setGameStarted(true);startTracking();}}>🎮 게임 시작!</button>
        <button className={styles.puzzleBtn} onClick={() => setMode('puzzle')}>🧩 퍼즐</button>
        <button className={styles.backBtn} onClick={onBack}>🏠 홈으로</button>
      </div>
    );
  }

  return (
    <>
    <ResumeModal isOpen={showResumeModal} onResume={handleResume} onNewGame={handleNewFromModal} />
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.homeBtn} onClick={onBack}>🏠</button>
        <h1 className={styles.title}>🟢 오델로</h1>
      </div>

      <div className={styles.scoreBar}>
        <span className={styles.scoreBlack}>⚫ 나: {pieces.black}</span>
        <span className={styles.scoreWhite}>⚪ 컴퓨터: {pieces.white}</span>
      </div>

      <div className={styles.status}>
        {winner===BLACK?'🎉 이겼어요! 🎉':
         winner===WHITE?'😢 졌어요...':
         winner==='draw'?'🤝 비겼어요!':
         aiThinking?'🤔 생각 중...':
         validMoves.length===0?'⏭️ 놓을 곳이 없어요...':'⚫ 내 차례!'}
      </div>

      <div className={styles.boardFrame}>
        <div className={styles.board}>
          {board.map((row, r) => row.map((cell, c) => (
            <button
              key={`${r}-${c}`}
              className={`${styles.cell} ${validSet.has(`${r}-${c}`)&&!winner&&currentPlayer===BLACK?styles.validCell:''} ${lastMove&&lastMove[0]===r&&lastMove[1]===c?styles.lastCell:''}`}
              onClick={() => handleClick(r, c)}
              disabled={!!winner||aiThinking||currentPlayer!==BLACK}
            >
              {cell !== EMPTY && (
                <div className={`${styles.piece} ${cell===BLACK?styles.black:styles.white} ${flipping.has(`${r}-${c}`)?styles.flipping:''}`} />
              )}
            </button>
          )))}
        </div>
      </div>

      <div className={styles.controls}>
        <button className={styles.ctrlBtn} onClick={reset}>🔄 다시!</button>
        <button className={styles.ctrlBtn} onClick={()=>{setGameStarted(false);reset();}}>⚙️ 설정</button>
      </div>
    </div>
    </>
  );
}
