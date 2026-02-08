import styles from './Piece.module.css';
import Piece3D from './Piece3D';

const PIECE_SYMBOLS = {
  wp: '♙',
  wn: '♘',
  wb: '♗',
  wr: '♖',
  wq: '♕',
  wk: '♔',
  bp: '♟',
  bn: '♞',
  bb: '♝',
  br: '♜',
  bq: '♛',
  bk: '♚',
};

export default function Piece({ type, color, isSelected, isDragging, pieceStyle = '2d' }) {
  // 3D 스타일
  if (pieceStyle === '3d') {
    return <Piece3D type={type} color={color} isSelected={isSelected} />;
  }

  // 2D 스타일 (기본)
  const symbol = PIECE_SYMBOLS[`${color}${type}`];

  return (
    <div
      className={`${styles.piece} ${isSelected ? styles.selected : ''} ${isDragging ? styles.dragging : ''}`}
      data-color={color}
    >
      {symbol}
    </div>
  );
}
