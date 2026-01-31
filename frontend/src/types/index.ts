/**
 * Type definitions for the Islamic Characters application
 * Provides comprehensive type safety across the entire application
 */

// Core Entity Types
export interface IslamicCharacter {
  id: number;
  name: string;
  arabic_name: string;
  english_name?: string;
  title?: string;
  description?: string;
  birth_year?: number;
  death_year?: number;
  era?: string;
  category: IslamicCategory;
  sub_category?: string;
  slug: string;
  full_story?: string;
  key_achievements?: string[];
  lessons?: string[];
  quotes?: string[];
  profile_image?: string;
  gallery?: string[];
  audio_stories?: string[];
  animations?: any[];
  timeline_events?: TimelineEvent[];
  birth_place?: string;
  death_place?: string;
  locations?: string[];
  views_count: number;
  likes_count: number;
  shares_count: number;
  is_featured: boolean;
  is_verified: boolean;
  verification_source?: string;
  verification_notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface TimelineEvent {
  year: number;
  title: string;
  description: string;
  type?: 'birth' | 'death' | 'achievement' | 'migration' | 'battle' | 'treaty';
}

export interface User {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  arabic_name?: string;
  bio?: string;
  avatar_url?: string;
  date_of_birth?: string;
  country?: string;
  preferred_language: 'en' | 'ar';
  level_id: number;
  total_xp: number;
  current_xp: number;
  streak_days: number;
  last_login_date?: string;
  is_active: boolean;
  is_verified: boolean;
  is_guest: boolean;
  created_at: string;
  updated_at?: string;
}

export interface UserProgress {
  id: number;
  user_id: number;
  character_id: number;
  completion_percentage: number;
  last_position?: any;
  time_spent_minutes: number;
  is_bookmarked: boolean;
  is_favorite: boolean;
  achievements_unlocked?: string[];
  started_at: string;
  completed_at?: string;
  last_accessed_at?: string;
}

export interface Level {
  id: number;
  name: string;
  description: string;
  xp_required: number;
  badge_icon?: string;
  color?: string;
  sort_order: number;
}

export interface Quiz {
  id: number;
  title: string;
  description: string;
  level_id: number;
  questions: QuizQuestion[];
  time_limit?: number;
  passing_score: number;
  max_attempts: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation?: string;
  type: 'multiple_choice' | 'true_false' | 'fill_blank';
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
  cached?: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface SearchResponse {
  results: IslamicCharacter[];
  total: number;
  query: string;
  filters: SearchFilters;
  took: number; // milliseconds
}

export interface SearchFilters {
  category?: IslamicCategory;
  era?: string;
  limit?: number;
  offset?: number;
}

// Component Props Types
export interface CharacterCardProps {
  character: IslamicCharacter;
  showProgress?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
  onClick?: (character: IslamicCharacter) => void;
  className?: string;
}

export interface CharacterListProps {
  characters: IslamicCharacter[];
  loading?: boolean;
  error?: string;
  onCharacterClick?: (character: IslamicCharacter) => void;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  filters?: SearchFilters;
  onFiltersChange?: (filters: SearchFilters) => void;
}

export interface AdminFormProps {
  initialData?: Partial<IslamicCharacter>;
  onSubmit: (data: CharacterFormData) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  error?: string;
}

export interface SearchBoxProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  initialValue?: string;
  debounceMs?: number;
  showFilters?: boolean;
  filters?: SearchFilters;
  onFiltersChange?: (filters: SearchFilters) => void;
}

// Form Types
export interface CharacterFormData {
  name: string;
  arabic_name: string;
  english_name?: string;
  title?: string;
  description?: string;
  birth_year?: number;
  death_year?: number;
  era?: string;
  category: IslamicCategory;
  sub_category?: string;
  slug?: string;
  full_story?: string;
  key_achievements?: string[];
  lessons?: string[];
  quotes?: string[];
  profile_image?: string;
  gallery?: string[];
  audio_stories?: string[];
  animations?: any[];
  timeline_events?: TimelineEvent[];
  birth_place?: string;
  death_place?: string;
  locations?: string[];
  is_featured?: boolean;
  is_verified?: boolean;
  verification_source?: string;
  verification_notes?: string;
}

export interface LoginForm {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface RegisterForm {
  email: string;
  username: string;
  password: string;
  confirm_password: string;
  full_name?: string;
  arabic_name?: string;
  preferred_language?: 'en' | 'ar';
}

export interface ProfileForm {
  full_name?: string;
  arabic_name?: string;
  bio?: string;
  country?: string;
  preferred_language?: 'en' | 'ar';
  avatar_url?: string;
}

// State Management Types
export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  token?: string;
}

export interface AppState {
  characters: IslamicCharacter[];
  featuredCharacters: IslamicCharacter[];
  categories: IslamicCategory[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  filters: SearchFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface GamificationState {
  user: User;
  level: Level;
  progress: UserProgress[];
  achievements: Achievement[];
  streak: number;
  totalXP: number;
  leaderboard: LeaderboardEntry[];
}

export interface ThemeState {
  mode: 'light' | 'dark' | 'auto';
  primaryColor: string;
  fontSize: 'small' | 'medium' | 'large';
  language: 'en' | 'ar';
  direction: 'ltr' | 'rtl';
}

// Utility Types
export type IslamicCategory = 
  | 'الأنبياء' 
  | 'الصحابة' 
  | 'التابعون' 
  | 'العلماء' 
  | 'الخلفاء' 
  | 'القادة' 
  | 'الفقهاء' 
  | 'المحدثون' 
  | 'المفكرون';

export type IslamicEra = 
  | 'Pre-Islamic'
  | 'Early Islam'
  | 'Rashidun Caliphate'
  | 'Umayyad Caliphate'
  | 'Abbasid Caliphate'
  | 'Ottoman Empire'
  | 'Modern Era'
  | '7th Century'
  | '8th Century'
  | '9th Century'
  | '10th Century'
  | '11th Century'
  | '12th Century'
  | '13th Century'
  | '14th Century'
  | '15th Century';

export type SortField = 
  | 'name'
  | 'arabic_name'
  | 'birth_year'
  | 'death_year'
  | 'views_count'
  | 'likes_count'
  | 'created_at'
  | 'updated_at';

export type SortOrder = 'asc' | 'desc';

export type ViewMode = 'grid' | 'list' | 'card';

export type FilterOperator = 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than';

// Error Types
export interface ApiError {
  status: number;
  message: string;
  details?: any;
  code?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface NetworkError {
  type: 'timeout' | 'network' | 'server' | 'unknown';
  message: string;
  originalError?: Error;
}

// Event Types
export interface AnalyticsEvent {
  event: string;
  data?: Record<string, any>;
  timestamp: number;
  user_id?: number;
  session_id?: string;
}

export interface UserInteractionEvent extends AnalyticsEvent {
  interaction_type: 'click' | 'view' | 'search' | 'share' | 'bookmark' | 'favorite';
  target_type: 'character' | 'category' | 'quiz' | 'search';
  target_id?: number | string;
}

export interface PerformanceEvent extends AnalyticsEvent {
  metric_name: string;
  metric_value: number;
  metric_unit: string;
}

// Configuration Types
export interface AppConfig {
  apiBaseUrl: string;
  environment: 'development' | 'staging' | 'production';
  features: {
    analytics: boolean;
    caching: boolean;
    offlineMode: boolean;
    pushNotifications: boolean;
  };
  performance: {
    enableServiceWorker: boolean;
    enablePreloading: boolean;
    enableLazyLoading: boolean;
  };
  ui: {
    theme: ThemeState;
    language: 'en' | 'ar';
    direction: 'ltr' | 'rtl';
  };
}

export interface CacheConfig {
  defaultTTL: number;
  maxSize: number;
  storage: 'memory' | 'localStorage' | 'sessionStorage';
  strategies: {
    characters: number;
    categories: number;
    search: number;
    user: number;
  };
}

// Hook Types
export interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => Promise<void>;
  mutate: (data: T) => Promise<void>;
}

export interface UsePaginationResult<T> {
  data: T[];
  loading: boolean;
  error: ApiError | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  setLimit: (limit: number) => void;
}

export interface UseSearchResult<T> {
  results: T[];
  loading: boolean;
  error: ApiError | null;
  query: string;
  filters: SearchFilters;
  setQuery: (query: string) => void;
  setFilters: (filters: SearchFilters) => void;
  clearFilters: () => void;
  total: number;
  took: number;
}

// Component Library Types
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: (value: string) => void;
  onFocus?: (value: string) => void;
  error?: string;
  helperText?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  children: React.ReactNode;
  className?: string;
}

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Service Types
export interface ApiService {
  get<T>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>>;
  post<T>(url: string, data?: any): Promise<ApiResponse<T>>;
  put<T>(url: string, data?: any): Promise<ApiResponse<T>>;
  delete<T>(url: string): Promise<ApiResponse<T>>;
  patch<T>(url: string, data?: any): Promise<ApiResponse<T>>;
}

export interface CacheService {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T, ttl?: number): void;
  delete(key: string): void;
  clear(): void;
  getStats(): CacheStats;
}

export interface CacheStats {
  size: number;
  maxSize: number;
  hitCount: number;
  missCount: number;
  hitRate: number;
  storage: string;
}

// Middleware Types
export interface RequestMiddleware {
  onRequest(config: any): any;
  onResponse(response: any): any;
  onError(error: any): any;
}

export interface AuthMiddleware {
  getToken(): string | null;
  setToken(token: string): void;
  removeToken(): void;
  refreshToken(): Promise<string>;
  isAuthenticated(): boolean;
}

export interface AnalyticsMiddleware {
  track(event: AnalyticsEvent): void;
  trackPageView(page: string, data?: any): void;
  trackUserAction(action: UserInteractionEvent): void;
  trackPerformance(metric: PerformanceEvent): void;
}

// Export all types for easy importing
export type {
  // Re-export commonly used types
  IslamicCharacter as Character,
  UserProgress as Progress,
  IslamicCategory as Category,
  IslamicEra as Era,
  ApiError as Error,
  ValidationError as ValidationErr,
};

// Utility type helpers
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Type guards
export const isIslamicCharacter = (obj: any): obj is IslamicCharacter => {
  return obj && typeof obj === 'object' && 
         typeof obj.id === 'number' &&
         typeof obj.name === 'string' &&
         typeof obj.arabic_name === 'string' &&
         typeof obj.category === 'string';
};

export const isUser = (obj: any): obj is User => {
  return obj && typeof obj === 'object' &&
         typeof obj.id === 'number' &&
         typeof obj.email === 'string' &&
         typeof obj.username === 'string';
};

export const isApiError = (obj: any): obj is ApiError => {
  return obj && typeof obj === 'object' &&
         typeof obj.status === 'number' &&
         typeof obj.message === 'string';
};

// Default exports
export default {
  IslamicCharacter,
  User,
  UserProgress,
  Level,
  Quiz,
  ApiResponse,
  PaginatedResponse,
  SearchResponse,
  CharacterFormData,
  LoginForm,
  RegisterForm,
  AuthState,
  AppState,
  GamificationState,
  ThemeState,
  AppConfig,
  UseApiResult,
  UsePaginationResult,
  UseSearchResult,
};
