import { useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { puzzles } from './puzzleData';
import BadukTutorialBoard from './BadukTutorialBoard';
import { completeBadukPuzzle, getCompletedBadukPuzzles } from '../progress';
import styles from './BadukPuzzle.module.css';

const BLACK = 1;

export default function BadukPuzzle({ onBack }) {
  const [selectedPuzzle, setSelectedPuzzle] = useState(null);
  const [puzzleStones, setPuzzleStones] = useState([]);
  const [solved, setSolved] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [wrong, setWrong] = useState(false);
  // multiMove 상태
  const [moveStep, setMoveStep] = useState(0);
  const [stepMsg, setStepMsg] = useState(null);
  const completedPuzzles = getCompletedBadukPuzzles();

  const handlePuzzleSelect = useCallback((puzzle) => {
    setSelectedPuzzle(puzzle);
    setPuzzleStones([...puzzle.board]);
    setSolved(false);
    setShowHint(false);
    setWrong(false);
    setMoveStep(0);
    setStepMsg(null);
  }, []);

  const handleCellClick = useCallback((r, c) => {
    if (solved || !selectedPuzzle || stepMsg) return;

    // Check occupied
    if (puzzleStones.some(s => s.r === r && s.c === c)) return;

    if (selectedPuzzle.multiMove) {
      // 2수 퍼즐
      if (moveStep === 0) {
        const isCorrect = selectedPuzzle.correct.some(pos => pos.r === r && pos.c === c);
        if (isCorrect) {
          let newStones = [...puzzleStones, { r, c, color: BLACK }];
          // 잡기 처리
          newStones = removeCaptured(newStones, selectedPuzzle.boardSize, 2);
          setPuzzleStones(newStones);
          setStepMsg('좋아! 👏 상대가 응수해요...');
          setWrong(false);
          setTimeout(() => {
            const opMove = selectedPuzzle.opponentMove;
            let withOp = [...newStones, { r: opMove.r, c: opMove.c, color: opMove.color }];
            withOp = removeCaptured(withOp, selectedPuzzle.boardSize, 1);
            setPuzzleStones(withOp);
            setMoveStep(1);
            setStepMsg('이제 마지막 한 수!');
            setTimeout(() => setStepMsg(null), 1500);
          }, 600);
        } else {
          setWrong(true);
          setTimeout(() => setWrong(false), 1000);
        }
      } else {
        const isCorrect = selectedPuzzle.secondCorrect.some(pos => pos.r === r && pos.c === c);
        if (isCorrect) {
          let newStones = [...puzzleStones, { r, c, color: BLACK }];
          newStones = removeCaptured(newStones, selectedPuzzle.boardSize, 2);
          setPuzzleStones(newStones);
          setSolved(true);
          setWrong(false);
          completeBadukPuzzle(selectedPuzzle.id);
          confetti({
            particleCount: 120, spread: 80, origin: { y: 0.6 },
            colors: ['#a8d5ba', '#f8bbd9', '#fff59d', '#d1c4e9', '#ffccbc'],
          });
        } else {
          setWrong(true);
          setTimeout(() => setWrong(false), 1000);
        }
      }
      return;
    }

    // 1수 퍼즐
    const isCorrect = selectedPuzzle.correct.some(pos => pos.r === r && pos.c === c);

    if (isCorrect) {
      const newStones = [...puzzleStones, { r, c, color: BLACK }];
      // Remove captured white stones if applicable
      if (selectedPuzzle.type === 'capture') {
        const filtered = newStones.filter(s => {
          if (s.color !== 2) return true;
          return !isGroupCaptured(newStones, s.r, s.c, selectedPuzzle.boardSize);
        });
        setPuzzleStones(filtered);
      } else {
        setPuzzleStones(newStones);
      }
      setSolved(true);
      setWrong(false);
      completeBadukPuzzle(selectedPuzzle.id);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#a8d5ba', '#f8bbd9', '#fff59d', '#d1c4e9', '#ffccbc'],
      });
    } else {
      setWrong(true);
      setTimeout(() => setWrong(false), 1000);
    }
  }, [solved, selectedPuzzle, puzzleStones, moveStep, stepMsg]);

  const handleNextPuzzle = useCallback(() => {
    if (!selectedPuzzle) return;
    const idx = puzzles.findIndex(p => p.id === selectedPuzzle.id);
    if (idx < puzzles.length - 1) {
      handlePuzzleSelect(puzzles[idx + 1]);
    } else {
      setSelectedPuzzle(null);
    }
  }, [selectedPuzzle, handlePuzzleSelect]);

  // Puzzle list
  if (!selectedPuzzle) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>🧩 바둑 퍼즐</h1>
        <p className={styles.subtitle}>정답을 찾아봐요!</p>

        <div className={styles.puzzleList}>
          {puzzles.map((puzzle, index) => {
            const isCompleted = completedPuzzles.includes(puzzle.id);
            return (
              <button
                key={puzzle.id}
                className={`${styles.puzzleCard} ${isCompleted ? styles.completed : ''}`}
                onClick={() => handlePuzzleSelect(puzzle)}
                style={{ animationDelay: `${index * 0.06}s` }}
              >
                <span className={styles.puzzleEmoji}>{puzzle.emoji}</span>
                <div className={styles.puzzleInfo}>
                  <span className={styles.puzzleTitle}>퍼즐 {puzzle.id}: {puzzle.title}</span>
                </div>
                {puzzle.multiMove && <span className={styles.diffBadge}>⭐⭐</span>}
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

  // Active puzzle
  return (
    <div className={styles.container}>
      <div className={styles.puzzleHeader}>
        <button className={styles.headerBackBtn} onClick={() => setSelectedPuzzle(null)}>⬅️</button>
        <h2 className={styles.headerTitle}>
          {selectedPuzzle.emoji} 퍼즐 {selectedPuzzle.id}
        </h2>
      </div>

      <div className={styles.taskText}>
        {solved ? '🎉 정답이에요! 잘했어요!' : stepMsg || selectedPuzzle.title}
      </div>

      <BadukTutorialBoard
        boardSize={selectedPuzzle.boardSize}
        stones={puzzleStones}
        highlights={showHint && !solved ? selectedPuzzle.correct : []}
        onCellClick={handleCellClick}
      />

      {wrong && (
        <div className={styles.wrongMsg}>🤔 다시 생각해봐요!</div>
      )}

      <div className={styles.controls}>
        {!solved && (
          <button
            className={styles.hintBtn}
            onClick={() => setShowHint(true)}
          >
            💡 힌트
          </button>
        )}
        {showHint && !solved && (
          <div className={styles.hintText}>{selectedPuzzle.hint}</div>
        )}
        {solved && (
          <button className={styles.nextBtn} onClick={handleNextPuzzle}>
            {puzzles.findIndex(p => p.id === selectedPuzzle.id) < puzzles.length - 1
              ? '다음 퍼즐 ➡️'
              : '📋 목록으로'}
          </button>
        )}
        <button className={styles.resetBtn} onClick={() => handlePuzzleSelect(selectedPuzzle)}>
          🔄 다시하기
        </button>
      </div>
    </div>
  );
}

function removeCaptured(stones, size, colorToRemove) {
  return stones.filter(s => {
    if (s.color !== colorToRemove) return true;
    return !isGroupCaptured(stones, s.r, s.c, size);
  });
}

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
      if (!stoneSet.has(nkey)) return false;
      if (stoneSet.get(nkey) === color && !visited.has(nkey)) {
        stack.push([nr, nc]);
      }
    }
  }
  return true;
}
