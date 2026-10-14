import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile, UserRole } from '../types/salon';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (email: string, role?: UserRole) => boolean;
  register: (fullName: string, email: string, phone: string) => boolean;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  switchRole: (newRole: UserRole) => void;
}

const DEFAULT_USERS: Record<UserRole, UserProfile> = {
  admin: {
    id: 'usr-admin-1',
    fullName: 'Salon Director (Admin)',
    email: 'admin@oasis-salon.in',
    phone: '9151550077',
    role: 'admin',
    createdAt: '2026-01-01T00:00:00Z',
  },
  staff: {
    id: 'stf-1',
    fullName: 'Ramesh Shetty (Senior Stylist)',
    email: 'ramesh@oasis-salon.in',
    phone: '9151550077',
    role: 'staff',
    createdAt: '2026-01-15T00:00:00Z',
  },
  customer: {
    id: 'cust-demo-1',
    fullName: 'Kavya Rai',
    email: 'kavya.rai@example.com',
    phone: '9845112233',
    role: 'customer',
    createdAt: '2026-02-01T00:00:00Z',
  },
};

const AUTH_STORAGE_KEY = 'the_oasis_current_user_v1';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      const restored = stored ? JSON.parse(stored) as UserProfile : DEFAULT_USERS.customer;
      return import.meta.env.DEV ? restored : { ...restored, role: 'customer' };
    } catch {
      return DEFAULT_USERS.customer;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  const login = (email: string, role?: UserRole): boolean => {
    const cleanEmail = email.trim().toLowerCase();
    
    // Check if matching staff/admin credentials
    if (import.meta.env.DEV && (cleanEmail === 'admin@oasis-salon.in' || role === 'admin')) {
      setUser(DEFAULT_USERS.admin);
      return true;
    }
    if (import.meta.env.DEV && (cleanEmail.includes('oasis-salon.in') || role === 'staff')) {
      setUser(DEFAULT_USERS.staff);
      return true;
    }

    // Customer login
    const customerUser: UserProfile = {
      id: `usr-cust-${Date.now()}`,
      fullName: cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      email: cleanEmail,
      phone: '9845112233',
      role: 'customer',
      createdAt: new Date().toISOString(),
    };
    setUser(customerUser);
    return true;
  };

  const register = (fullName: string, email: string, phone: string): boolean => {
    // Security check: public registrations are strictly assigned 'customer' role
    const newUser: UserProfile = {
      id: `usr-cust-${Date.now()}`,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      role: 'customer',
      createdAt: new Date().toISOString(),
    };
    setUser(newUser);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!user) return;
    setUser({ ...user, ...updates });
  };

  const switchRole = (newRole: UserRole) => {
    if (!import.meta.env.DEV) return;
    setUser(DEFAULT_USERS[newRole]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : 'customer',
        isAuthenticated: Boolean(user),
        login,
        register,
        logout,
        updateProfile,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
