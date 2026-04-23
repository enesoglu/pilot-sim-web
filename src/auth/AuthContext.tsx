import type { ReactNode } from 'react';
import { createContext, useContext, useState, useCallback } from 'react';
import type { User, Role } from '../data/types';
import { pilotDisplayName } from '../data/pilotProfiles';
import { INSTRUCTOR_USER } from '../data/pilotProfiles';

interface AuthContextValue {
  currentUser: User | null;
  loginAs: (role: Role) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  currentUser: null,
  loginAs: () => undefined,
  logout: () => undefined,
});

export function useAuth() {
  return useContext(AuthContext);
}

function hydrate(): User | null {
  try {
    const raw = localStorage.getItem('currentUser');
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(hydrate);

  const loginAs = useCallback((role: Role) => {
    let user: User;
    if (role === 'instructor') {
      user = INSTRUCTOR_USER;
    } else {
      user = {
        id: '1-left',
        name: pilotDisplayName(1, 'left'),
        role: 'pilot',
        crew: 1,
        seat: 'left',
      };
    }
    localStorage.setItem('currentUser', JSON.stringify(user));
    setCurrentUser(user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, loginAs, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
