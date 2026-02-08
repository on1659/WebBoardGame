import { evaluateBoard } from './evaluation';

const DEPTH_CONFIG = {
  easy: { depth: 1, randomness: 0.3 },
  normal: { depth: 2, randomness: 0 },
  hard: { depth: 3, randomness: 0 }
};

/**
 * Calculate the best move for the AI
 * @param {Chess} chess - chess.js instance
 * @param {string} difficulty - 'easy' | 'normal' | 'hard'
 * @returns {Object|null} - Best move or null if no moves available
 */
export function calculateBestMove(chess, difficulty) {
  const config = DEPTH_CONFIG[difficulty] || DEPTH_CONFIG.easy;
  const moves = chess.moves({ verbose: true });

  if (moves.length === 0) return null;

  // Easy mode: sometimes make random moves to be beatable
  if (difficulty === 'easy' && Math.random() < config.randomness) {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  let bestMove = null;
  let bestValue = -Infinity;

  // Shuffle moves for variety when equal
  const shuffledMoves = shuffleArray([...moves]);

  for (const move of shuffledMoves) {
    chess.move(move);
    const value = minimax(chess, config.depth - 1, -Infinity, Infinity, false);
    chess.undo();

    if (value > bestValue) {
      bestValue = value;
      bestMove = move;
    }
  }

  return bestMove;
}

/**
 * Minimax algorithm with Alpha-Beta pruning
 * @param {Chess} chess - chess.js instance
 * @param {number} depth - remaining depth to search
 * @param {number} alpha - alpha value for pruning
 * @param {number} beta - beta value for pruning
 * @param {boolean} isMaximizing - true if maximizing player (AI/black)
 * @returns {number} - evaluation score
 */
function minimax(chess, depth, alpha, beta, isMaximizing) {
  // Terminal conditions
  if (depth === 0) {
    return evaluateBoard(chess);
  }

  if (chess.isGameOver()) {
    if (chess.isCheckmate()) {
      // If it's checkmate and it's white's turn, black wins (good for AI)
      // If it's checkmate and it's black's turn, white wins (bad for AI)
      return isMaximizing ? -100000 + depth : 100000 - depth;
    }
    return 0; // Draw (stalemate, repetition, etc.)
  }

  const moves = chess.moves({ verbose: true });

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      chess.move(move);
      const evalScore = minimax(chess, depth - 1, alpha, beta, false);
      chess.undo();
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break; // Beta cutoff
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      chess.move(move);
      const evalScore = minimax(chess, depth - 1, alpha, beta, true);
      chess.undo();
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break; // Alpha cutoff
    }
    return minEval;
  }
}

/**
 * Fisher-Yates shuffle
 */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
