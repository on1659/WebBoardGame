import { useState, useEffect } from 'react';
import { fetchProgress } from './api';
import { lessons } from '../games/chess/tutorial/lessonData';
import { puzzles } from '../games/chess/puzzles/puzzleData';
import styles from './ProgressPage.module.css';

export default function ProgressPage({ profileName, userId, onBack }) {
  const [completedTuts, setCompletedTuts] = useState([]);
  const [completedPuzz, setCompletedPuzz] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress(userId).then(rows => {
      setCompletedTuts(rows.filter(r => r.stage_type === 'tutorial').map(r => parseInt(r.stage_id)));
      setCompletedPuzz(rows.filter(r => r.stage_type === 'puzzle').map(r => parseInt(r.stage_id)));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [userId]);

  const tutTotal = lessons.length;
  const puzzTotal = puzzles.length;
  const totalDone = completedTuts.length + completedPuzz.length;
  const totalAll = tutTotal + puzzTotal;
  const percent = totalAll > 0 ? Math.round((totalDone / totalAll) * 100) : 0;

  if (loading) {
    return (
      <div className={styles.container}>
        <p style={{ fontSize: '24px' }}>로딩 중... ⏳</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>📊 {profileName}의 진행도</h1>

      <div className={styles.overallCard}>
        <div className={styles.overallBar}>
          <div className={styles.overallFill} style={{ width: `${percent}%` }} />
        </div>
        <p className={styles.overallText}>
          전체 {percent}% 완료! ({totalDone}/{totalAll})
          {percent === 100 && ' 🎉 완벽해!'}
          {percent >= 50 && percent < 100 && ' 💪 잘하고 있어!'}
          {percent > 0 && percent < 50 && ' 🌱 좋은 시작이야!'}
        </p>
      </div>

      <h2 className={styles.sectionTitle}>📚 체스 튜토리얼</h2>
      <div className={styles.stageList}>
        {lessons.map(lesson => {
          const done = completedTuts.includes(lesson.id);
          return (
            <div key={lesson.id} className={`${styles.stageCard} ${done ? styles.stageDone : ''}`}>
              <span className={styles.stageEmoji}>{done ? '⭐' : lesson.emoji}</span>
              <div className={styles.stageInfo}>
                <span className={styles.stageName}>스테이지 {lesson.id}: {lesson.title}</span>
                <span className={styles.stageStatus}>
                  {done ? '완료! 🌟' : '아직 안 했어요'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <h2 className={styles.sectionTitle}>🧩 체스 퍼즐</h2>
      <div className={styles.puzzleProgress}>
        <div className={styles.puzzleBar}>
          <div
            className={styles.puzzleFill}
            style={{ width: `${puzzTotal > 0 ? (completedPuzz.length / puzzTotal) * 100 : 0}%` }}
          />
        </div>
        <p className={styles.puzzleText}>
          {completedPuzz.length}/{puzzTotal} 퍼즐 해결!
        </p>
      </div>
      <div className={styles.puzzleGrid}>
        {puzzles.map(puzzle => {
          const done = completedPuzz.includes(puzzle.id);
          return (
            <div key={puzzle.id} className={`${styles.puzzleBadge} ${done ? styles.puzzleBadgeDone : ''}`}>
              {done ? '✅' : `#${puzzle.id}`}
            </div>
          );
        })}
      </div>

      <button className={styles.backButton} onClick={onBack}>
        ⬅️ 돌아가기
      </button>
    </div>
  );
}
