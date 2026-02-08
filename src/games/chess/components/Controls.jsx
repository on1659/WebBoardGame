import styles from './Controls.module.css';

export default function Controls({
  onUndo,
  onNewGame,
  onOpenSettings,
  canUndo,
  isAiThinking,
}) {
  return (
    <div className={styles.container}>
      <button
        className={styles.button}
        onClick={onUndo}
        disabled={!canUndo || isAiThinking}
      >
        ↩️ 무르기
      </button>

      <button
        className={styles.button}
        onClick={onNewGame}
        disabled={isAiThinking}
      >
        🔄 새 게임
      </button>

      <button
        className={`${styles.button} ${styles.settingsButton}`}
        onClick={onOpenSettings}
      >
        ⚙️
      </button>
    </div>
  );
}
