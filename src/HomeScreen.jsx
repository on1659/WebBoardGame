import styles from './HomeScreen.module.css';

const games = [
  {
    id: 'chess',
    emoji: '♟️',
    name: '체스',
    description: '말을 움직여서 왕을 잡아요!',
    color: '#a8d5ba',
    available: true,
  },
  {
    id: 'gomoku',
    emoji: '⚫',
    name: '오목',
    description: '다섯 개를 한 줄로 놓으면 이겨요!',
    color: '#f8bbd9',
    available: true,
  },
  {
    id: 'baduk',
    emoji: '⚪',
    name: '바둑',
    description: '곧 만나요!',
    color: '#d1c4e9',
    available: false,
  },
];

export default function HomeScreen({ onSelectGame }) {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>🎲 보드게임 세상 🎲</h1>
      <p className={styles.subtitle}>어떤 게임을 할까요?</p>

      <div className={styles.gameGrid}>
        {games.map((game, index) => (
          <button
            key={game.id}
            className={`${styles.gameCard} ${!game.available ? styles.comingSoon : ''}`}
            style={{
              '--card-color': game.color,
              animationDelay: `${index * 0.1}s`,
            }}
            onClick={() => game.available && onSelectGame(game.id)}
            disabled={!game.available}
          >
            <span className={styles.gameEmoji}>{game.emoji}</span>
            <span className={styles.gameName}>{game.name}</span>
            <span className={styles.gameDesc}>{game.description}</span>
            {!game.available && (
              <span className={styles.comingSoonBadge}>🔜 준비 중</span>
            )}
          </button>
        ))}
      </div>

      <p className={styles.footer}>🌟 재미있게 놀아요! 🌟</p>
    </div>
  );
}
