import { useState, useEffect } from 'react';
import { useUser } from '../profile/UserContext';
import styles from './Leaderboard.module.css';

const GAME_CATEGORIES = [
  { id: 'chess', emoji: '♟️', name: '체스', color: '#a8d5ba',
    difficulties: [
      { id: 'chess_easy', label: '쉬움', metric: 'wins', unit: '승', lower: false },
      { id: 'chess_normal', label: '보통', metric: 'wins', unit: '승', lower: false },
      { id: 'chess_hard', label: '어려움', metric: 'wins', unit: '승', lower: false },
    ]},
  { id: 'gomoku', emoji: '⚫', name: '오목', color: '#f8bbd9',
    difficulties: [
      { id: 'gomoku_easy', label: '쉬움', metric: 'wins', unit: '승', lower: false },
      { id: 'gomoku_medium', label: '보통', metric: 'wins', unit: '승', lower: false },
    ]},
  { id: 'othello', emoji: '🟢', name: '오델로', color: '#c8e6c9',
    difficulties: [
      { id: 'othello_easy', label: '쉬움', metric: 'wins', unit: '승', lower: false },
      { id: 'othello_medium', label: '보통', metric: 'wins', unit: '승', lower: false },
    ]},
  { id: 'connect4', emoji: '🔴', name: '사목', color: '#bbdefb',
    difficulties: [
      { id: 'connect4_easy', label: '쉬움', metric: 'wins', unit: '승', lower: false },
      { id: 'connect4_medium', label: '보통', metric: 'wins', unit: '승', lower: false },
    ]},
  { id: 'memory', emoji: '🃏', name: '카드짝맞추기', color: '#e1bee7',
    difficulties: [
      { id: 'memory_easy', label: '쉬움', metric: 'moves', unit: '번', lower: true },
      { id: 'memory_medium', label: '보통', metric: 'moves', unit: '번', lower: true },
      { id: 'memory_hard', label: '어려움', metric: 'moves', unit: '번', lower: true },
    ]},
  { id: 'sudoku', emoji: '🧩', name: '스도쿠', color: '#b2dfdb',
    difficulties: [
      { id: 'sudoku_easy', label: '쉬움', metric: 'time', unit: '초', lower: true },
      { id: 'sudoku_medium', label: '보통', metric: 'time', unit: '초', lower: true },
    ]},
  { id: 'minesweeper', emoji: '💣', name: '지뢰찾기', color: '#ffcdd2',
    difficulties: [
      { id: 'minesweeper_easy', label: '쉬움', metric: 'time', unit: '초', lower: true },
      { id: 'minesweeper_medium', label: '보통', metric: 'time', unit: '초', lower: true },
      { id: 'minesweeper_hard', label: '어려움', metric: 'time', unit: '초', lower: true },
    ]},
];

const MEDALS = ['🥇','🥈','🥉'];

function formatScore(val, metric) {
  if (metric === 'time') {
    const s = Number(val);
    return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
  }
  return val;
}

export default function Leaderboard({ onBack }) {
  const { user } = useUser();
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const game = GAME_CATEGORIES.find(g => g.id === selectedGame);
  const diff = game?.difficulties.find(d => d.id === selectedDifficulty);

  useEffect(() => {
    if (!selectedDifficulty) return;
    setLoading(true);
    fetch(`/api/leaderboard/${selectedDifficulty}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [selectedDifficulty]);

  function selectGame(gameId) {
    const g = GAME_CATEGORIES.find(c => c.id === gameId);
    setSelectedGame(gameId);
    setSelectedDifficulty(g.difficulties[0].id);
  }

  function goBackToGames() {
    setSelectedGame(null);
    setSelectedDifficulty(null);
    setData([]);
  }

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={selectedGame ? goBackToGames : onBack}>
          ← {selectedGame ? '게임 선택' : '뒤로'}
        </button>
        <h2 className={styles.title}>🏆 순위표</h2>
      </div>

      {!selectedGame ? (
        /* Step 1: Game selection */
        <div className={styles.gameGrid}>
          {GAME_CATEGORIES.map((g, i) => (
            <button
              key={g.id}
              className={styles.gameCard}
              style={{ '--card-color': g.color, animationDelay: `${i * 0.08}s` }}
              onClick={() => selectGame(g.id)}
            >
              <span className={styles.gameEmoji}>{g.emoji}</span>
              <span className={styles.gameName}>{g.name}</span>
            </button>
          ))}
        </div>
      ) : (
        /* Step 2: Difficulty tabs + leaderboard */
        <>
          <div className={styles.gameHeader}>
            <span className={styles.selectedEmoji}>{game.emoji}</span>
            <span className={styles.selectedName}>{game.name}</span>
          </div>

          <div className={styles.diffTabs}>
            {game.difficulties.map(d => (
              <button
                key={d.id}
                className={`${styles.diffTab} ${selectedDifficulty === d.id ? styles.activeDiff : ''}`}
                style={{ '--card-color': game.color }}
                onClick={() => setSelectedDifficulty(d.id)}
              >
                {d.label}
              </button>
            ))}
          </div>

          <div className={styles.list}>
            {loading ? (
              <p className={styles.empty}>불러오는 중... ⏳</p>
            ) : data.length === 0 ? (
              <p className={styles.empty}>아직 기록이 없어요! 첫 번째가 되어봐! 🌟</p>
            ) : (
              data.map((entry, i) => (
                <div
                  key={entry.id}
                  className={`${styles.row} ${user && entry.user_id === user.id ? styles.myRow : ''}`}
                >
                  <span className={styles.rank}>{i < 3 ? MEDALS[i] : `${i+1}`}</span>
                  <span className={styles.name}>{entry.user_name}</span>
                  <span className={styles.score}>{formatScore(entry.score, diff?.metric)} {diff?.unit}</span>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
