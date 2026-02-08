import styles from './BlunderModal.module.css';

export default function BlunderModal({ isOpen, message, onConfirm, onUndo }) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <p className={styles.message}>{message}</p>
        <div className={styles.buttons}>
          <button className={styles.undoButton} onClick={onUndo}>
            ↩️ 다시 생각할래!
          </button>
          <button className={styles.confirmButton} onClick={onConfirm}>
            👍 이대로 둘래!
          </button>
        </div>
      </div>
    </div>
  );
}
