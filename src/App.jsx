import { UserProvider, useUser } from './profile/UserContext';
import ProfileScreen from './profile/ProfileScreen';
import HomeScreen from './HomeScreen';
import ProgressPage from './profile/ProgressPage';
import ChessGame from './games/chess/ChessGame';
import GomokuGame from './games/gomoku/GomokuGame';
import OthelloGame from './games/othello/OthelloGame';
import Connect4Game from './games/connect4/Connect4Game';
import MemoryGame from './games/memory/MemoryGame';
import SudokuGame from './games/sudoku/SudokuGame';
import MinesweeperGame from './games/minesweeper/MinesweeperGame';
import BadukGame from './games/baduk/BadukGame';
import Leaderboard from './components/Leaderboard';
import StatsPage from './components/StatsPage';
import { useState, useCallback, useEffect } from 'react';

function AppInner() {
  const { user, logout, autoLoginDone } = useUser();
  const [currentGame, setCurrentGame] = useState(null);
  const [showProgress, setShowProgress] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const isHome = !currentGame && !showProgress && !showLogin && !showLeaderboard && !showStats;

  const handleBack = useCallback(() => {
    setCurrentGame(null);
    setShowProgress(false);
    setShowLogin(false);
    setShowLeaderboard(false);
    setShowStats(false);
  }, []);

  // 브라우저 뒤로가기 지원
  useEffect(() => {
    if (!isHome) {
      window.history.pushState({ page: 'sub' }, '');
    }

    const onPopState = (e) => {
      if (!isHome) {
        handleBack();
      }
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [isHome, handleBack]);

  const handleLogout = useCallback(() => {
    logout();
    setCurrentGame(null);
    setShowProgress(false);
  }, [logout]);

  const handleSelectGame = useCallback((game) => {
    if (!user) {
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

  // 자동 로그인 중 로딩
  if (!autoLoginDone) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '32px' }}>
        🎮 로딩 중...
      </div>
    );
  }

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

  if (showStats) {
    return <StatsPage onBack={handleBack} />;
  }

  if (showLeaderboard) {
    return <Leaderboard onBack={handleBack} />;
  }

  if (currentGame === 'memory') {
    if (!user) { setShowLogin(true); return null; }
    return <MemoryGame onBack={handleBack} />;
  }

  if (currentGame === 'sudoku') {
    if (!user) { setShowLogin(true); return null; }
    return <SudokuGame onBack={handleBack} />;
  }

  if (currentGame === 'minesweeper') {
    if (!user) { setShowLogin(true); return null; }
    return <MinesweeperGame onBack={handleBack} />;
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

  if (currentGame === 'baduk') {
    if (!user) { setShowLogin(true); return null; }
    return <BadukGame onBack={handleBack} />;
  }

  return (
    <HomeScreen
      profileName={user?.name}
      userId={user?.id}
      onSelectGame={handleSelectGame}
      onLogout={user ? handleLogout : null}
      onShowProgress={handleShowProgress}
      onLogin={() => setShowLogin(true)}
      onShowLeaderboard={() => setShowLeaderboard(true)}
      onShowStats={() => setShowStats(true)}
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
