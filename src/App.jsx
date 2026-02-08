import { useState, useCallback } from 'react';
import HomeScreen from './HomeScreen';
import ChessGame from './games/chess/ChessGame';
import GomokuGame from './games/gomoku/GomokuGame';

export default function App() {
  const [currentGame, setCurrentGame] = useState(null);

  const handleSelectGame = useCallback((gameId) => {
    setCurrentGame(gameId);
  }, []);

  const handleBack = useCallback(() => {
    setCurrentGame(null);
  }, []);

  if (currentGame === 'chess') {
    return <ChessGame onBack={handleBack} />;
  }

  if (currentGame === 'gomoku') {
    return <GomokuGame onBack={handleBack} />;
  }

  return <HomeScreen onSelectGame={handleSelectGame} />;
}
