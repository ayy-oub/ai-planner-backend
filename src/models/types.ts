// src/models/types.ts

export interface User {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    authProvider?: 'email' | 'google' | 'apple';
    preferences: UserPreferences;
    createdAt: Date;
    lastLogin: Date;
    updatedAt?: Date;
}

export interface UserPreferences {
    theme: 'light' | 'dark';
    accentColor: 'blue' | 'green' | 'purple' | 'orange';
    defaultView: 'daily' | 'weekly' | 'monthly' | 'yearly';
    notifications: boolean;
}

export interface Planner {
    id: string;
    userId: string;
    title: string;
    color: string;
    icon: string;
    description: string;
    isDefault: boolean;
    isArchived: boolean;
    archivedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface Section {
    id: string;
    plannerId: string;
    date: string; // ISO date string
    type: SectionType;
    title: string;
    content: SectionContent;
    order: number;
    isCollapsed: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy?: string;
}

export type SectionType =
    | 'daily_schedule'
    | 'todo_list'
    | 'priorities'
    | 'habit_tracker'
    | 'notes'
    | 'gratitude'
    | 'mood_tracker'
    | 'progress'
    | 'goals'
    | 'water_intake'
    | 'meal_planning'
    | 'expenses'
    | 'reflections'
    | 'custom';

export type SectionContent = 
    | DailyScheduleContent
    | TodoListContent
    | PrioritiesContent
    | HabitTrackerContent
    | NotesContent
    | GratitudeContent
    | MoodTrackerContent
    | ProgressContent
    | GoalsContent
    | WaterIntakeContent
    | MealPlanningContent
    | ExpensesContent
    | ReflectionsContent
    | CustomSectionContent;

export interface DailyScheduleContent {
    events: ScheduleEvent[];
}

export interface ScheduleEvent {
    id: string;
    time: string; // HH:mm
    title: string;
    description?: string;
    completed: boolean;
}

export interface TodoListContent {
    tasks: TodoTask[];
}

export interface TodoTask {
    id: string;
    text: string;
    completed: boolean;
    priority?: 'low' | 'medium' | 'high';
}

export interface PrioritiesContent {
    priorities: Priority[];
}

export interface Priority {
    id: string;
    text: string;
    order: number;
}

export interface HabitTrackerContent {
    habits: Habit[];
}

export interface Habit {
    id: string;
    name: string;
    completed: boolean;
    streak: number;
}

export interface NotesContent {
    text: string;
    handwritingId?: string;
}

export interface GratitudeContent {
    items: string[];
}

export interface MoodTrackerContent {
    mood: 'great' | 'good' | 'okay' | 'bad' | 'terrible';
    note?: string;
}

export interface ProgressContent {
    items: ProgressItem[];
}

export interface ProgressItem {
    id: string;
    label: string;
    current: number;
    target: number;
    unit: string;
}

export interface GoalsContent {
    weekly?: Goal[];
    monthly?: Goal[];
    yearly?: Goal[];
}

export interface Goal {
    id: string;
    text: string;
    completed: boolean;
}

export interface WaterIntakeContent {
    glasses: number;
    target: number;
}

export interface MealPlanningContent {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
    snacks?: string;
}

export interface ExpensesContent {
    items: Expense[];
    total: number;
}

export interface Expense {
    id: string;
    description: string;
    amount: number;
    category?: string;
}

export interface ReflectionsContent {
    text: string;
}

export interface CustomSectionContent {
    fields: CustomField[];
}

export interface CustomField {
    id: string;
    type: 'text' | 'number' | 'checkbox' | 'date' | 'time';
    label: string;
    value: any;
}

export interface PlannerShare {
    id: string;
    plannerId: string;
    ownerId: string;
    sharedWithUserId: string;
    sharedWithEmail: string;
    permission: 'view' | 'edit';
    isAccepted: boolean;
    acceptedAt?: Date;
    createdAt: Date;
    updatedAt?: Date;
}

export interface ActivityLog {
    id: string;
    plannerId: string;
    userId: string;
    activityType: ActivityType;
    description: string;
    metadata?: Record<string, any>;
    timestamp: Date;
}

export type ActivityType =
    | 'planner_created'
    | 'planner_updated'
    | 'planner_deleted'
    | 'planner_shared'
    | 'planner_archived'
    | 'planner_restored'
    | 'planner_duplicated'
    | 'section_created'
    | 'section_updated'
    | 'section_deleted'
    | 'sections_reordered'
    | 'section_duplicated'
    | 'sections_bulk_updated'
    | 'permission_updated'
    | 'share_removed'
    | 'invitation_accepted'
    | 'left_planner'
    | 'ai_chat'
    | 'ai_meal_suggestions'
    | 'ai_schedule_generated'
    | 'ai_goals_generated'
    | 'pdf_exported'
    | 'calendar_exported';


export interface ExportRecord {
    id: string;
    userId: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    filePath: string;
    filename: string;
    createdAt?: FirebaseFirestore.Timestamp;
    completedAt?: FirebaseFirestore.Timestamp;
    [key: string]: any; // for any optional metadata
}

export interface HandwritingRecord {
    id: string;
    userId: string;
    plannerId?: string;
    drawingData: string;
    createdAt?: FirebaseFirestore.Timestamp;
    updatedAt?: FirebaseFirestore.Timestamp;
    [key: string]: any; // optional metadata
}