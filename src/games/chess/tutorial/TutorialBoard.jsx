import { useMemo } from 'react';
import { Chess } from 'chess.js';
import styles from './TutorialBoard.module.css';
import Piece from '../components/Piece';

export default function TutorialBoard({ fen, highlightSquares = [], onSquareClick, pieceStyle = '2d' }) {
  const boardState = useMemo(() => {
    const chess = new Chess(fen);
    return chess.board();
  }, [fen]);

  const highlightSet = useMemo(() => new Set(highlightSquares), [highlightSquares]);

  const squares = useMemo(() => {
    const result = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const file = String.fromCharCode(97 + col);
        const rank = 8 - row;
        const square = `${file}${rank}`;
        const isLight = (row + col) % 2 === 0;
        const piece = boardState[row][col];
        result.push({ square, piece, isLight, isHighlighted: highlightSet.has(square) });
      }
    }
    return result;
  }, [boardState, highlightSet]);

  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  return (
    <div className={styles.boardWrapper}>
      <div className={styles.rankLabels}>
        {ranks.map(r => <span key={r} className={styles.label}>{r}</span>)}
      </div>
      <div className={styles.boardInner}>
        <div className={styles.board}>
          {squares.map(sq => (
            <div
              key={sq.square}
              className={`${styles.square} ${sq.isLight ? styles.light : styles.dark} ${sq.isHighlighted ? styles.highlighted : ''}`}
              onClick={() => onSquareClick?.(sq.square)}
            >
              {sq.piece && (
                <Piece type={sq.piece.type} color={sq.piece.color} pieceStyle={pieceStyle} />
              )}
            </div>
          ))}
        </div>
        <div className={styles.fileLabels}>
          {files.map(f => <span key={f} className={styles.label}>{f}</span>)}
        </div>
      </div>
    </div>
  );
}
