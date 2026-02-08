import { useState, useCallback, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { useGameSave } from '../../hooks/useGameSave';
import { usePlayTracking } from '../../hooks/usePlayTracking';
import ResumeModal from '../../components/ResumeModal';
import styles from './Connect4Game.module.css';

const ROWS = 6, COLS = 7;
const EMPTY = 0, PLAYER = 1, AI = 2;

function createBoard() { return Array.from({length:ROWS}, ()=>Array(COLS).fill(EMPTY)); }

function dropRow(board, col) {
  for (let r = ROWS-1; r >= 0; r--) if (board[r][col] === EMPTY) return r;
  return -1;
}

function checkWin(board, row, col, player) {
  const dirs = [[0,1],[1,0],[1,1],[1,-1]];
  for (const [dr,dc] of dirs) {
    let count = 1;
    for (let i=1;i<4;i++) { const r=row+dr*i,c=col+dc*i; if(r<0||r>=ROWS||c<0||c>=COLS||board[r][c]!==player)break; count++; }
    for (let i=1;i<4;i++) { const r=row-dr*i,c=col-dc*i; if(r<0||r>=ROWS||c<0||c>=COLS||board[r][c]!==player)break; count++; }
    if (count >= 4) return true;
  }
  return false;
}

function getWinCells(board, row, col, player) {
  const dirs = [[0,1],[1,0],[1,1],[1,-1]];
  for (const [dr,dc] of dirs) {
    const cells = [[row,col]];
    for (let i=1;i<4;i++){const r=row+dr*i,c=col+dc*i;if(r<0||r>=ROWS||c<0||c>=COLS||board[r][c]!==player)break;cells.push([r,c]);}
    for (let i=1;i<4;i++){const r=row-dr*i,c=col-dc*i;if(r<0||r>=ROWS||c<0||c>=COLS||board[r][c]!==player)break;cells.push([r,c]);}
    if (cells.length >= 4) return cells;
  }
  return [];
}

function scoreCol(board, col, player) {
  const r = dropRow(board, col);
  if (r < 0) return -Infinity;
  const b = board.map(r=>[...r]); b[r][col] = player;
  if (checkWin(b,r,col,player)) return 100000;
  // Score based on potential
  let score = 0;
  const dirs = [[0,1],[1,0],[1,1],[1,-1]];
  for (const [dr,dc] of dirs) {
    let count=1,open=0;
    for(let i=1;i<4;i++){const nr=r+dr*i,nc=col+dc*i;if(nr<0||nr>=ROWS||nc<0||nc>=COLS)break;if(b[nr][nc]===player)count++;else if(b[nr][nc]===EMPTY)open++;else break;}
    for(let i=1;i<4;i++){const nr=r-dr*i,nc=col-dc*i;if(nr<0||nr>=ROWS||nc<0||nc>=COLS)break;if(b[nr][nc]===player)count++;else if(b[nr][nc]===EMPTY)open++;else break;}
    if(count>=3)score+=500; else if(count>=2&&open>=1)score+=50; else score+=count*5;
  }
  // Prefer center
  score += (3 - Math.abs(col - 3)) * 3;
  return score;
}

function getAiMove(board, difficulty) {
  const valid = [];
  for (let c=0;c<COLS;c++) if(dropRow(board,c)>=0) valid.push(c);
  if (!valid.length) return -1;

  if (difficulty === 'easy' && Math.random() < 0.4)
    return valid[Math.floor(Math.random()*valid.length)];

  // Check AI win
  for (const c of valid) { const r=dropRow(board,c); const b=board.map(r=>[...r]); b[r][c]=AI; if(checkWin(b,r,c,AI)) return c; }
  // Block player win
  for (const c of valid) { const r=dropRow(board,c); const b=board.map(r=>[...r]); b[r][c]=PLAYER; if(checkWin(b,r,c,PLAYER)) return c; }

  let best=-Infinity, bestCols=[];
  for (const c of valid) {
    const s = scoreCol(board,c,AI)*1.1 + scoreCol(board,c,PLAYER);
    if(s>best){best=s;bestCols=[c];}else if(s===best)bestCols.push(c);
  }
  return bestCols[Math.floor(Math.random()*bestCols.length)];
}

export default function Connect4Game({ onBack }) {
  const [board, setBoard] = useState(createBoard);
  const [winner, setWinner] = useState(null);
  const [winCells, setWinCells] = useState([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [aiThinking, setAiThinking] = useState(false);
  const [difficulty, setDifficulty] = useState('easy');
  const [gameStarted, setGameStarted] = useState(false);
  const [lastDrop, setLastDrop] = useState(null);
  const [hoverCol, setHoverCol] = useState(-1);

  const isGameOver = !!winner;
  const { startTracking, endTracking } = usePlayTracking('connect4');

  const { showResumeModal, handleResume, handleNewGame: handleNewFromModal } = useGameSave('connect4', {
    getState: () => ({ board: board.map(r=>[...r]), currentPlayer: isPlayerTurn ? PLAYER : AI, difficulty }),
    onResume: (state) => {
      setBoard(state.board);
      setIsPlayerTurn(state.currentPlayer === PLAYER);
      setDifficulty(state.difficulty);
      setGameStarted(true);
      setWinner(null); setWinCells([]); setLastDrop(null);
      startTracking();
    },
    gameStarted,
    gameOver: isGameOver,
  });

  const isFull = useMemo(() => board[0].every(c => c !== EMPTY), [board]);

  useEffect(() => {
    if (winner === PLAYER) {
      confetti({ particleCount: 100, spread: 70, origin:{y:0.6}, colors:['#e91e63','#ff5722','#ffc107','#4caf50','#2196f3'] });
      endTracking('win');
    } else if (winner === AI) {
      endTracking('lose');
    } else if (winner === 'draw') {
      endTracking('draw');
    }
  }, [winner, endTracking]);

  const handleDrop = useCallback((col) => {
    if (winner || aiThinking || !isPlayerTurn) return;
    const row = dropRow(board, col);
    if (row < 0) return;
    const nb = board.map(r=>[...r]); nb[row][col] = PLAYER;
    setBoard(nb); setLastDrop([row,col]);
    if (checkWin(nb,row,col,PLAYER)) { setWinner(PLAYER); setWinCells(getWinCells(nb,row,col,PLAYER)); return; }
    if (nb[0].every(c=>c!==EMPTY)) { setWinner('draw'); return; }
    setIsPlayerTurn(false); setAiThinking(true);
    setTimeout(() => {
      const ac = getAiMove(nb, difficulty);
      if (ac >= 0) {
        const ar = dropRow(nb,ac); nb[ar][ac] = AI;
        setBoard([...nb.map(r=>[...r])]); setLastDrop([ar,ac]);
        if (checkWin(nb,ar,ac,AI)) { setWinner(AI); setWinCells(getWinCells(nb,ar,ac,AI)); }
        else if (nb[0].every(c=>c!==EMPTY)) setWinner('draw');
      }
      setIsPlayerTurn(true); setAiThinking(false);
    }, 400+Math.random()*300);
  }, [board, winner, aiThinking, isPlayerTurn, difficulty]);

  const reset = useCallback(() => {
    setBoard(createBoard()); setWinner(null); setWinCells([]);
    setIsPlayerTurn(true); setAiThinking(false); setLastDrop(null);
  }, []);

  const winSet = useMemo(() => new Set(winCells.map(([r,c])=>`${r}-${c}`)), [winCells]);

  if (!gameStarted) {
    return (
      <div className={styles.setup}>
        <h1 className={styles.setupTitle}>🔴🟡 사목</h1>
        <p className={styles.setupSub}>네 개를 한 줄로 놓으면 이겨요!</p>
        <div className={styles.diffSection}>
          <p className={styles.label}>🎯 난이도</p>
          <div className={styles.diffBtns}>
            <button className={`${styles.diffBtn} ${difficulty==='easy'?styles.active:''}`} onClick={()=>setDifficulty('easy')}>🐣 쉬움</button>
            <button className={`${styles.diffBtn} ${difficulty==='medium'?styles.active:''}`} onClick={()=>setDifficulty('medium')}>🐱 보통</button>
          </div>
        </div>
        <button className={styles.startBtn} onClick={()=>{setGameStarted(true);startTracking();}}>🎮 게임 시작!</button>
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
        <h1 className={styles.title}>🔴🟡 사목</h1>
      </div>
      <div className={styles.status}>
        {winner === PLAYER ? '🎉 이겼어요! 🎉' :
         winner === AI ? '😢 졌어요...' :
         winner === 'draw' ? '🤝 비겼어요!' :
         aiThinking ? '🤔 생각 중...' : '🔴 내 차례! 칸을 눌러요!'}
      </div>
      <div className={styles.boardFrame}>
        <div className={styles.board}>
          {board.map((row, r) => row.map((cell, c) => (
            <button
              key={`${r}-${c}`}
              className={`${styles.cell} ${winSet.has(`${r}-${c}`)?styles.winCell:''} ${hoverCol===c&&!winner?styles.hoverCell:''}`}
              onClick={() => handleDrop(c)}
              onMouseEnter={() => setHoverCol(c)}
              onMouseLeave={() => setHoverCol(-1)}
              disabled={!!winner||aiThinking||!isPlayerTurn}
            >
              <div className={`${styles.piece} ${cell===PLAYER?styles.red:cell===AI?styles.yellow:''} ${lastDrop&&lastDrop[0]===r&&lastDrop[1]===c?styles.dropping:''}`} />
            </button>
          )))}
        </div>
      </div>
      <div className={styles.controls}>
        <button className={styles.ctrlBtn} onClick={reset}>🔄 다시!</button>
        <button className={styles.ctrlBtn} onClick={()=>setGameStarted(false)}>⚙️ 설정</button>
      </div>
    </div>
    </>
  );
}
