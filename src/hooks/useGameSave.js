import { useEffect, useRef, useCallback, useState } from 'react';
import { useUser } from '../profile/UserContext';
import { saveGame, loadGame, deleteGame } from '../profile/api';

/**
 * Hook for auto-saving and resuming game state.
 * @param {string} gameType - e.g. 'chess', 'gomoku', etc.
 * @param {object} options
 * @param {function} options.getState - returns current game state to save
 * @param {function} options.onResume - called with saved state when user chooses to resume
 * @param {boolean} options.gameStarted - whether the game has started (only save when true)
 * @param {boolean} options.gameOver - whether the game is over (delete save when true)
 * @param {number} options.debounceMs - debounce delay, default 1000
 */
export function useGameSave(gameType, { getState, onResume, gameStarted, gameOver, debounceMs = 1000 }) {
  const { user } = useUser();
  const [savedState, setSavedState] = useState(null);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [checked, setChecked] = useState(false);
  const timerRef = useRef(null);
  const lastSavedRef = useRef(null);

  // Check for saved game on mount
  useEffect(() => {
    if (!user?.id || checked) return;
    loadGame(user.id, gameType).then(data => {
      if (data && data.game_state) {
        setSavedState(data.game_state);
        setShowResumeModal(true);
      }
      setChecked(true);
    }).catch(() => setChecked(true));
  }, [user?.id, gameType, checked]);

  // Auto-save on state changes (debounced)
  useEffect(() => {
    if (!user?.id || !gameStarted || gameOver) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const state = getState();
      if (!state) return;
      const json = JSON.stringify(state);
      if (json === lastSavedRef.current) return;
      lastSavedRef.current = json;
      saveGame(user.id, gameType, state).catch(() => {});
    }, debounceMs);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  });

  // Delete save on game over
  useEffect(() => {
    if (!user?.id || !gameOver) return;
    lastSavedRef.current = null;
    deleteGame(user.id, gameType).catch(() => {});
  }, [user?.id, gameType, gameOver]);

  const handleResume = useCallback(() => {
    setShowResumeModal(false);
    if (savedState && onResume) onResume(savedState);
    setSavedState(null);
  }, [savedState, onResume]);

  const handleNewGame = useCallback(() => {
    setShowResumeModal(false);
    setSavedState(null);
    if (user?.id) deleteGame(user.id, gameType).catch(() => {});
  }, [user?.id, gameType]);

  return { showResumeModal, handleResume, handleNewGame };
}
