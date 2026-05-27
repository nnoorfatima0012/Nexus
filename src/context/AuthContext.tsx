//src/context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, UserRole, AuthContextType } from '../types';
import { loginUser, registerUser, getLoggedInUser } from '../services/authService';
import toast from 'react-hot-toast';
import { updateCurrentUserProfile } from '../services/userService';

// Create Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Local storage keys
const USER_STORAGE_KEY = 'business_nexus_user';
const TOKEN_STORAGE_KEY = 'nexus_token';
const RESET_TOKEN_KEY = 'business_nexus_reset_token';

// Auth Provider Component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for stored user on initial load
 useEffect(() => {
  const loadUser = async () => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);

    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      const data = await getLoggedInUser();
      setUser(data.user);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
    } catch (error) {
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  loadUser();
}, []);
  const login = async (email: string, password: string, role: UserRole): Promise<void> => {
  setIsLoading(true);

  try {
    const data = await loginUser(email, password, role);

    localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));

    setUser(data.user);
    toast.success('Successfully logged in!');
  } catch (error: any) {
    const message = error.response?.data?.message || 'Login failed';
    toast.error(message);
    throw new Error(message);
  } finally {
    setIsLoading(false);
  }
};

const register = async (
  name: string,
  email: string,
  password: string,
  role: UserRole
): Promise<void> => {
  setIsLoading(true);

  try {
    const data = await registerUser(name, email, password, role);

    localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));

    setUser(data.user);
    toast.success('Account created successfully!');
  } catch (error: any) {
    const message = error.response?.data?.message || 'Registration failed';
    toast.error(message);
    throw new Error(message);
  } finally {
    setIsLoading(false);
  }
};

  // Mock forgot password function
  const forgotPassword = async (email: string): Promise<void> => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user exists
      const user = users.find(u => u.email === email);
      if (!user) {
        throw new Error('No account found with this email');
      }
      
      // Generate reset token (in a real app, this would be a secure token)
      const resetToken = Math.random().toString(36).substring(2, 15);
      localStorage.setItem(RESET_TOKEN_KEY, resetToken);
      
      // In a real app, this would send an email
      toast.success('Password reset instructions sent to your email');
    } catch (error) {
      toast.error((error as Error).message);
      throw error;
    }
  };

  // Mock reset password function
  const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verify token
      const storedToken = localStorage.getItem(RESET_TOKEN_KEY);
      if (token !== storedToken) {
        throw new Error('Invalid or expired reset token');
      }
      
      // In a real app, this would update the user's password in the database
      localStorage.removeItem(RESET_TOKEN_KEY);
      toast.success('Password reset successfully');
    } catch (error) {
      toast.error((error as Error).message);
      throw error;
    }
  };

  // Logout function
   const logout = (): void => {
  setUser(null);
  localStorage.removeItem(USER_STORAGE_KEY);
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  toast.success('Logged out successfully');
};

  // Update user profile
const updateProfile = async (userId: string, updates: Partial<User>): Promise<void> => {
  try {
    const data = await updateCurrentUserProfile(updates);

    setUser(data.user);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));

    toast.success('Profile updated successfully');
  } catch (error: any) {
    const message = error.response?.data?.message || 'Profile update failed';
    toast.error(message);
    throw new Error(message);
  }
};

  const value = {
    user,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    isAuthenticated: !!user,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for using auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};