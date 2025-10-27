import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  user: any; // Replace 'any' with a specific user type if available
  login: (userData: any) => void; // Replace 'any' with specific user data type
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null); // Replace 'any' with a specific user type if available

  const login = (userData: any) => { // Replace 'any' with specific user data type
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};