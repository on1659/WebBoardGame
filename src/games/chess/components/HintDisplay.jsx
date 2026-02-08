import styles from './HintDisplay.module.css';

export default function HintDisplay({ reason, onDismiss }) {
  if (!reason) return null;

  return (
    <div className={styles.container} onClick={onDismiss}>
      <span className={styles.icon}>💡</span>
      <p className={styles.text}>{reason}</p>
      <span className={styles.dismiss}>터치하면 닫혀요</span>
    </div>
  );
}
