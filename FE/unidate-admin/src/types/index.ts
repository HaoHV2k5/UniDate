export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
};

export type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

export type ApiResponse<T> = {
  data: T;
  message: string;
  success: boolean;
};

export type Settings = {
  theme: 'light' | 'dark';
  notificationsEnabled: boolean;
};