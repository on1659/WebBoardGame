import { useEffect, useRef } from 'react';
import styles from './MoveHistory.module.css';

export default function MoveHistory({ moves }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [moves]);

  const movePairs = [];
  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push({
      number: Math.floor(i / 2) + 1,
      white: moves[i],
      black: moves[i + 1] || null,
    });
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>기보</h3>
      <div className={styles.moves} ref={containerRef}>
        {movePairs.length === 0 ? (
          <p className={styles.empty}>아직 기록이 없어요</p>
        ) : (
          movePairs.map(pair => (
            <div key={pair.number} className={styles.moveRow}>
              <span className={styles.moveNumber}>{pair.number}.</span>
              <span className={styles.move}>{pair.white}</span>
              {pair.black && <span className={styles.move}>{pair.black}</span>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
