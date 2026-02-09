import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { loadProgress, clearProgressCache } from '../games/chess/progress';
import { loginUserByName } from './api';

const UserContext = createContext(null);
const AUTO_LOGIN_KEY = 'webboardgame_auto_login';

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [autoLoginDone, setAutoLoginDone] = useState(false);

  // 앱 시작 시 자동 로그인 시도
  useEffect(() => {
    (async () => {
      try {
        const saved = localStorage.getItem(AUTO_LOGIN_KEY);
        if (saved) {
          const { name, pin } = JSON.parse(saved);
          const userData = await loginUserByName(name, pin);
          setUser(userData);
          await loadProgress(userData.id);
        }
      } catch {
        // 로그인 실패하면 저장된 정보 삭제
        localStorage.removeItem(AUTO_LOGIN_KEY);
      } finally {
        setAutoLoginDone(true);
      }
    })();
  }, []);

  const login = useCallback(async (userData, credentials) => {
    setUser(userData);
    // credentials = { name, pin } — 로그인/가입 시 전달
    if (credentials) {
      localStorage.setItem(AUTO_LOGIN_KEY, JSON.stringify(credentials));
    }
    await loadProgress(userData.id);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(AUTO_LOGIN_KEY);
    clearProgressCache();
  }, []);

  return (
    <UserContext.Provider value={{ user, login, logout, autoLoginDone }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
