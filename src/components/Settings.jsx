import styles from './Settings.module.css';

const difficulties = [
  { id: 'easy', label: '쉬움', emoji: '🐣' },
  { id: 'normal', label: '보통', emoji: '🐱' },
  { id: 'hard', label: '어려움', emoji: '🦁' },
];

const pieceStyles = [
  { id: '2d', label: '심플', icon: '♟' },
  { id: '3d', label: '입체', icon: '🎨' },
];

export default function Settings({
  isOpen,
  onClose,
  difficulty,
  onDifficultyChange,
  showHighlights,
  onHighlightsChange,
  pieceStyle,
  onPieceStyleChange,
}) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h2 className={styles.title}>설정</h2>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>난이도</h3>
          <div className={styles.difficultyButtons}>
            {difficulties.map(d => (
              <button
                key={d.id}
                className={`${styles.difficultyButton} ${difficulty === d.id ? styles.active : ''}`}
                onClick={() => onDifficultyChange(d.id)}
              >
                <span>{d.emoji}</span>
                <span>{d.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>기물 모양</h3>
          <div className={styles.styleButtons}>
            {pieceStyles.map(s => (
              <button
                key={s.id}
                className={`${styles.styleButton} ${pieceStyle === s.id ? styles.active : ''}`}
                onClick={() => onPieceStyleChange(s.id)}
              >
                <span className={styles.styleIcon}>{s.icon}</span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>이동 가능 칸 표시</h3>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={showHighlights}
              onChange={e => onHighlightsChange(e.target.checked)}
            />
            <span className={styles.toggleSlider}></span>
            <span className={styles.toggleLabel}>
              {showHighlights ? '켜짐' : '꺼짐'}
            </span>
          </label>
        </div>

        <button className={styles.closeButton} onClick={onClose}>
          닫기
        </button>
      </div>
    </div>
  );
}
