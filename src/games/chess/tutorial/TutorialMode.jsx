import { useState, useCallback } from 'react';
import { lessons } from './lessonData';
import TutorialBoard from './TutorialBoard';
import { completeTutorial, getCompletedTutorials } from '../progress';
import styles from './TutorialMode.module.css';

export default function TutorialMode({ onBack }) {
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showComplete, setShowComplete] = useState(false);
  const completedTutorials = getCompletedTutorials();

  const handleLessonSelect = useCallback((lesson) => {
    setSelectedLesson(lesson);
    setCurrentStep(0);
    setShowComplete(false);
  }, []);

  const handleNext = useCallback(() => {
    if (!selectedLesson) return;
    if (currentStep < selectedLesson.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Lesson complete!
      completeTutorial(selectedLesson.id);
      setShowComplete(true);
    }
  }, [currentStep, selectedLesson]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleBackToLessons = useCallback(() => {
    setSelectedLesson(null);
    setCurrentStep(0);
    setShowComplete(false);
  }, []);

  // Lesson list
  if (!selectedLesson) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>📚 체스 배우기</h1>
        <p className={styles.subtitle}>한 단계씩 배워봐요!</p>

        <div className={styles.lessonList}>
          {lessons.map((lesson, index) => {
            const isCompleted = completedTutorials.includes(lesson.id);
            return (
              <button
                key={lesson.id}
                className={`${styles.lessonCard} ${isCompleted ? styles.completed : ''}`}
                onClick={() => handleLessonSelect(lesson)}
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <span className={styles.lessonEmoji}>{lesson.emoji}</span>
                <div className={styles.lessonInfo}>
                  <span className={styles.lessonTitle}>
                    {lesson.id}단계: {lesson.title}
                  </span>
                  <span className={styles.lessonDesc}>{lesson.description}</span>
                </div>
                {isCompleted && <span className={styles.star}>🌟</span>}
              </button>
            );
          })}
        </div>

        <button className={styles.backButton} onClick={onBack}>
          ⬅️ 돌아가기
        </button>
      </div>
    );
  }

  // Lesson complete screen
  if (showComplete) {
    return (
      <div className={styles.container}>
        <div className={styles.completeScreen}>
          <div className={styles.completeStar}>🌟</div>
          <h2 className={styles.completeTitle}>잘했어요! 🎉</h2>
          <p className={styles.completeText}>
            "{selectedLesson.title}" 단계를 완료했어요!
          </p>
          <div className={styles.completeButtons}>
            <button className={styles.primaryButton} onClick={handleBackToLessons}>
              📚 다른 단계 배우기
            </button>
            <button className={styles.secondaryButton} onClick={onBack}>
              ⬅️ 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active lesson
  const step = selectedLesson.steps[currentStep];
  const progress = ((currentStep + 1) / selectedLesson.steps.length) * 100;

  return (
    <div className={styles.container}>
      <div className={styles.lessonHeader}>
        <button className={styles.lessonBackButton} onClick={handleBackToLessons}>
          ⬅️
        </button>
        <h2 className={styles.lessonHeaderTitle}>
          {selectedLesson.emoji} {selectedLesson.title}
        </h2>
      </div>

      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
      </div>
      <p className={styles.progressText}>{currentStep + 1} / {selectedLesson.steps.length}</p>

      <TutorialBoard
        fen={step.fen}
        highlightSquares={step.highlight}
      />

      <div className={styles.stepText}>
        <p>{step.text.replace(/\*\*/g, '')}</p>
      </div>

      <div className={styles.navButtons}>
        <button
          className={styles.navButton}
          onClick={handlePrev}
          disabled={currentStep === 0}
        >
          ⬅️ 이전
        </button>
        <button
          className={`${styles.navButton} ${styles.nextButton}`}
          onClick={handleNext}
        >
          {currentStep === selectedLesson.steps.length - 1 ? '🌟 완료!' : '다음 ➡️'}
        </button>
      </div>
    </div>
  );
}
