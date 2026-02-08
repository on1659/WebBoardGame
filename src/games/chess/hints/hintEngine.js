import { Chess } from 'chess.js';
import { evaluateBoard } from '../engine/evaluation';

const PIECE_VALUES = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
const PIECE_NAMES = { p: '폰', n: '나이트', b: '비숍', r: '룩', q: '퀸', k: '킹' };

/**
 * Find a good move and explain it in kid-friendly Korean
 */
export function getHint(chess) {
  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) return null;

  // Score each move
  const scored = moves.map(move => {
    const clone = new Chess(chess.fen());
    clone.move(move);

    // Check for checkmate
    if (clone.isCheckmate()) {
      return { move, score: 10000, reason: '이 수를 두면 체크메이트야! 이길 수 있어! 🏆' };
    }

    // Check for check
    if (clone.isCheck()) {
      return { move, score: 500, reason: `${PIECE_NAMES[move.piece]}을(를) 여기로 옮기면 체크! 킹을 공격할 수 있어! ⚡` };
    }

    // Capture a piece
    if (move.captured) {
      const capturedName = PIECE_NAMES[move.captured];
      const capValue = PIECE_VALUES[move.captured];
      const myValue = PIECE_VALUES[move.piece];

      if (capValue >= myValue) {
        return {
          move,
          score: 200 + capValue * 10,
          reason: `${PIECE_NAMES[move.piece]}(으)로 상대 ${capturedName}을(를) 잡을 수 있어! 🎯`,
        };
      }
    }

    // General evaluation
    const eval_ = -evaluateBoard(clone); // from white's perspective
    return { move, score: eval_, reason: `${PIECE_NAMES[move.piece]}을(를) 여기로 옮기면 좋은 자리야! 👍` };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0];
}

/**
 * Check if a move is a blunder (loses significant material)
 * Returns explanation string or null if not a blunder
 */
export function checkBlunder(chess, from, to) {
  const moves = chess.moves({ verbose: true });
  const move = moves.find(m => m.from === from && m.to === to);
  if (!move) return null;

  // Simulate the move
  const clone = new Chess(chess.fen());
  clone.move(move);

  // Evaluate before and after
  const evalBefore = -evaluateBoard(chess); // from white's perspective (positive = good for white)
  
  // Let opponent make best response
  const oppMoves = clone.moves({ verbose: true });
  let worstEval = Infinity;
  
  for (const oppMove of oppMoves) {
    const clone2 = new Chess(clone.fen());
    clone2.move(oppMove);
    const evalAfter = -evaluateBoard(clone2);
    if (evalAfter < worstEval) {
      worstEval = evalAfter;
    }
  }

  if (oppMoves.length === 0) worstEval = evalBefore;

  const loss = evalBefore - worstEval;

  // Only warn for significant blunders (losing a piece or more)
  if (loss >= 250) {
    // Check if moving into an unprotected square
    if (move.captured) {
      const myValue = PIECE_VALUES[move.piece];
      const capturedValue = PIECE_VALUES[move.captured];
      if (myValue > capturedValue + 1) {
        return `${PIECE_NAMES[move.piece]}이(가) 잡힐 수도 있어! 정말 이렇게 둘래? 🤔`;
      }
    }
    return `이 수를 두면 말을 잃을 수도 있어요! 정말 이렇게 둘래? 🤔`;
  }

  return null;
}
