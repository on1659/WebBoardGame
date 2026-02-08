import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import styles from './GameOverModal.module.css';

export default function GameOverModal({
  isOpen,
  gameStatus,
  winner,
  onNewGame,
  onClose,
}) {
  useEffect(() => {
    if (isOpen && winner === 'player') {
      // Celebrate with confetti!
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#a8d5ba', '#f8bbd9', '#fff59d', '#d1c4e9'],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#a8d5ba', '#f8bbd9', '#fff59d', '#d1c4e9'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();
    }
  }, [isOpen, winner]);

  if (!isOpen) return null;

  const getMessage = () => {
    if (gameStatus === 'checkmate') {
      return winner === 'player'
        ? { title: '🎉 승리!', subtitle: '체크메이트! 정말 잘했어요!' }
        : { title: '😢 패배', subtitle: '다음엔 이길 수 있어요!' };
    }
    if (gameStatus === 'stalemate') {
      return { title: '🤝 무승부', subtitle: '스테일메이트예요!' };
    }
    if (gameStatus === 'draw') {
      return { title: '🤝 무승부', subtitle: '비겼어요!' };
    }
    return { title: '게임 종료', subtitle: '' };
  };

  const message = getMessage();

  return (
    <div className={styles.overlay}>
      <div className={`${styles.modal} ${winner === 'player' ? styles.victory : ''}`}>
        <h2 className={styles.title}>{message.title}</h2>
        <p className={styles.subtitle}>{message.subtitle}</p>

        <div className={styles.buttons}>
          <button className={styles.newGameButton} onClick={onNewGame}>
            🔄 새 게임
          </button>
          <button className={styles.closeButton} onClick={onClose}>
            기보 보기
          </button>
        </div>
      </div>
    </div>
  );
}
