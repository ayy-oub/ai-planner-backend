// src/models/validators.ts
import Joi from 'joi';

// Auth validators
export const registerSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    displayName: Joi.string().min(2).max(50).required()
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

export const updateProfileSchema = Joi.object({
    displayName: Joi.string().min(2).max(50),
    photoURL: Joi.string().uri().allow(null),
    preferences: Joi.object({
        theme: Joi.string().valid('light', 'dark'),
        accentColor: Joi.string().valid('blue', 'green', 'purple', 'orange'),
        defaultView: Joi.string().valid('daily', 'weekly', 'monthly', 'yearly'),
        notifications: Joi.boolean()
    })
});

export const changePasswordSchema = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required()
});

// Planner validators
export const createPlannerSchema = Joi.object({
    title: Joi.string().min(1).max(100).required(),
    color: Joi.string().valid('blue', 'green', 'purple', 'orange').default('blue'),
    icon: Joi.string().max(50).default('calendar'),
    description: Joi.string().max(500).allow(''),
    isDefault: Joi.boolean().default(false)
});

export const updatePlannerSchema = Joi.object({
    title: Joi.string().min(1).max(100),
    color: Joi.string().valid('blue', 'green', 'purple', 'orange'),
    icon: Joi.string().max(50),
    description: Joi.string().max(500),
    isDefault: Joi.boolean()
});

// Section validators
export const createSectionSchema = Joi.object({
    date: Joi.string().isoDate().required(),
    type: Joi.string().valid(
        'daily_schedule',
        'todo_list',
        'priorities',
        'habit_tracker',
        'notes',
        'gratitude',
        'mood_tracker',
        'progress',
        'goals',
        'water_intake',
        'meal_planning',
        'expenses',
        'reflections',
        'custom'
    ).required(),
    title: Joi.string().max(100),
    content: Joi.object().required(),
    order: Joi.number().integer().min(0).default(0),
    isCollapsed: Joi.boolean().default(false)
});

export const updateSectionSchema = Joi.object({
    title: Joi.string().max(100),
    content: Joi.object(),
    order: Joi.number().integer().min(0),
    isCollapsed: Joi.boolean()
});

// Sharing validators
export const sharePlannerSchema = Joi.object({
    email: Joi.string().email().required(),
    permission: Joi.string().valid('view', 'edit').required()
});

export const updatePermissionSchema = Joi.object({
    permission: Joi.string().valid('view', 'edit').required()
});

// AI validators
export const chatMessageSchema = Joi.object({
    plannerId: Joi.string().required(),
    message: Joi.string().min(1).max(1000).required(),
    context: Joi.object({
        date: Joi.string().isoDate(),
        sections: Joi.array().items(Joi.string())
    })
});

// Export validators
export const exportPDFSchema = Joi.object({
    date: Joi.string().isoDate(),
    startDate: Joi.string().isoDate(),
    endDate: Joi.string().isoDate(),
    viewType: Joi.string().valid('daily', 'weekly', 'monthly', 'yearly').required(),
    includeSections: Joi.array().items(Joi.string())
});

// Handwriting validators
export const handwritingSchema = Joi.object({
    drawingData: Joi.string().required(),
    sectionId: Joi.string(),
    plannerId: Joi.string()
});