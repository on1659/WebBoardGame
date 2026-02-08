import { UserProvider, useUser } from './profile/UserContext';
import ProfileScreen from './profile/ProfileScreen';
import HomeScreen from './HomeScreen';
import ProgressPage from './profile/ProgressPage';
import ChessGame from './games/chess/ChessGame';
import GomokuGame from './games/gomoku/GomokuGame';
import OthelloGame from './games/othello/OthelloGame';
import Connect4Game from './games/connect4/Connect4Game';
import TicTacToeGame from './games/tictactoe/TicTacToeGame';
import { useState, useCallback } from 'react';

function AppInner() {
  const { user, logout } = useUser();
  const [currentGame, setCurrentGame] = useState(null);
  const [showProgress, setShowProgress] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const handleBack = useCallback(() => {
    setCurrentGame(null);
    setShowProgress(false);
    setShowLogin(false);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    setCurrentGame(null);
    setShowProgress(false);
  }, [logout]);

  const handleSelectGame = useCallback((game) => {
    if (!user) {
      // 로그인 안 했으면 로그인 먼저, 그 다음 게임으로
      setCurrentGame(game);
      setShowLogin(true);
    } else {
      setCurrentGame(game);
    }
  }, [user]);

  const handleShowProgress = useCallback(() => {
    if (!user) {
      setShowLogin(true);
      setShowProgress(true);
    } else {
      setShowProgress(true);
    }
  }, [user]);

  // 로그인 필요할 때
  if (showLogin && !user) {
    return <ProfileScreen onBack={() => { setShowLogin(false); setCurrentGame(null); setShowProgress(false); }} />;
  }

  // 로그인 완료 후 게임으로
  if (showLogin && user) {
    setShowLogin(false);
  }

  if (showProgress && user) {
    return <ProgressPage profileName={user.name} userId={user.id} onBack={handleBack} />;
  }

  if (currentGame === 'chess') {
    if (!user) { setShowLogin(true); return null; }
    return <ChessGame onBack={handleBack} />;
  }

  if (currentGame === 'gomoku') {
    if (!user) { setShowLogin(true); return null; }
    return <GomokuGame onBack={handleBack} />;
  }

  if (currentGame === 'othello') {
    if (!user) { setShowLogin(true); return null; }
    return <OthelloGame onBack={handleBack} />;
  }

  if (currentGame === 'connect4') {
    if (!user) { setShowLogin(true); return null; }
    return <Connect4Game onBack={handleBack} />;
  }

  if (currentGame === 'tictactoe') {
    if (!user) { setShowLogin(true); return null; }
    return <TicTacToeGame onBack={handleBack} />;
  }

  return (
    <HomeScreen
      profileName={user?.name}
      userId={user?.id}
      onSelectGame={handleSelectGame}
      onLogout={user ? handleLogout : null}
      onShowProgress={handleShowProgress}
      onLogin={() => setShowLogin(true)}
      isLoggedIn={!!user}
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
