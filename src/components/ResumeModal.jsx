import styles from './ResumeModal.module.css';

export default function ResumeModal({ isOpen, onResume, onNewGame }) {
  if (!isOpen) return null;
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>이어서 할래? 🎮</h2>
        <p className={styles.desc}>저번에 하던 게임이 있어요!</p>
        <div className={styles.buttons}>
          <button className={styles.resumeBtn} onClick={onResume}>
            ▶️ 이어하기
          </button>
          <button className={styles.newBtn} onClick={onNewGame}>
            🆕 새 게임
          </button>
        </div>
      </div>
    </div>
  );
}
