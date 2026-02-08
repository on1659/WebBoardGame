import { useMemo } from 'react';
import styles from './Board.module.css';
import Square from './Square';

export default function Board({
  boardState,
  selectedSquare,
  validMoves,
  kingSquare,
  isCheck,
  lastMove,
  showHighlights,
  onSquareClick,
  isAiThinking,
  pieceStyle,
  hintMove,
}) {
  const validMoveSquares = useMemo(() => {
    return new Set(validMoves.map(m => m.to));
  }, [validMoves]);

  const captureSquares = useMemo(() => {
    return new Set(validMoves.filter(m => m.captured).map(m => m.to));
  }, [validMoves]);

  const squares = useMemo(() => {
    const result = [];

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const file = String.fromCharCode(97 + col); // a-h
        const rank = 8 - row; // 8-1
        const square = `${file}${rank}`;
        const isLight = (row + col) % 2 === 0;
        const piece = boardState[row][col];

        result.push({
          square,
          piece,
          isLight,
          isSelected: square === selectedSquare,
          isValidMove: showHighlights && validMoveSquares.has(square),
          isCapture: showHighlights && captureSquares.has(square),
          isCheck: isCheck && square === kingSquare,
          isLastMove: lastMove && (square === lastMove.from || square === lastMove.to),
          isHint: hintMove && (square === hintMove.from || square === hintMove.to),
        });
      }
    }

    return result;
  }, [boardState, selectedSquare, validMoveSquares, captureSquares, kingSquare, isCheck, lastMove, showHighlights, hintMove]);

  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  return (
    <div className={styles.boardWrapper}>
      <div className={styles.rankLabels}>
        {ranks.map(r => <span key={r} className={styles.label}>{r}</span>)}
      </div>
      <div className={styles.boardInner}>
        <div className={`${styles.board} ${isAiThinking ? styles.thinking : ''}`}>
          {squares.map(sq => (
            <Square
              key={sq.square}
              {...sq}
              onClick={() => onSquareClick(sq.square)}
              pieceStyle={pieceStyle}
            />
          ))}
        </div>
        <div className={styles.fileLabels}>
          {files.map(f => <span key={f} className={styles.label}>{f}</span>)}
        </div>
      </div>
    </div>
  );
}
