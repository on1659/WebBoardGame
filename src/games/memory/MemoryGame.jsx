import { useState, useEffect, useRef, useCallback } from 'react';
import { useUser } from '../../profile/UserContext';
import { submitScore } from '../../profile/api';
import { usePlayTracking } from '../../hooks/usePlayTracking';
import styles from './MemoryGame.module.css';

const EMOJI_BY_DIFFICULTY = {
  easy: ['🐶','🐱','🐰','🦊','🐻','🐼'],
  medium: ['🐶','🐱','🐰','🦊','🐻','🐼','🐨','🦁'],
  hard: ['🐶','🐱','🐰','🦊','🐻','🐼','🐨','🦁','🐸','🐵','🦄','🐧'],
};

const DIFFICULTIES = {
  easy: { rows: 3, cols: 4, label: '쉬움 (4×3)' },
  medium: { rows: 4, cols: 4, label: '보통 (4×4)' },
  hard: { rows: 4, cols: 6, label: '어려움 (6×4)' },
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function MemoryGame({ onBack }) {
  const { user } = useUser();
  const [difficulty, setDifficulty] = useState(null);
  const { startTracking, endTracking } = usePlayTracking(difficulty ? `memory_${difficulty}` : 'memory');
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState(new Set());
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const timerRef = useRef(null);
  const lockRef = useRef(false);

  const startGame = useCallback((diff) => {
    const { rows, cols } = DIFFICULTIES[diff];
    const pairCount = (rows * cols) / 2;
    const chosen = EMOJI_BY_DIFFICULTY[diff].slice(0, pairCount);
    const deck = shuffle([...chosen, ...chosen]).map((emoji, i) => ({ id: i, emoji }));
    setCards(deck);
    setFlipped([]);
    setMatched(new Set());
    setMoves(0);
    setTime(0);
    setGameOver(false);
    setShowConfetti(false);
    setDifficulty(diff);
    lockRef.current = false;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setTime(t => t + 1), 1000);
    startTracking();
  }, [startTracking]);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const handleFlip = useCallback((idx) => {
    if (lockRef.current || flipped.includes(idx) || matched.has(idx)) return;
    const next = [...flipped, idx];
    setFlipped(next);
    if (next.length === 2) {
      setMoves(m => m + 1);
      lockRef.current = true;
      if (cards[next[0]].emoji === cards[next[1]].emoji) {
        const newMatched = new Set(matched);
        newMatched.add(next[0]);
        newMatched.add(next[1]);
        setMatched(newMatched);
        setFlipped([]);
        lockRef.current = false;
        if (newMatched.size === cards.length) {
          clearInterval(timerRef.current);
          setGameOver(true);
          setShowConfetti(true);
          endTracking('complete');
          if (user) {
            submitScore(user.id, `memory_${difficulty}`, moves + 1, 'moves').catch(() => {});
            submitScore(user.id, `memory_${difficulty}_time`, time, 'time').catch(() => {});
          }
        }
      } else {
        setTimeout(() => { setFlipped([]); lockRef.current = false; }, 800);
      }
    }
  }, [flipped, matched, cards, moves, time, user]);

  const formatTime = (s) => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;

  if (!difficulty) {
    return (
      <div className={styles.container}>
        <button className={styles.backBtn} onClick={onBack}>← 뒤로</button>
        <h1 className={styles.title}>🃏 카드 짝맞추기</h1>
        <p className={styles.subtitle}>난이도를 골라줘!</p>
        <div className={styles.diffGrid}>
          {Object.entries(DIFFICULTIES).map(([key, val]) => (
            <button key={key} className={styles.diffBtn} onClick={() => startGame(key)}>
              {val.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const { rows, cols } = DIFFICULTIES[difficulty];

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={onBack}>← 뒤로</button>
        <span className={styles.stat}>🔄 {moves}번</span>
        <span className={styles.stat}>⏱️ {formatTime(time)}</span>
      </div>
      <h2 className={styles.title}>🃏 카드 짝맞추기</h2>

      {showConfetti && (
        <div className={styles.confetti}>
          {Array.from({length: 40}).map((_,i) => (
            <span key={i} className={styles.confettiPiece} style={{
              left: `${Math.random()*100}%`,
              animationDelay: `${Math.random()*2}s`,
              backgroundColor: ['#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#ff6fff'][i%5],
            }}/>
          ))}
        </div>
      )}

      {gameOver && (
        <div className={styles.modal}>
          <h2>🎉 완성! 🎉</h2>
          <p>🔄 {moves}번 만에 ⏱️ {formatTime(time)}로 완성했어!</p>
          <div className={styles.modalBtns}>
            <button onClick={() => startGame(difficulty)}>🔄 다시하기</button>
            <button onClick={onBack}>🏠 홈으로</button>
          </div>
        </div>
      )}

      <div className={styles.grid} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {cards.map((card, idx) => {
          const isFlipped = flipped.includes(idx) || matched.has(idx);
          return (
            <button
              key={card.id}
              className={`${styles.card} ${isFlipped ? styles.flipped : ''} ${matched.has(idx) ? styles.matched : ''}`}
              onClick={() => handleFlip(idx)}
            >
              <div className={styles.cardInner}>
                <div className={styles.cardFront}>⭐</div>
                <div className={styles.cardBack}>{card.emoji}</div>
              </div>
            </button>
          );
        })}
      </div>

      <button className={styles.restartBtn} onClick={() => startGame(difficulty)}>🔄 다시하기</button>
    </div>
  );
}
