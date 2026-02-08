import { useState, useEffect } from 'react';
import { fetchProgress } from './profile/api';
import styles from './HomeScreen.module.css';

export default function HomeScreen({ profileName, userId, onSelectGame, onLogout, onShowProgress }) {
  const [chessDesc, setChessDesc] = useState('말을 움직여서 왕을 잡아요!');

  useEffect(() => {
    fetchProgress(userId).then(rows => {
      const tuts = rows.filter(r => r.stage_type === 'tutorial').length;
      const puzz = rows.filter(r => r.stage_type === 'puzzle').length;
      if (tuts > 0 || puzz > 0) {
        setChessDesc(`📚 ${tuts}/6 🧩 ${puzz}/10`);
      }
    }).catch(() => {});
  }, [userId]);

  const games = [
    { id: 'chess', emoji: '♟️', name: '체스', description: chessDesc, color: '#a8d5ba', available: true },
    { id: 'gomoku', emoji: '⚫', name: '오목', description: '다섯 개를 한 줄로 놓으면 이겨요!', color: '#f8bbd9', available: true },
    { id: 'othello', emoji: '🟢', name: '오델로', description: '돌을 뒤집어서 많이 차지해요!', color: '#c8e6c9', available: true },
    { id: 'connect4', emoji: '🔴', name: '사목', description: '네 개를 한 줄로 놓으면 이겨요!', color: '#bbdefb', available: true },
    { id: 'tictactoe', emoji: '❌', name: '틱택토', description: '세 개를 한 줄로! 간단하고 재밌어요!', color: '#ffccbc', available: true },
    { id: 'baduk', emoji: '⚪', name: '바둑', description: '곧 만나요!', color: '#d1c4e9', available: false },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <button className={styles.progressButton} onClick={onShowProgress}>
          📊 진행도
        </button>
        <button className={styles.logoutButton} onClick={onLogout}>
          👋 다른 친구
        </button>
      </div>

      <h1 className={styles.title}>🎲 보드게임 세상 🎲</h1>
      <p className={styles.subtitle}>안녕, <strong>{profileName}</strong>! 어떤 게임을 할까요? 😊</p>

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
            {!game.available && <span className={styles.comingSoonBadge}>🔜 준비 중</span>}
          </button>
        ))}
      </div>

      <p className={styles.footer}>🌟 재미있게 놀아요! 🌟</p>
    </div>
  );
}
