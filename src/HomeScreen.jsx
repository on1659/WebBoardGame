import { useState, useEffect } from 'react';
import { fetchProgress, getActiveSave, deleteGame } from './profile/api';
import styles from './HomeScreen.module.css';

const GAME_NAMES = {
  chess: '체스', baduk: '바둑', gomoku: '오목', othello: '오델로',
  connect4: '사목', memory: '카드 짝맞추기', sudoku: '미니 스도쿠', minesweeper: '미니 지뢰찾기'
};

export default function HomeScreen({ profileName, userId, onSelectGame, onLogout, onShowProgress, onLogin, onShowLeaderboard, onShowStats, isLoggedIn }) {
  const [chessDesc, setChessDesc] = useState('말을 움직여서 왕을 잡아요!');
  const [activeSave, setActiveSave] = useState(null); // { game_type }
  const [pendingGame, setPendingGame] = useState(null); // 클릭한 게임 (모달용)

  useEffect(() => {
    if (!userId) return;
    fetchProgress(userId).then(rows => {
      const tuts = rows.filter(r => r.stage_type === 'tutorial').length;
      const puzz = rows.filter(r => r.stage_type === 'puzzle').length;
      if (tuts > 0 || puzz > 0) {
        setChessDesc(`📚 ${tuts}/6 🧩 ${puzz}/10`);
      }
    }).catch(() => {});

    // Check active save (only 1 across all games)
    getActiveSave(userId).then(data => {
      setActiveSave(data);
    }).catch(() => {});
  }, [userId]);

  const handleGameClick = (gameId) => {
    if (!activeSave) {
      // 세이브 없음 → 바로 진입
      onSelectGame(gameId);
      return;
    }
    if (activeSave.game_type === gameId) {
      // 같은 게임 세이브 → 바로 진입 (게임 내에서 이어하기 모달)
      onSelectGame(gameId);
      return;
    }
    // 다른 게임 세이브 있음 → 모달
    setPendingGame(gameId);
  };

  const handleContinueSaved = () => {
    // 저장된 게임으로 이동
    const savedType = activeSave.game_type;
    setPendingGame(null);
    onSelectGame(savedType);
  };

  const handleNewGame = async () => {
    // 기존 세이브 삭제하고 새 게임 시작
    if (userId && activeSave) {
      try { await deleteGame(userId, activeSave.game_type); } catch {}
    }
    const gameId = pendingGame;
    setActiveSave(null);
    setPendingGame(null);
    onSelectGame(gameId, { skipResume: true });
  };

  const games = [
    { id: 'chess', emoji: '♟️', name: '체스', description: chessDesc, color: '#a8d5ba', available: true },
    { id: 'baduk', emoji: '⚪', name: '바둑', description: '돌로 땅을 많이 차지해요!', color: '#d1c4e9', available: true },
    { id: 'gomoku', emoji: '⚫', name: '오목', description: '다섯 개를 한 줄로 놓으면 이겨요!', color: '#f8bbd9', available: true },
    { id: 'othello', emoji: '🟢', name: '오델로', description: '돌을 뒤집어서 많이 차지해요!', color: '#c8e6c9', available: true },
    { id: 'connect4', emoji: '🔴', name: '사목', description: '네 개를 한 줄로 놓으면 이겨요!', color: '#bbdefb', available: true },
    { id: 'memory', emoji: '🃏', name: '카드 짝맞추기', description: '같은 카드를 찾아 뒤집어요!', color: '#e1bee7', available: true },
    { id: 'sudoku', emoji: '🧩', name: '미니 스도쿠', description: '숫자 퍼즐! 1~4를 채워봐!', color: '#b2dfdb', available: true },
    { id: 'minesweeper', emoji: '💣', name: '미니 지뢰찾기', description: '지뢰를 피해서 칸을 열어봐!', color: '#ffcdd2', available: true },
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
            onClick={() => game.available && handleGameClick(game.id)}
            disabled={!game.available}
          >
            <span className={styles.gameEmoji}>{game.emoji}</span>
            <span className={styles.gameName}>{game.name}</span>
            <span className={styles.gameDesc}>{game.description}</span>
            {game.available && activeSave?.game_type === game.id && <span className={styles.resumeBadge}>▶️ 이어하기</span>}
            {!game.available && <span className={styles.comingSoonBadge}>🔜 준비 중</span>}
          </button>
        ))}
      </div>

      <p className={styles.footer}>🌟 재미있게 놀아요! 🌟</p>

      {/* 다른 게임 세이브 있을 때 모달 */}
      {pendingGame && activeSave && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>🎮 잠깐!</h2>
            <p className={styles.modalDesc}>
              <strong>{GAME_NAMES[activeSave.game_type]}</strong> 이어하기가 있어요!
            </p>
            <p className={styles.modalSub}>새 게임을 시작하면 저장된 게임이 사라져요</p>
            <div className={styles.modalButtons}>
              <button className={styles.modalResumeBtn} onClick={handleContinueSaved}>
                ▶️ {GAME_NAMES[activeSave.game_type]} 이어하기
              </button>
              <button className={styles.modalNewBtn} onClick={handleNewGame}>
                🆕 {GAME_NAMES[pendingGame]} 새로 하기
              </button>
              <button className={styles.modalCancelBtn} onClick={() => setPendingGame(null)}>
                ◀ 돌아가기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
