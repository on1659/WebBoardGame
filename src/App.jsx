import { useState, useCallback, useEffect } from 'react';
import { useUser } from './profile/UserContext';
import ProfileScreen from './profile/ProfileScreen';
import HomeScreen from './HomeScreen';
import ChessGame from './games/chess/ChessGame';
import GomokuGame from './games/gomoku/GomokuGame';
import { loadProgressFromServer } from './games/chess/progress';

export default function App() {
  const { user, logout } = useUser();
  const [currentGame, setCurrentGame] = useState(null);
  const [progressLoaded, setProgressLoaded] = useState(false);

  useEffect(() => {
    if (user) {
      setProgressLoaded(false);
      loadProgressFromServer(user.id).then(() => setProgressLoaded(true));
    } else {
      setProgressLoaded(false);
    }
  }, [user]);

  const handleSelectGame = useCallback((gameId) => {
    setCurrentGame(gameId);
  }, []);

  const handleBack = useCallback(() => {
    setCurrentGame(null);
  }, []);

  if (!user) {
    return <ProfileScreen />;
  }

  if (!progressLoaded) {
    return <div style={{ textAlign: 'center', padding: 40, fontSize: 28 }}>불러오는 중... ⏳</div>;
  }

  if (currentGame === 'chess') {
    return <ChessGame onBack={handleBack} />;
  }

  if (currentGame === 'gomoku') {
    return <GomokuGame onBack={handleBack} />;
  }

  return <HomeScreen onSelectGame={handleSelectGame} user={user} onLogout={logout} />;
}
