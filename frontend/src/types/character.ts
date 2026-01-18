/**
 * TypeScript interfaces for character-related components
 */

export interface Character {
  id: number;
  name: string;
  arabic_name: string;
  english_name?: string;
  title?: string;
  description?: string;
  birth_year?: number;
  death_year?: number;
  era: string;
  category: string;
  sub_category?: string;
  slug: string;
  full_story?: string;
  key_achievements?: string[];
  lessons?: string[];
  quotes?: string[];
  profile_image?: string;
  gallery?: string[];
  audio_stories?: AudioStory[];
  animations?: any[];
  timeline_events?: TimelineEvent[];
  birth_place?: string;
  death_place?: string;
  locations?: Location[];
  related_characters?: number[];
  views_count: number;
  likes_count: number;
  shares_count: number;
  is_featured: boolean;
  is_verified: boolean;
  verification_source?: string;
  verification_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AudioStory {
  id: number;
  title: string;
  url: string;
  duration?: number;
  description?: string;
}

export interface TimelineEvent {
  year: number;
  title: string;
  description: string;
  type: 'birth' | 'death' | 'achievement' | 'migration' | 'other';
}

export interface Location {
  name: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  description?: string;
  type: 'birth' | 'death' | 'residence' | 'travel';
}

export interface CharacterHeroProps {
  character: Character;
}

export interface CharacterActionsProps {
  bookmarked: boolean;
  onBookmark: () => void;
  onShare: () => void;
}

export interface CharacterTabsProps {
  character: Character;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export interface CharacterStatsProps {
  character: Character;
}

export interface CharacterTimelineProps {
  events: TimelineEvent[];
}

export interface UserProgress {
  id: number;
  user_id: number;
  character_id: number;
  current_chapter: number;
  total_chapters?: number;
  completion_percentage: number;
  is_completed: boolean;
  bookmarked: boolean;
  notes?: string;
  rating?: number;
  last_position?: number;
  started_at: string;
  completed_at?: string;
  time_spent: number;
}
