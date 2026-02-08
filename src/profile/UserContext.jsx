import { createContext, useContext, useState, useCallback } from 'react';
import { loadProgress, clearProgressCache } from '../games/chess/progress';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = useCallback(async (userData) => {
    setUser(userData);
    await loadProgress(userData.id);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    clearProgressCache();
  }, []);

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
