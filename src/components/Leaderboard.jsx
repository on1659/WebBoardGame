import { useState, useEffect } from 'react';
import { useUser } from '../profile/UserContext';
import styles from './Leaderboard.module.css';

const GAMES = [
  // 카드 짝맞추기
  { id: 'memory_easy', name: '🃏 카드짝맞추기 쉬움', metric: 'moves', unit: '번', lower: true },
  { id: 'memory_medium', name: '🃏 카드짝맞추기 보통', metric: 'moves', unit: '번', lower: true },
  { id: 'memory_hard', name: '🃏 카드짝맞추기 어려움', metric: 'moves', unit: '번', lower: true },
  // 스도쿠
  { id: 'sudoku_easy', name: '🧩 스도쿠 쉬움', metric: 'time', unit: '초', lower: true },
  { id: 'sudoku_medium', name: '🧩 스도쿠 보통', metric: 'time', unit: '초', lower: true },
  // 지뢰찾기
  { id: 'minesweeper_easy', name: '💣 지뢰찾기 쉬움', metric: 'time', unit: '초', lower: true },
  { id: 'minesweeper_medium', name: '💣 지뢰찾기 보통', metric: 'time', unit: '초', lower: true },
  { id: 'minesweeper_hard', name: '💣 지뢰찾기 어려움', metric: 'time', unit: '초', lower: true },
  // 대전 게임
  { id: 'chess_easy', name: '♟️ 체스 쉬움', metric: 'wins', unit: '승', lower: false },
  { id: 'chess_normal', name: '♟️ 체스 보통', metric: 'wins', unit: '승', lower: false },
  { id: 'chess_hard', name: '♟️ 체스 어려움', metric: 'wins', unit: '승', lower: false },
  { id: 'gomoku_easy', name: '⚫ 오목 쉬움', metric: 'wins', unit: '승', lower: false },
  { id: 'gomoku_medium', name: '⚫ 오목 보통', metric: 'wins', unit: '승', lower: false },
  { id: 'othello_easy', name: '🟢 오델로 쉬움', metric: 'wins', unit: '승', lower: false },
  { id: 'othello_medium', name: '🟢 오델로 보통', metric: 'wins', unit: '승', lower: false },
  { id: 'connect4_easy', name: '🔴 사목 쉬움', metric: 'wins', unit: '승', lower: false },
  { id: 'connect4_medium', name: '🔴 사목 보통', metric: 'wins', unit: '승', lower: false },
  { id: 'tictactoe_easy', name: '❌ 틱택토 쉬움', metric: 'wins', unit: '승', lower: false },
  { id: 'tictactoe_medium', name: '❌ 틱택토 보통', metric: 'wins', unit: '승', lower: false },
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
  const [tab, setTab] = useState('memory');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/leaderboard/${tab}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [tab]);

  const game = GAMES.find(g => g.id === tab);

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={onBack}>← 뒤로</button>
        <h2 className={styles.title}>🏆 순위표</h2>
      </div>

      <div className={styles.tabs}>
        {GAMES.map(g => (
          <button
            key={g.id}
            className={`${styles.tab} ${tab === g.id ? styles.activeTab : ''}`}
            onClick={() => setTab(g.id)}
          >
            {g.name}
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
              <span className={styles.score}>{formatScore(entry.score, game.metric)} {game.unit}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
