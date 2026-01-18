/**
 * Common TypeScript interfaces used across the application
 */

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ErrorState {
  message: string;
  code?: string;
  details?: any;
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  language: string;
  theme: string;
  notification_settings?: any;
  total_stories_completed: number;
  total_time_spent: number;
  streak_days: number;
  created_at: string;
  last_active: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface ThemeConfig {
  mode: 'light' | 'dark';
  primaryColor: string;
  fontFamily: string;
  fontSize: 'small' | 'medium' | 'large';
}

export interface NotificationConfig {
  email: boolean;
  push: boolean;
  stories: boolean;
  progress: boolean;
  recommendations: boolean;
}

export interface AppConfig {
  apiBaseUrl: string;
  version: string;
  features: {
    audioStories: boolean;
    animations: boolean;
    sharing: boolean;
    bookmarks: boolean;
  };
  theme: ThemeConfig;
  notifications: NotificationConfig;
}
