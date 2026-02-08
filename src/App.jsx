import { UserProvider, useUser } from './profile/UserContext';
import ProfileScreen from './profile/ProfileScreen';
import HomeScreen from './HomeScreen';
import ProgressPage from './profile/ProgressPage';
import ChessGame from './games/chess/ChessGame';
import GomokuGame from './games/gomoku/GomokuGame';
import { useState, useCallback } from 'react';

function AppInner() {
  const { user, logout } = useUser();
  const [currentGame, setCurrentGame] = useState(null);
  const [showProgress, setShowProgress] = useState(false);

  const handleBack = useCallback(() => {
    setCurrentGame(null);
    setShowProgress(false);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    setCurrentGame(null);
    setShowProgress(false);
  }, [logout]);

  if (!user) {
    return <ProfileScreen />;
  }

  if (showProgress) {
    return <ProgressPage profileName={user.name} userId={user.id} onBack={handleBack} />;
  }

  if (currentGame === 'chess') {
    return <ChessGame onBack={handleBack} />;
  }

  if (currentGame === 'gomoku') {
    return <GomokuGame onBack={handleBack} />;
  }

  return (
    <HomeScreen
      profileName={user.name}
      userId={user.id}
      onSelectGame={setCurrentGame}
      onLogout={handleLogout}
      onShowProgress={() => setShowProgress(true)}
    />
  );
}

export default function App() {
  return (
    <UserProvider>
      <AppInner />
    </UserProvider>
  );
}
