// ============================================
// src/config/constants.ts - Centralized App Constants
// ============================================

export const CONSTANTS = {
  // --------------------
  // Security & Tokens
  // --------------------
  AUTH: {
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
    JWT_EXPIRES_IN: '7d',
    JWT_REFRESH_EXPIRES_IN: '30d',
  },

  // --------------------
  // Rate Limiting
  // --------------------
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100,
  },

  // --------------------
  // File Uploads
  // --------------------
  FILES: {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'] as const,
    LIMITS: {
      IMAGE_MAX: 5 * 1024 * 1024, // 5MB
      PDF_MAX: 10 * 1024 * 1024,  // 10MB
      IMAGE_ALLOWED: ['image/jpeg', 'image/png', 'image/webp'] as const,
    },
  },

  // --------------------
  // UI Defaults
  // --------------------
  UI: {
    DEFAULT_ACCENT_COLOR: 'blue',
    DEFAULT_THEME_MODE: 'system',
    COLORS: ['blue', 'green', 'purple', 'orange'] as const,
    MOODS: ['great', 'good', 'okay', 'bad', 'terrible'] as const,
    PRIORITY_LEVELS: ['low', 'medium', 'high'] as const,
  },

  // --------------------
  // Planner Configuration
  // --------------------
  PLANNER: {
    SECTION_TYPES: [
      'dailySchedule',
      'todoList',
      'priorities',
      'habitTracker',
      'notes',
      'gratitude',
      'moodTracker',
      'progressTracking',
      'goals',
      'waterIntake',
      'mealPlanning',
      'expenses',
      'reflections',
      'custom',
    ] as const,

    VIEW_TYPES: ['daily', 'weekly', 'monthly', 'yearly'] as const,
    PERMISSIONS: ['view', 'edit'] as const,
    CUSTOM_FIELD_TYPES: ['text', 'number', 'checkbox', 'date', 'time'] as const,

    DEFAULT_PREFERENCES: {
      theme: 'light',
      accentColor: 'blue',
      defaultView: 'daily',
      notifications: true,
    },
  },

  // --------------------
  // Activity & Events
  // --------------------
  ACTIVITY: {
    TYPES: [
      'planner_created',
      'planner_updated',
      'planner_deleted',
      'planner_shared',
      'planner_archived',
      'planner_restored',
      'planner_duplicated',
      'section_created',
      'section_updated',
      'section_deleted',
      'sections_reordered',
      'section_duplicated',
      'sections_bulk_updated',
      'permission_updated',
      'share_removed',
      'invitation_accepted',
      'left_planner',
      'ai_chat',
      'ai_meal_suggestions',
      'ai_schedule_generated',
      'ai_goals_generated',
      'pdf_exported',
      'calendar_exported',
    ] as const,
  },

  // --------------------
  // Pagination
  // --------------------
  PAGINATION: {
    DEFAULT_LIMIT: 50,
    MAX_LIMIT: 100,
  },
} as const;

// ============================================
// Type Aliases (auto-inferred from CONSTANTS)
// ============================================

// Auth & File
export type FileType = (typeof CONSTANTS.FILES.ALLOWED_TYPES)[number];
export type ImageFileType = (typeof CONSTANTS.FILES.LIMITS.IMAGE_ALLOWED)[number];

// UI & Planner
export type AccentColor = (typeof CONSTANTS.UI.COLORS)[number];
export type SectionType = (typeof CONSTANTS.PLANNER.SECTION_TYPES)[number];
export type ViewType = (typeof CONSTANTS.PLANNER.VIEW_TYPES)[number];
export type SharePermission = (typeof CONSTANTS.PLANNER.PERMISSIONS)[number];
export type CustomFieldType = (typeof CONSTANTS.PLANNER.CUSTOM_FIELD_TYPES)[number];
export type MoodType = (typeof CONSTANTS.UI.MOODS)[number];
export type PriorityLevel = (typeof CONSTANTS.UI.PRIORITY_LEVELS)[number];

// Activity
export type ActivityType = (typeof CONSTANTS.ACTIVITY.TYPES)[number];
