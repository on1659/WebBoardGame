import { useMemo } from 'react';
import styles from './BadukTutorialBoard.module.css';

const EMPTY = 0, BLACK = 1, WHITE = 2;

function isStarPoint(r, c, size) {
  if (size === 9) return (r === 2 || r === 4 || r === 6) && (c === 2 || c === 4 || c === 6);
  return false;
}

export default function BadukTutorialBoard({
  boardSize = 9,
  stones = [],      // [{r, c, color}]
  highlights = [],   // [{r, c}]
  onCellClick,       // (r, c) => void
  annotation,        // optional text to show on board
  lastMove,          // {r, c} optional
}) {
  const grid = useMemo(() => {
    const g = Array.from({ length: boardSize }, () => Array(boardSize).fill(EMPTY));
    for (const s of stones) {
      if (s.r >= 0 && s.r < boardSize && s.c >= 0 && s.c < boardSize) {
        g[s.r][s.c] = s.color;
      }
    }
    return g;
  }, [stones, boardSize]);

  const highlightSet = useMemo(() => {
    const s = new Set();
    for (const h of highlights) s.add(`${h.r},${h.c}`);
    return s;
  }, [highlights]);

  const maxPx = Math.min(typeof window !== 'undefined' ? window.innerWidth - 48 : 400, 420);
  const cellSize = Math.min(Math.floor(maxPx / boardSize), 44);

  return (
    <div className={styles.wrapper}>
      <div
        className={styles.board}
        style={{
          gridTemplateColumns: `repeat(${boardSize}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${boardSize}, ${cellSize}px)`,
        }}
      >
        {grid.map((row, r) =>
          row.map((cell, c) => {
            const isHighlighted = highlightSet.has(`${r},${c}`);
            const isLast = lastMove && lastMove.r === r && lastMove.c === c;
            return (
              <button
                key={`${r}-${c}`}
                className={`${styles.cell} ${isHighlighted ? styles.highlighted : ''}`}
                style={{ width: cellSize, height: cellSize }}
                onClick={() => onCellClick?.(r, c)}
              >
                <div className={styles.gridLines}>
                  <div className={`${styles.hLine} ${c === 0 ? styles.hLineLeft : ''} ${c === boardSize - 1 ? styles.hLineRight : ''}`} />
                  <div className={`${styles.vLine} ${r === 0 ? styles.vLineTop : ''} ${r === boardSize - 1 ? styles.vLineBottom : ''}`} />
                </div>
                {isStarPoint(r, c, boardSize) && cell === EMPTY && !isHighlighted && (
                  <div className={styles.starPoint} />
                )}
                {isHighlighted && cell === EMPTY && (
                  <div className={styles.highlightDot} />
                )}
                {cell !== EMPTY && (
                  <div className={`${styles.stone} ${cell === BLACK ? styles.blackStone : styles.whiteStone} ${isLast ? styles.stoneNew : ''} ${isHighlighted ? styles.stoneHighlighted : ''}`} />
                )}
              </button>
            );
          })
        )}
      </div>
      {annotation && <div className={styles.annotation}>{annotation}</div>}
    </div>
  );
}
