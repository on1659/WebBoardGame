import styles from './GameInfo.module.css';

const PIECE_DISPLAY = {
  q: '♛',
  r: '♜',
  b: '♝',
  n: '♞',
  p: '♟',
};

export default function GameInfo({
  currentTurn,
  isAiThinking,
  isCheck,
  capturedPieces,
  difficulty,
}) {
  const difficultyEmoji = {
    easy: '🐣',
    normal: '🐱',
    hard: '🦁',
  };

  return (
    <div className={styles.container}>
      <div className={styles.turnIndicator}>
        {isAiThinking ? (
          <span className={styles.thinking}>
            {difficultyEmoji[difficulty]} AI가 생각 중...
          </span>
        ) : currentTurn === 'player' ? (
          <span className={styles.playerTurn}>
            ✨ 네 차례!
          </span>
        ) : null}

        {isCheck && !isAiThinking && (
          <span className={styles.check}>체크!</span>
        )}
      </div>

      <div className={styles.capturedSection}>
        <div className={styles.capturedRow}>
          <span className={styles.capturedLabel}>내가 잡은 기물:</span>
          <div className={styles.capturedPieces}>
            {capturedPieces.player.length > 0 ? (
              capturedPieces.player.map((p, i) => (
                <span key={i} className={styles.capturedPiece} data-color="b">
                  {PIECE_DISPLAY[p.type]}
                </span>
              ))
            ) : (
              <span className={styles.noPieces}>-</span>
            )}
          </div>
        </div>

        <div className={styles.capturedRow}>
          <span className={styles.capturedLabel}>AI가 잡은 기물:</span>
          <div className={styles.capturedPieces}>
            {capturedPieces.ai.length > 0 ? (
              capturedPieces.ai.map((p, i) => (
                <span key={i} className={styles.capturedPiece} data-color="w">
                  {PIECE_DISPLAY[p.type]}
                </span>
              ))
            ) : (
              <span className={styles.noPieces}>-</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
