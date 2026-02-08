import styles from './Piece3D.module.css';

export default function Piece3D({ type, color, isSelected }) {
  const colorClass = color === 'w' ? styles.white : styles.black;
  const selectedClass = isSelected ? styles.selected : '';

  const renderPiece = () => {
    switch (type) {
      case 'k':
        return <King />;
      case 'q':
        return <Queen />;
      case 'r':
        return <Rook />;
      case 'b':
        return <Bishop />;
      case 'n':
        return <Knight />;
      case 'p':
        return <Pawn />;
      default:
        return null;
    }
  };

  return (
    <div className={`${styles.piece} ${colorClass} ${selectedClass}`}>
      <div className={styles.shadow} />
      {renderPiece()}
    </div>
  );
}

// 킹 - 십자가
function King() {
  return (
    <div className={styles.king}>
      <div className={styles.kingCross}>
        <div className={styles.crossVertical} />
        <div className={styles.crossHorizontal} />
      </div>
      <div className={styles.kingHead} />
      <div className={styles.kingNeck} />
      <div className={styles.kingBody} />
      <div className={styles.kingBase} />
    </div>
  );
}

// 퀸 - 5개 왕관
function Queen() {
  return (
    <div className={styles.queen}>
      <div className={styles.queenCrown}>
        <div className={styles.spike} />
        <div className={styles.spike} />
        <div className={styles.spike} />
        <div className={styles.spike} />
        <div className={styles.spike} />
      </div>
      <div className={styles.queenHead} />
      <div className={styles.queenNeck} />
      <div className={styles.queenBody} />
      <div className={styles.queenBase} />
    </div>
  );
}

// 룩 - 성벽 톱니
function Rook() {
  return (
    <div className={styles.rook}>
      <div className={styles.rookBattlement}>
        <div className={styles.merlon} />
        <div className={styles.crenel} />
        <div className={styles.merlon} />
        <div className={styles.crenel} />
        <div className={styles.merlon} />
      </div>
      <div className={styles.rookTop} />
      <div className={styles.rookBody} />
      <div className={styles.rookBase} />
    </div>
  );
}

// 비숍 - 대각선 컷
function Bishop() {
  return (
    <div className={styles.bishop}>
      <div className={styles.bishopTop} />
      <div className={styles.bishopHead}>
        <div className={styles.bishopSlit} />
      </div>
      <div className={styles.bishopNeck} />
      <div className={styles.bishopBody} />
      <div className={styles.bishopBase} />
    </div>
  );
}

// 나이트 - 말 머리
function Knight() {
  return (
    <div className={styles.knight}>
      <div className={styles.knightEar} />
      <div className={styles.knightHead} />
      <div className={styles.knightFace}>
        <div className={styles.knightEye} />
        <div className={styles.knightNostril} />
      </div>
      <div className={styles.knightNeck} />
      <div className={styles.knightBody} />
      <div className={styles.knightBase} />
    </div>
  );
}

// 폰 - 둥근 머리
function Pawn() {
  return (
    <div className={styles.pawn}>
      <div className={styles.pawnHead} />
      <div className={styles.pawnNeck} />
      <div className={styles.pawnBody} />
      <div className={styles.pawnBase} />
    </div>
  );
}
