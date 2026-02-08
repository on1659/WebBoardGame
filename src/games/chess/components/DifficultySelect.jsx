import { getTotalProgress } from '../progress';
import styles from './DifficultySelect.module.css';

const difficulties = [
  { id: 'easy', label: '쉬움', emoji: '🐣', description: '처음 배우는 친구들' },
  { id: 'normal', label: '보통', emoji: '🐱', description: '조금 익숙해졌어요' },
  { id: 'hard', label: '어려움', emoji: '🦁', description: '체스 고수!' },
];

export default function DifficultySelect({ onSelect, onTutorial, onPuzzle }) {
  const progress = getTotalProgress();

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>체스 게임</h1>
      <p className={styles.subtitle}>난이도를 선택하세요!</p>

      <div className={styles.buttons}>
        {difficulties.map(diff => (
          <button
            key={diff.id}
            className={styles.difficultyButton}
            onClick={() => onSelect(diff.id)}
          >
            <span className={styles.emoji}>{diff.emoji}</span>
            <span className={styles.label}>{diff.label}</span>
            <span className={styles.description}>{diff.description}</span>
          </button>
        ))}
      </div>

      <div className={styles.extraButtons}>
        <button className={styles.learnButton} onClick={onTutorial}>
          <span className={styles.extraEmoji}>📚</span>
          <span className={styles.extraLabel}>배우기</span>
          {progress.tutorialsCompleted > 0 && (
            <span className={styles.progressBadge}>
              {progress.tutorialsCompleted}/{progress.tutorialsTotal} 🌟
            </span>
          )}
        </button>
        <button className={styles.puzzleButton} onClick={onPuzzle}>
          <span className={styles.extraEmoji}>🧩</span>
          <span className={styles.extraLabel}>퍼즐</span>
          {progress.puzzlesCompleted > 0 && (
            <span className={styles.progressBadge}>
              {progress.puzzlesCompleted}/{progress.puzzlesTotal} ✅
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
