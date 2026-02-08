import { useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { lessons } from './lessonData';
import BadukTutorialBoard from './BadukTutorialBoard';
import { completeBadukTutorial, getCompletedBadukTutorials } from '../progress';
import styles from './BadukTutorial.module.css';

const BLACK = 1;

export default function BadukTutorial({ onBack }) {
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showComplete, setShowComplete] = useState(false);
  const [practiceMode, setPracticeMode] = useState(false);
  const [practiceStones, setPracticeStones] = useState([]);
  const [practiceMoves, setPracticeMoves] = useState(0);
  const [practiceDone, setPracticeDone] = useState(false);
  const completedTutorials = getCompletedBadukTutorials();

  const handleLessonSelect = useCallback((lesson) => {
    setSelectedLesson(lesson);
    setCurrentStep(0);
    setShowComplete(false);
    setPracticeMode(false);
    setPracticeDone(false);
    setPracticeMoves(0);
    setPracticeStones([]);
  }, []);

  const handleNext = useCallback(() => {
    if (!selectedLesson) return;
    if (currentStep < selectedLesson.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else if (selectedLesson.practice && !practiceDone) {
      setPracticeMode(true);
      setPracticeStones([...selectedLesson.practice.board]);
      setPracticeMoves(0);
      setPracticeDone(false);
    } else {
      completeBadukTutorial(selectedLesson.id);
      setShowComplete(true);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  }, [currentStep, selectedLesson, practiceDone]);

  const handlePrev = useCallback(() => {
    if (practiceMode) {
      setPracticeMode(false);
      return;
    }
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  }, [currentStep, practiceMode]);

  const handlePracticeClick = useCallback((r, c) => {
    if (!practiceMode || practiceDone || !selectedLesson?.practice) return;
    const practice = selectedLesson.practice;

    // Check if cell is occupied
    if (practiceStones.some(s => s.r === r && s.c === c)) return;

    if (practice.type === 'place_any') {
      // Just place stones freely
      const newStones = [...practiceStones, { r, c, color: BLACK }];
      setPracticeStones(newStones);
      const newMoves = practiceMoves + 1;
      setPracticeMoves(newMoves);
      if (newMoves >= practice.requiredMoves) {
        setPracticeDone(true);
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      }
    } else {
      // Check if correct move
      const isCorrect = practice.correct.some(pos => pos.r === r && pos.c === c);
      if (isCorrect) {
        const newStones = [...practiceStones, { r, c, color: BLACK }];
        // If capture type, remove captured white stones
        if (practice.type === 'capture') {
          const filtered = newStones.filter(s => {
            if (s.color !== 2) return true;
            // Simple: remove white stones that are fully surrounded after this move
            return !isGroupCaptured(newStones, s.r, s.c, practice.boardSize);
          });
          setPracticeStones(filtered);
        } else {
          setPracticeStones(newStones);
        }
        setPracticeDone(true);
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      }
    }
  }, [practiceMode, practiceDone, selectedLesson, practiceStones, practiceMoves]);

  const handleBackToLessons = useCallback(() => {
    setSelectedLesson(null);
    setCurrentStep(0);
    setShowComplete(false);
  }, []);

  // Lesson list
  if (!selectedLesson) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>📚 바둑 배우기</h1>
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

  // Complete screen
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
    return (
      <div className={styles.container}>
        <div className={styles.lessonHeader}>
          <button className={styles.lessonBackButton} onClick={handleBackToLessons}>⬅️</button>
          <h2 className={styles.lessonHeaderTitle}>🎮 직접 해보기!</h2>
        </div>

        <BadukTutorialBoard
          boardSize={practice.boardSize}
          stones={practiceStones}
          highlights={practice.correct && !practiceDone ? [] : []}
          onCellClick={handlePracticeClick}
        />

        <div className={styles.stepText}>
          <p>{practiceDone ? '잘했어요! 🎉 정답이에요!' : practice.task}</p>
        </div>

        <div className={styles.navButtons}>
          <button className={styles.navButton} onClick={handlePrev}>⬅️ 이전</button>
          {practiceDone && (
            <button
              className={`${styles.navButton} ${styles.nextButton}`}
              onClick={() => {
                completeBadukTutorial(selectedLesson.id);
                setShowComplete(true);
              }}
            >
              🌟 완료!
            </button>
          )}
        </div>
      </div>
    );
  }

  // Active lesson step
  const step = selectedLesson.steps[currentStep];
  const totalSteps = selectedLesson.steps.length + (selectedLesson.practice ? 1 : 0);
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className={styles.container}>
      <div className={styles.lessonHeader}>
        <button className={styles.lessonBackButton} onClick={handleBackToLessons}>⬅️</button>
        <h2 className={styles.lessonHeaderTitle}>{selectedLesson.emoji} {selectedLesson.title}</h2>
      </div>

      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
      </div>
      <p className={styles.progressText}>{currentStep + 1} / {totalSteps}</p>

      <BadukTutorialBoard
        boardSize={step.boardSize || 9}
        stones={step.board}
        highlights={step.highlight}
        annotation={step.annotation}
      />

      <div className={styles.stepText}>
        <p>{step.text}</p>
      </div>

      <div className={styles.navButtons}>
        <button className={styles.navButton} onClick={handlePrev} disabled={currentStep === 0}>
          ⬅️ 이전
        </button>
        <button className={`${styles.navButton} ${styles.nextButton}`} onClick={handleNext}>
          {currentStep === selectedLesson.steps.length - 1
            ? (selectedLesson.practice ? '🎮 연습하기!' : '🌟 완료!')
            : '다음 ➡️'}
        </button>
      </div>
    </div>
  );
}

// Helper: check if a group at (r,c) is captured (no liberties)
function isGroupCaptured(stones, r, c, size) {
  const color = stones.find(s => s.r === r && s.c === c)?.color;
  if (!color) return false;
  const visited = new Set();
  const stack = [[r, c]];
  const stoneSet = new Map();
  for (const s of stones) stoneSet.set(`${s.r},${s.c}`, s.color);

  while (stack.length > 0) {
    const [cr, cc] = stack.pop();
    const key = `${cr},${cc}`;
    if (visited.has(key)) continue;
    visited.add(key);
    for (const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0]]) {
      const nr = cr + dr, nc = cc + dc;
      if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
      const nkey = `${nr},${nc}`;
      if (!stoneSet.has(nkey)) return false; // found liberty
      if (stoneSet.get(nkey) === color && !visited.has(nkey)) {
        stack.push([nr, nc]);
      }
    }
  }
  return true;
}
