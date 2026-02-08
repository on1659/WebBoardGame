import { useState, useCallback, useMemo } from 'react';
import { Chess } from 'chess.js';
import confetti from 'canvas-confetti';
import { lessons } from './lessonData';
import TutorialBoard from './TutorialBoard';
import { completeTutorial, getCompletedTutorials } from '../progress';
import styles from './TutorialMode.module.css';

export default function TutorialMode({ onBack }) {
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showComplete, setShowComplete] = useState(false);
  const [practiceMode, setPracticeMode] = useState(false);
  const [practiceSelected, setPracticeSelected] = useState(null);
  const [practiceFen, setPracticeFen] = useState(null);
  const [practiceDone, setPracticeDone] = useState(false);
  const completedTutorials = getCompletedTutorials();

  const handleLessonSelect = useCallback((lesson) => {
    setSelectedLesson(lesson);
    setCurrentStep(0);
    setShowComplete(false);
    setPracticeMode(false);
    setPracticeDone(false);
  }, []);

  const handleNext = useCallback(() => {
    if (!selectedLesson) return;
    if (currentStep < selectedLesson.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else if (selectedLesson.practice && !practiceDone) {
      // Enter practice mode
      setPracticeMode(true);
      setPracticeFen(selectedLesson.practice.fen);
      setPracticeSelected(null);
    } else {
      completeTutorial(selectedLesson.id);
      setShowComplete(true);
    }
  }, [currentStep, selectedLesson, practiceDone]);

  const handlePrev = useCallback(() => {
    if (practiceMode) {
      setPracticeMode(false);
      setPracticeSelected(null);
      return;
    }
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep, practiceMode]);

  const practiceValidSquares = useMemo(() => {
    if (!practiceMode || !selectedLesson?.practice || !practiceSelected) return [];
    const practice = selectedLesson.practice;
    if (practice.validMoves === 'any') {
      try {
        const chess = new Chess(practiceFen || practice.fen);
        return chess.moves({ square: practiceSelected, verbose: true }).map(m => m.to);
      } catch { return []; }
    }
    return practice.validMoves
      .filter(m => m.from === practiceSelected)
      .map(m => m.to);
  }, [practiceMode, selectedLesson, practiceSelected, practiceFen]);

  const handlePracticeClick = useCallback((square) => {
    if (!practiceMode || !selectedLesson?.practice || practiceDone) return;
    const practice = selectedLesson.practice;
    const fen = practiceFen || practice.fen;
    const chess = new Chess(fen);
    const piece = chess.get(square);

    if (!practiceSelected) {
      if (piece && piece.color === 'w') {
        setPracticeSelected(square);
      }
      return;
    }

    if (square === practiceSelected) {
      setPracticeSelected(null);
      return;
    }

    if (piece && piece.color === 'w') {
      setPracticeSelected(square);
      return;
    }

    // Try move
    let isValid = false;
    if (practice.validMoves === 'any') {
      try {
        chess.move({ from: practiceSelected, to: square, promotion: 'q' });
        isValid = true;
      } catch { isValid = false; }
    } else {
      isValid = practice.validMoves.some(m => m.from === practiceSelected && m.to === square);
      if (isValid) {
        try { chess.move({ from: practiceSelected, to: square, promotion: 'q' }); } catch { isValid = false; }
      }
    }

    if (isValid) {
      setPracticeFen(chess.fen());
      setPracticeSelected(null);
      setPracticeDone(true);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } else {
      setPracticeSelected(null);
    }
  }, [practiceMode, practiceSelected, selectedLesson, practiceFen, practiceDone]);

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

  // Practice mode
  if (practiceMode) {
    const practice = selectedLesson.practice;
    const highlightSquares = practiceSelected ? practiceValidSquares : [];
    if (practiceSelected) highlightSquares.push(practiceSelected);

    return (
      <div className={styles.container}>
        <div className={styles.lessonHeader}>
          <button className={styles.lessonBackButton} onClick={handleBackToLessons}>
            ⬅️
          </button>
          <h2 className={styles.lessonHeaderTitle}>
            🎮 직접 해보기!
          </h2>
        </div>

        <TutorialBoard
          fen={practiceFen || practice.fen}
          highlightSquares={highlightSquares}
          onSquareClick={handlePracticeClick}
        />

        <div className={styles.stepText}>
          <p>{practiceDone ? '잘했어요! 🎉 말을 움직였어요!' : practice.task}</p>
        </div>

        <div className={styles.navButtons}>
          <button className={styles.navButton} onClick={handlePrev}>
            ⬅️ 이전
          </button>
          {practiceDone && (
            <button
              className={`${styles.navButton} ${styles.nextButton}`}
              onClick={() => {
                completeTutorial(selectedLesson.id);
                setShowComplete(true);
                setPracticeMode(false);
              }}
            >
              🌟 완료!
            </button>
          )}
        </div>
      </div>
    );
  }

  // Active lesson
  const step = selectedLesson.steps[currentStep];
  const totalSteps = selectedLesson.steps.length + (selectedLesson.practice ? 1 : 0);
  const progress = ((currentStep + 1) / totalSteps) * 100;

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
      <p className={styles.progressText}>{currentStep + 1} / {totalSteps}</p>

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
          {currentStep === selectedLesson.steps.length - 1
            ? (selectedLesson.practice ? '🎮 연습하기!' : '🌟 완료!')
            : '다음 ➡️'}
        </button>
      </div>
    </div>
  );
}
