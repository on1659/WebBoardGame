import { useState, useCallback, useEffect } from 'react';
import { useChessGame } from './hooks/useChessGame';
import { useGameSave } from '../../hooks/useGameSave';
import { usePlayTracking } from '../../hooks/usePlayTracking';
import ResumeModal from '../../components/ResumeModal';
import DifficultySelect from './components/DifficultySelect';
import Board from './components/Board';
import GameInfo from './components/GameInfo';
import Controls from './components/Controls';
import MoveHistory from './components/MoveHistory';
import Settings from './components/Settings';
import GameOverModal from './components/GameOverModal';
import TutorialMode from './tutorial/TutorialMode';
import PuzzleMode from './puzzles/PuzzleMode';
import BlunderModal from './components/BlunderModal';
import HintDisplay from './components/HintDisplay';
import styles from './ChessGame.module.css';

export default function ChessGame({ onBack }) {
  const [mode, setMode] = useState('menu'); // 'menu' | 'game' | 'tutorial' | 'puzzle'
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showGameOverModal, setShowGameOverModal] = useState(true);

  const game = useChessGame('easy');
  const { startTracking, endTracking } = usePlayTracking('chess');

  const isGameOver = game.gameStatus !== 'playing';
  const isGameActive = mode === 'game';

  const { showResumeModal, handleResume, handleNewGame: handleNewFromModal } = useGameSave('chess', {
    getState: () => ({
      fen: game.position,
      moveHistory: game.moveHistory,
      difficulty: game.difficulty,
      capturedPieces: game.capturedPieces,
    }),
    onResume: (state) => {
      game.restoreGame(state);
      setMode('game');
      setShowGameOverModal(true);
      startTracking();
    },
    gameStarted: isGameActive,
    gameOver: isGameOver && isGameActive,
  });

  const handleDifficultySelect = useCallback((difficulty) => {
    game.newGame(difficulty);
    setMode('game');
    setShowGameOverModal(true);
    startTracking();
  }, [game, startTracking]);

  const handleNewGame = useCallback(() => {
    setMode('menu');
    setShowGameOverModal(true);
  }, []);

  useEffect(() => {
    if (!isGameActive || !isGameOver) return;
    if (game.gameStatus === 'checkmate') {
      endTracking(game.winner === 'player' ? 'win' : 'lose');
    } else {
      endTracking('draw');
    }
  }, [isGameOver, isGameActive, game.gameStatus, game.winner, endTracking]);

  const handleNewGameFromModal = useCallback(() => {
    game.newGame();
    setShowGameOverModal(true);
  }, [game]);

  const handleCloseGameOverModal = useCallback(() => {
    setShowGameOverModal(false);
  }, []);

  if (mode === 'tutorial') {
    return <TutorialMode onBack={() => setMode('menu')} />;
  }

  if (mode === 'puzzle') {
    return <PuzzleMode onBack={() => setMode('menu')} />;
  }

  if (mode === 'menu') {
    return (
      <div>
        <DifficultySelect
          onSelect={handleDifficultySelect}
          onTutorial={() => setMode('tutorial')}
          onPuzzle={() => setMode('puzzle')}
        />
        <button className={styles.backButton} onClick={onBack}>
          🏠 홈으로
        </button>
      </div>
    );
  }

  return (
    <>
    <ResumeModal isOpen={showResumeModal} onResume={handleResume} onNewGame={handleNewFromModal} />
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButtonSmall} onClick={onBack}>🏠</button>
        <h1 className={styles.title}>♟️ 체스 게임</h1>
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
            hintMove={game.hintMove}
          />

          <Controls
            onUndo={game.undo}
            onNewGame={handleNewGame}
            onOpenSettings={() => setSettingsOpen(true)}
            onHint={game.requestHint}
            canUndo={game.moveHistory.length >= 2}
            isAiThinking={game.isAiThinking}
          />

          {game.hintInfo && (
            <HintDisplay
              reason={game.hintInfo.reason}
              onDismiss={game.dismissHint}
            />
          )}
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

      <BlunderModal
        isOpen={game.blunderWarning !== null}
        message={game.blunderWarning}
        onConfirm={game.confirmBlunder}
        onUndo={game.cancelBlunder}
      />
    </div>
    </>
  );
}
