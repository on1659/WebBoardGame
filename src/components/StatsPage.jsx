import { useState, useEffect } from 'react';
import { useUser } from '../profile/UserContext';
import { fetchStats, fetchGameStats, fetchUserStats } from '../profile/api';
import styles from './StatsPage.module.css';

const GAME_INFO = {
  chess: { emoji: '♟️', name: '체스' },
  gomoku: { emoji: '⚫', name: '오목' },
  othello: { emoji: '🟢', name: '오델로' },
  connect4: { emoji: '🔴', name: '사목' },
  memory: { emoji: '🃏', name: '카드 짝맞추기' },
  sudoku: { emoji: '🧩', name: '미니 스도쿠' },
  minesweeper: { emoji: '💣', name: '미니 지뢰찾기' },
};

function formatTime(seconds) {
  if (!seconds) return '-';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}분 ${s}초` : `${s}초`;
}

export default function StatsPage({ onBack }) {
  const { user } = useUser();
  const [stats, setStats] = useState(null);
  const [gameStats, setGameStats] = useState([]);
  const [userStats, setUserStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchStats(),
      fetchGameStats(),
      user ? fetchUserStats(user.id) : Promise.resolve([]),
    ]).then(([s, gs, us]) => {
      setStats(s);
      setGameStats(gs);
      setUserStats(us);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>🔄 로딩 중...</div>
      </div>
    );
  }

  const maxPlays = Math.max(...gameStats.map(g => g.play_count), 1);

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={onBack}>🏠 홈으로</button>
        <h1 className={styles.title}>📊 게임 통계</h1>
      </div>

      {/* Overall Stats */}
      <div className={styles.overviewCards}>
        <div className={styles.overviewCard}>
          <span className={styles.overviewEmoji}>🎮</span>
          <span className={styles.overviewValue}>{stats?.totalPlays || 0}</span>
          <span className={styles.overviewLabel}>총 플레이 횟수</span>
        </div>
        <div className={styles.overviewCard}>
          <span className={styles.overviewEmoji}>👥</span>
          <span className={styles.overviewValue}>{stats?.totalUsers || 0}</span>
          <span className={styles.overviewLabel}>총 플레이어 수</span>
        </div>
        <div className={styles.overviewCard}>
          <span className={styles.overviewEmoji}>🏆</span>
          <span className={styles.overviewValue}>
            {stats?.mostPopular ? `${GAME_INFO[stats.mostPopular]?.emoji || ''} ${GAME_INFO[stats.mostPopular]?.name || stats.mostPopular}` : '-'}
          </span>
          <span className={styles.overviewLabel}>가장 인기 있는 게임</span>
        </div>
      </div>

      {/* Bar Chart */}
      {gameStats.length > 0 && (
        <div className={styles.chartSection}>
          <h2 className={styles.sectionTitle}>🎯 게임별 플레이 횟수</h2>
          <div className={styles.barChart}>
            {gameStats.map(g => {
              const info = GAME_INFO[g.game_type] || { emoji: '🎮', name: g.game_type };
              const pct = (g.play_count / maxPlays) * 100;
              return (
                <div key={g.game_type} className={styles.barRow}>
                  <span className={styles.barLabel}>{info.emoji} {info.name}</span>
                  <div className={styles.barTrack}>
                    <div className={styles.barFill} data-game={g.game_type} style={{ width: `${pct}%` }}>
                      <span className={styles.barValue}>{g.play_count}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Per-game cards */}
      {gameStats.length > 0 && (
        <div className={styles.gameCardsSection}>
          <h2 className={styles.sectionTitle}>🎲 게임별 상세 통계</h2>
          <div className={styles.gameCards}>
            {gameStats.map(g => {
              const info = GAME_INFO[g.game_type] || { emoji: '🎮', name: g.game_type };
              return (
                <div key={g.game_type} className={styles.gameCard}>
                  <div className={styles.gameCardHeader}>
                    <span className={styles.gameCardEmoji}>{info.emoji}</span>
                    <span className={styles.gameCardName}>{info.name}</span>
                  </div>
                  <div className={styles.gameCardStats}>
                    <div className={styles.stat}>
                      <span className={styles.statLabel}>플레이</span>
                      <span className={styles.statValue}>{g.play_count}회</span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.statLabel}>승률</span>
                      <span className={styles.statValue}>{g.win_rate != null ? `${g.win_rate}%` : '-'}</span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.statLabel}>평균 시간</span>
                      <span className={styles.statValue}>{formatTime(Number(g.avg_duration))}</span>
                    </div>
                  </div>
                  {g.win_rate != null && (
                    <div className={styles.winRateBar}>
                      <div className={styles.winRateFill} style={{ width: `${g.win_rate}%` }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {gameStats.length === 0 && (
        <div className={styles.empty}>
          <p>📭 아직 게임 기록이 없어요!</p>
          <p>게임을 플레이하면 여기에 통계가 나타나요 😊</p>
        </div>
      )}

      {/* User Stats */}
      {user && userStats.length > 0 && (
        <div className={styles.userSection}>
          <h2 className={styles.sectionTitle}>🌟 {user.name}의 통계</h2>
          <div className={styles.gameCards}>
            {userStats.map(g => {
              const info = GAME_INFO[g.game_type] || { emoji: '🎮', name: g.game_type };
              return (
                <div key={g.game_type} className={styles.gameCard} style={{ borderColor: '#ffd700' }}>
                  <div className={styles.gameCardHeader}>
                    <span className={styles.gameCardEmoji}>{info.emoji}</span>
                    <span className={styles.gameCardName}>{info.name}</span>
                  </div>
                  <div className={styles.gameCardStats}>
                    <div className={styles.stat}>
                      <span className={styles.statLabel}>플레이</span>
                      <span className={styles.statValue}>{g.play_count}회</span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.statLabel}>승리</span>
                      <span className={styles.statValue}>{g.wins}승 {g.losses}패 {g.draws}무</span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.statLabel}>평균 시간</span>
                      <span className={styles.statValue}>{formatTime(Number(g.avg_duration))}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {user && userStats.length === 0 && (
        <div className={styles.empty}>
          <p>🎮 {user.name}아, 아직 기록이 없어! 게임을 해보자! 🚀</p>
        </div>
      )}
    </div>
  );
}
