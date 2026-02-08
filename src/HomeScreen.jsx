import { useState, useEffect } from 'react';
import { fetchProgress, loadGame } from './profile/api';
import styles from './HomeScreen.module.css';

export default function HomeScreen({ profileName, userId, onSelectGame, onLogout, onShowProgress, onLogin, onShowLeaderboard, onShowStats, isLoggedIn }) {
  const [chessDesc, setChessDesc] = useState('말을 움직여서 왕을 잡아요!');
  const [savedGames, setSavedGames] = useState(new Set());

  useEffect(() => {
    if (!userId) return;
    fetchProgress(userId).then(rows => {
      const tuts = rows.filter(r => r.stage_type === 'tutorial').length;
      const puzz = rows.filter(r => r.stage_type === 'puzzle').length;
      if (tuts > 0 || puzz > 0) {
        setChessDesc(`📚 ${tuts}/6 🧩 ${puzz}/10`);
      }
    }).catch(() => {});

    // Check saved games
    const gameTypes = ['chess', 'gomoku', 'othello', 'connect4'];
    Promise.all(
      gameTypes.map(gt => loadGame(userId, gt).then(d => d?.game_state ? gt : null).catch(() => null))
    ).then(results => {
      setSavedGames(new Set(results.filter(Boolean)));
    });
  }, [userId]);

  const games = [
    { id: 'chess', emoji: '♟️', name: '체스', description: chessDesc, color: '#a8d5ba', available: true },
    { id: 'gomoku', emoji: '⚫', name: '오목', description: '다섯 개를 한 줄로 놓으면 이겨요!', color: '#f8bbd9', available: true },
    { id: 'othello', emoji: '🟢', name: '오델로', description: '돌을 뒤집어서 많이 차지해요!', color: '#c8e6c9', available: true },
    { id: 'connect4', emoji: '🔴', name: '사목', description: '네 개를 한 줄로 놓으면 이겨요!', color: '#bbdefb', available: true },
    { id: 'memory', emoji: '🃏', name: '카드 짝맞추기', description: '같은 카드를 찾아 뒤집어요!', color: '#e1bee7', available: true },
    { id: 'sudoku', emoji: '🧩', name: '미니 스도쿠', description: '숫자 퍼즐! 1~4를 채워봐!', color: '#b2dfdb', available: true },
    { id: 'minesweeper', emoji: '💣', name: '미니 지뢰찾기', description: '지뢰를 피해서 칸을 열어봐!', color: '#ffcdd2', available: true },
    { id: 'baduk', emoji: '⚪', name: '바둑', description: '곧 만나요!', color: '#d1c4e9', available: false },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        {isLoggedIn ? (
          <>
            <button className={styles.topBtn} onClick={onShowProgress}>📊</button>
            <button className={styles.topBtn} onClick={onShowLeaderboard}>🏆</button>
            <button className={styles.topBtn} onClick={onShowStats}>📈</button>
            <button className={styles.topBtn} onClick={onLogout}>👋</button>
          </>
        ) : (
          <>
            <button className={styles.topBtn} onClick={onShowLeaderboard}>🏆</button>
            <button className={styles.topBtn} onClick={onShowStats}>📈</button>
            <button className={styles.topBtnLogin} onClick={onLogin}>🔑</button>
          </>
        )}
      </div>

      <h1 className={styles.title}>🎲 보드게임 세상 🎲</h1>
      <p className={styles.subtitle}>
        {isLoggedIn
          ? <>안녕, <strong>{profileName}</strong>! 어떤 게임을 할까요? 😊</>
          : <>어떤 게임을 할까요? 😊</>
        }
      </p>

      <div className={styles.gameGrid}>
        {games.map((game, index) => (
          <button
            key={game.id}
            className={`${styles.gameCard} ${!game.available ? styles.comingSoon : ''}`}
            style={{ '--card-color': game.color, animationDelay: `${index * 0.1}s` }}
            onClick={() => game.available && onSelectGame(game.id)}
            disabled={!game.available}
          >
            <span className={styles.gameEmoji}>{game.emoji}</span>
            <span className={styles.gameName}>{game.name}</span>
            <span className={styles.gameDesc}>{game.description}</span>
            {game.available && savedGames.has(game.id) && <span className={styles.resumeBadge}>▶️ 이어하기</span>}
            {!game.available && <span className={styles.comingSoonBadge}>🔜 준비 중</span>}
          </button>
        ))}
      </div>

      <p className={styles.footer}>🌟 재미있게 놀아요! 🌟</p>
    </div>
  );
}
