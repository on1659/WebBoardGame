import styles from './Square.module.css';
import Piece from './Piece';

export default function Square({
  square,
  piece,
  isLight,
  isSelected,
  isValidMove,
  isCapture,
  isCheck,
  isLastMove,
  isHint,
  onClick,
  pieceStyle,
}) {
  const getClassName = () => {
    const classes = [styles.square];

    if (isLight) {
      classes.push(styles.light);
    } else {
      classes.push(styles.dark);
    }

    if (isSelected) classes.push(styles.selected);
    if (isCheck) classes.push(styles.check);
    if (isLastMove) classes.push(styles.lastMove);
    if (isHint) classes.push(styles.hint);

    return classes.join(' ');
  };

  return (
    <div
      className={getClassName()}
      onClick={onClick}
      data-square={square}
    >
      {piece && (
        <Piece
          type={piece.type}
          color={piece.color}
          isSelected={isSelected}
          pieceStyle={pieceStyle}
        />
      )}

      {isValidMove && !piece && (
        <div className={styles.validMoveIndicator} />
      )}

      {isCapture && piece && (
        <div className={styles.captureIndicator} />
      )}
    </div>
  );
}
