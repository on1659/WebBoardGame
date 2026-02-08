import { useState, useCallback } from 'react';
import { useChessGame } from './hooks/useChessGame';
import DifficultySelect from './components/DifficultySelect';
import Board from './components/Board';
import GameInfo from './components/GameInfo';
import Controls from './components/Controls';
import MoveHistory from './components/MoveHistory';
import Settings from './components/Settings';
import GameOverModal from './components/GameOverModal';
import styles from './App.module.css';

export default function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showGameOverModal, setShowGameOverModal] = useState(true);

  const game = useChessGame('easy');

  const handleDifficultySelect = useCallback((difficulty) => {
    game.newGame(difficulty);
    setGameStarted(true);
    setShowGameOverModal(true);
  }, [game]);

  const handleNewGame = useCallback(() => {
    setGameStarted(false);
    setShowGameOverModal(true);
  }, []);

  const handleNewGameFromModal = useCallback(() => {
    game.newGame();
    setShowGameOverModal(true);
  }, [game]);

  const handleCloseGameOverModal = useCallback(() => {
    setShowGameOverModal(false);
  }, []);

  if (!gameStarted) {
    return <DifficultySelect onSelect={handleDifficultySelect} />;
  }

  const isGameOver = game.gameStatus !== 'playing';

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>체스 게임</h1>
      </div>

      <div className={styles.gameArea}>
        <div className={styles.sidePanel}>
          <GameInfo
            currentTurn={game.currentTurn}
            isAiThinking={game.isAiThinking}
            isCheck={game.isCheck}
            capturedPieces={game.capturedPieces}
            difficulty={game.difficulty}
          />
        </div>

        <div className={styles.boardContainer}>
          <Board
            boardState={game.getBoardState()}
            selectedSquare={game.selectedSquare}
            validMoves={game.validMoves}
            kingSquare={game.kingSquare}
            isCheck={game.isCheck}
            lastMove={game.lastMove}
            showHighlights={game.showHighlights}
            onSquareClick={game.selectSquare}
            isAiThinking={game.isAiThinking}
            pieceStyle={game.pieceStyle}
          />

          <Controls
            onUndo={game.undo}
            onNewGame={handleNewGame}
            onOpenSettings={() => setSettingsOpen(true)}
            canUndo={game.moveHistory.length >= 2}
            isAiThinking={game.isAiThinking}
          />
        </div>

        <div className={styles.sidePanel}>
          <MoveHistory moves={game.moveHistory} />
        </div>
      </div>

      <Settings
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        difficulty={game.difficulty}
        onDifficultyChange={game.setDifficulty}
        showHighlights={game.showHighlights}
        onHighlightsChange={game.setShowHighlights}
        pieceStyle={game.pieceStyle}
        onPieceStyleChange={game.setPieceStyle}
      />

      <GameOverModal
        isOpen={isGameOver && showGameOverModal}
        gameStatus={game.gameStatus}
        winner={game.winner}
        onNewGame={handleNewGameFromModal}
        onClose={handleCloseGameOverModal}
      />
    </div>
  );
}
