import { useState, useCallback, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useGameSave } from '../../hooks/useGameSave';
import ResumeModal from '../../components/ResumeModal';
import styles from './TicTacToeGame.module.css';

const EMPTY = null;
const X = 'X';
const O = 'O';

const WIN_LINES = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6],
];

function checkWinner(board) {
  for (const [a,b,c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c])
      return { winner: board[a], line: [a,b,c] };
  }
  return null;
}

function getAiMove(board, difficulty) {
  const empty = board.map((v,i) => v === EMPTY ? i : -1).filter(i => i >= 0);
  if (empty.length === 0) return -1;

  // Easy: random
  if (difficulty === 'easy') return empty[Math.floor(Math.random() * empty.length)];

  // Medium: block wins, take wins, else random
  // Check if AI can win
  for (const i of empty) {
    const b = [...board]; b[i] = O;
    if (checkWinner(b)?.winner === O) return i;
  }
  // Block player win
  for (const i of empty) {
    const b = [...board]; b[i] = X;
    if (checkWinner(b)?.winner === X) return i;
  }
  // Take center
  if (board[4] === EMPTY) return 4;
  // Take corner
  const corners = [0,2,6,8].filter(i => board[i] === EMPTY);
  if (corners.length > 0) return corners[Math.floor(Math.random() * corners.length)];
  return empty[Math.floor(Math.random() * empty.length)];
}

export default function TicTacToeGame({ onBack }) {
  const [board, setBoard] = useState(Array(9).fill(EMPTY));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [result, setResult] = useState(null); // { winner, line } or 'draw'
  const [difficulty, setDifficulty] = useState('easy');
  const [gameStarted, setGameStarted] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [scores, setScores] = useState({ player: 0, ai: 0, draw: 0 });

  const isGameOver = !!result;

  const { showResumeModal, handleResume, handleNewGame: handleNewFromModal } = useGameSave('tictactoe', {
    getState: () => ({ board, currentPlayer: isPlayerTurn ? 'X' : 'O', difficulty, scores }),
    onResume: (state) => {
      setBoard(state.board);
      setIsPlayerTurn(state.currentPlayer === 'X');
      setDifficulty(state.difficulty);
      setScores(state.scores || { player: 0, ai: 0, draw: 0 });
      setGameStarted(true);
      setResult(null);
    },
    gameStarted,
    gameOver: isGameOver,
  });

  useEffect(() => {
    if (result?.winner === X) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 },
        colors: ['#a8d5ba','#f8bbd9','#fff59d','#d1c4e9','#ffccbc'] });
    }
  }, [result]);

  const handleClick = useCallback((i) => {
    if (board[i] !== EMPTY || !isPlayerTurn || result || aiThinking) return;
    const newBoard = [...board];
    newBoard[i] = X;
    setBoard(newBoard);

    const win = checkWinner(newBoard);
    if (win) { setResult(win); setScores(s => ({...s, player: s.player+1})); return; }
    if (newBoard.every(v => v !== EMPTY)) { setResult('draw'); setScores(s => ({...s, draw: s.draw+1})); return; }

    setIsPlayerTurn(false);
    setAiThinking(true);
    setTimeout(() => {
      const move = getAiMove(newBoard, difficulty);
      if (move >= 0) {
        newBoard[move] = O;
        setBoard([...newBoard]);
        const w = checkWinner(newBoard);
        if (w) { setResult(w); setScores(s => ({...s, ai: s.ai+1})); }
        else if (newBoard.every(v => v !== EMPTY)) { setResult('draw'); setScores(s => ({...s, draw: s.draw+1})); }
      }
      setIsPlayerTurn(true);
      setAiThinking(false);
    }, 300 + Math.random() * 300);
  }, [board, isPlayerTurn, result, aiThinking, difficulty]);

  const reset = useCallback(() => {
    setBoard(Array(9).fill(EMPTY));
    setIsPlayerTurn(true);
    setResult(null);
    setAiThinking(false);
  }, []);

  if (!gameStarted) {
    return (
      <div className={styles.setup}>
        <h1 className={styles.setupTitle}>❌⭕ 틱택토</h1>
        <p className={styles.setupSub}>세 개를 한 줄로 놓으면 이겨요!</p>
        <div className={styles.diffSection}>
          <p className={styles.label}>🎯 난이도</p>
          <div className={styles.diffBtns}>
            <button className={`${styles.diffBtn} ${difficulty==='easy'?styles.active:''}`} onClick={()=>setDifficulty('easy')}>🐣 쉬움</button>
            <button className={`${styles.diffBtn} ${difficulty==='medium'?styles.active:''}`} onClick={()=>setDifficulty('medium')}>🐱 보통</button>
          </div>
        </div>
        <button className={styles.startBtn} onClick={()=>setGameStarted(true)}>🎮 게임 시작!</button>
        <button className={styles.backBtn} onClick={onBack}>🏠 홈으로</button>
      </div>
    );
  }

  const winLine = result?.line || [];

  return (
    <>
    <ResumeModal isOpen={showResumeModal} onResume={handleResume} onNewGame={handleNewFromModal} />
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.homeBtn} onClick={onBack}>🏠</button>
        <h1 className={styles.title}>❌⭕ 틱택토</h1>
      </div>

      <div className={styles.scoreBar}>
        <span>❌ 나: {scores.player}</span>
        <span>🤝 무승부: {scores.draw}</span>
        <span>⭕ 컴퓨터: {scores.ai}</span>
      </div>

      <div className={styles.status}>
        {result === 'draw' ? '🤝 비겼어요!' :
         result?.winner === X ? '🎉 이겼어요! 🎉' :
         result?.winner === O ? '😢 졌어요...' :
         aiThinking ? '🤔 생각 중...' : '❌ 내 차례!'}
      </div>

      <div className={styles.board}>
        {board.map((cell, i) => (
          <button
            key={i}
            className={`${styles.cell} ${winLine.includes(i)?styles.winCell:''} ${cell?styles.filled:''}`}
            onClick={() => handleClick(i)}
            disabled={!!result || aiThinking || cell !== EMPTY}
          >
            {cell === X && <span className={styles.x}>✕</span>}
            {cell === O && <span className={styles.o}>○</span>}
          </button>
        ))}
      </div>

      <div className={styles.controls}>
        <button className={styles.ctrlBtn} onClick={reset}>🔄 다시!</button>
        <button className={styles.ctrlBtn} onClick={()=>setGameStarted(false)}>⚙️ 설정</button>
      </div>
    </div>
    </>
  );
}
