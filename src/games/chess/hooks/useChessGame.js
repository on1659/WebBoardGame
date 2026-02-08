import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Chess } from 'chess.js';
import { calculateBestMove } from '../engine/ai';

const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export function useChessGame(initialDifficulty = 'easy') {
  const chessRef = useRef(new Chess());

  const [position, setPosition] = useState(INITIAL_FEN);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [gameStatus, setGameStatus] = useState('playing');
  const [winner, setWinner] = useState(null);
  const [moveHistory, setMoveHistory] = useState([]);
  const [showHighlights, setShowHighlights] = useState(true);
  const [lastMove, setLastMove] = useState(null);
  const [pieceStyle, setPieceStyle] = useState('2d'); // '2d' | '3d'

  const currentTurn = useMemo(() =>
    chessRef.current.turn() === 'w' ? 'player' : 'ai',
    [position]
  );

  const isCheck = useMemo(() =>
    chessRef.current.isCheck(),
    [position]
  );

  const kingSquare = useMemo(() => {
    if (!isCheck) return null;
    const board = chessRef.current.board();
    const kingColor = chessRef.current.turn();
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.type === 'k' && piece.color === kingColor) {
          const file = String.fromCharCode(97 + col);
          const rank = 8 - row;
          return `${file}${rank}`;
        }
      }
    }
    return null;
  }, [isCheck, position]);

  const validMoves = useMemo(() => {
    if (!selectedSquare) return [];
    return chessRef.current.moves({
      square: selectedSquare,
      verbose: true
    });
  }, [selectedSquare, position]);

  const capturedPieces = useMemo(() => {
    const initial = { w: { p: 8, n: 2, b: 2, r: 2, q: 1 }, b: { p: 8, n: 2, b: 2, r: 2, q: 1 } };
    const current = { w: { p: 0, n: 0, b: 0, r: 0, q: 0 }, b: { p: 0, n: 0, b: 0, r: 0, q: 0 } };

    const board = chessRef.current.board();
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.type !== 'k') {
          current[piece.color][piece.type]++;
        }
      }
    }

    const captured = { player: [], ai: [] };

    // AI captured by player (black pieces missing)
    for (const type of ['q', 'r', 'b', 'n', 'p']) {
      const count = initial.b[type] - current.b[type];
      for (let i = 0; i < count; i++) {
        captured.player.push({ type, color: 'b' });
      }
    }

    // Player captured by AI (white pieces missing)
    for (const type of ['q', 'r', 'b', 'n', 'p']) {
      const count = initial.w[type] - current.w[type];
      for (let i = 0; i < count; i++) {
        captured.ai.push({ type, color: 'w' });
      }
    }

    return captured;
  }, [position]);

  const checkGameEnd = useCallback(() => {
    const chess = chessRef.current;
    if (chess.isCheckmate()) {
      setGameStatus('checkmate');
      setWinner(chess.turn() === 'w' ? 'ai' : 'player');
      return true;
    }
    if (chess.isStalemate()) {
      setGameStatus('stalemate');
      return true;
    }
    if (chess.isDraw()) {
      setGameStatus('draw');
      return true;
    }
    return false;
  }, []);

  const triggerAiMove = useCallback(async () => {
    setIsAiThinking(true);

    // Artificial delay for child-friendly UX
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));

    const aiMove = calculateBestMove(chessRef.current, difficulty);

    if (aiMove) {
      chessRef.current.move(aiMove);
      setPosition(chessRef.current.fen());
      setMoveHistory(prev => [...prev, aiMove.san]);
      setLastMove({ from: aiMove.from, to: aiMove.to });
      checkGameEnd();
    }

    setIsAiThinking(false);
  }, [difficulty, checkGameEnd]);

  const makeMove = useCallback((from, to) => {
    const moves = chessRef.current.moves({ square: from, verbose: true });
    const move = moves.find(m => m.to === to);

    if (!move) return false;

    // Handle promotion - auto queen for 7-year-old
    const moveOptions = { from, to };
    if (move.flags.includes('p')) {
      moveOptions.promotion = 'q';
    }

    try {
      const result = chessRef.current.move(moveOptions);
      setPosition(chessRef.current.fen());
      setMoveHistory(prev => [...prev, result.san]);
      setLastMove({ from, to });
      setSelectedSquare(null);

      if (!checkGameEnd() && chessRef.current.turn() === 'b') {
        triggerAiMove();
      }
      return true;
    } catch (e) {
      return false;
    }
  }, [checkGameEnd, triggerAiMove]);

  const selectSquare = useCallback((square) => {
    // Can't interact during AI turn or game over
    if (isAiThinking || gameStatus !== 'playing') return;

    const piece = chessRef.current.get(square);

    // If no piece is selected
    if (!selectedSquare) {
      // Can only select player's pieces (white)
      if (piece && piece.color === 'w') {
        setSelectedSquare(square);
      }
      return;
    }

    // If clicking the same square, deselect
    if (square === selectedSquare) {
      setSelectedSquare(null);
      return;
    }

    // If clicking another player piece, select it instead
    if (piece && piece.color === 'w') {
      setSelectedSquare(square);
      return;
    }

    // Try to move
    const moved = makeMove(selectedSquare, square);
    if (!moved) {
      setSelectedSquare(null);
    }
  }, [selectedSquare, isAiThinking, gameStatus, makeMove]);

  const undo = useCallback(() => {
    if (isAiThinking || moveHistory.length < 2) return;

    // Undo both AI and player moves
    chessRef.current.undo(); // AI move
    chessRef.current.undo(); // Player move

    setPosition(chessRef.current.fen());
    setMoveHistory(prev => prev.slice(0, -2));
    setSelectedSquare(null);
    setLastMove(null);
    setGameStatus('playing');
    setWinner(null);
  }, [isAiThinking, moveHistory.length]);

  const newGame = useCallback((newDifficulty) => {
    chessRef.current.reset();
    setPosition(INITIAL_FEN);
    setSelectedSquare(null);
    setDifficulty(newDifficulty || difficulty);
    setIsAiThinking(false);
    setGameStatus('playing');
    setWinner(null);
    setMoveHistory([]);
    setLastMove(null);
  }, [difficulty]);

  const getBoardState = useCallback(() => {
    return chessRef.current.board();
  }, [position]);

  return {
    // State
    position,
    selectedSquare,
    validMoves,
    currentTurn,
    isAiThinking,
    isCheck,
    kingSquare,
    gameStatus,
    winner,
    moveHistory,
    capturedPieces,
    difficulty,
    showHighlights,
    lastMove,
    pieceStyle,

    // Actions
    selectSquare,
    makeMove,
    undo,
    newGame,
    setDifficulty,
    setShowHighlights,
    setPieceStyle,
    getBoardState,
  };
}
