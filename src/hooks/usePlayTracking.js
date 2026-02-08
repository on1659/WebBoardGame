import { useRef, useCallback } from 'react';
import { useUser } from '../profile/UserContext';
import { recordPlay } from '../profile/api';

export function usePlayTracking(gameType) {
  const { user } = useUser();
  const startTimeRef = useRef(null);

  const startTracking = useCallback(() => {
    startTimeRef.current = Date.now();
  }, []);

  const endTracking = useCallback((result) => {
    const duration = startTimeRef.current
      ? Math.round((Date.now() - startTimeRef.current) / 1000)
      : null;
    recordPlay(user?.id || null, gameType, result, duration).catch(() => {});
    startTimeRef.current = null;
  }, [user, gameType]);

  return { startTracking, endTracking };
}
