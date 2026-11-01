import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { USERS, visibleGroups } from './data';
import type { Group, User } from './types';

interface AppState {
  user: User | null;
  route: string;
  login: (u: User) => void;
  logout: () => void;
  nav: (r: string) => void;
  scopedGroups: Group[];
}

const Ctx = createContext<AppState>({
  user: null,
  route: 'home',
  login: () => undefined,
  logout: () => undefined,
  nav: () => undefined,
  scopedGroups: [],
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(USERS[0]);
  const [authed, setAuthed] = useState(false);
  const [route, setRoute] = useState('home');

  const login = useCallback((u: User) => {
    setUser(u);
    setAuthed(true);
    setRoute('home');
  }, []);
  const logout = useCallback(() => {
    setAuthed(false);
    setRoute('home');
  }, []);
  const nav = useCallback((r: string) => setRoute(r), []);

  const value = useMemo<AppState>(
    () => ({
      user: authed ? user : null,
      route: authed ? route : 'login',
      login,
      logout,
      nav,
      scopedGroups: user ? visibleGroups(user) : [],
    }),
    [user, authed, route, login, logout, nav],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useApp = () => useContext(Ctx);
