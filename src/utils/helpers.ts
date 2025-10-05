// ============================================
// src/utils/helpers.ts - Helper Functions
// ============================================
import { format, parse, isValid } from 'date-fns';

// --------------------
// Date Utilities
// --------------------
export const formatDate = (date: Date, dateFormat: string = 'yyyy-MM-dd'): string => format(date, dateFormat);

export const parseDate = (dateStr: string): Date => {
    const parsed = parse(dateStr, 'yyyy-MM-dd', new Date());
    if (!isValid(parsed)) {
        throw new Error('Invalid date format');
    }
    return parsed;
};

export type ViewType = 'daily' | 'weekly' | 'monthly' | 'yearly';

export const getDateRange = (date: Date, viewType: ViewType): { start: Date; end: Date } => {
    const start = new Date(date);
    const end = new Date(date);

    switch (viewType) {
        case 'daily':
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;

        case 'weekly':
        const dayOfWeek = start.getDay(); // Sunday = 0
        start.setDate(start.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)); // start on Monday
        start.setHours(0, 0, 0, 0);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        break;

        case 'monthly':
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(end.getMonth() + 1, 0); // last day of current month
        end.setHours(23, 59, 59, 999);
        break;

        case 'yearly':
        start.setMonth(0, 1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(11, 31);
        end.setHours(23, 59, 59, 999);
        break;
    }

    return { start, end };
};

export const getWeekNumber = (date: Date): number => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const daysSinceFirstDay = Math.floor((date.getTime() - firstDayOfYear.getTime()) / (24 * 60 * 60 * 1000));
    return Math.ceil((daysSinceFirstDay + firstDayOfYear.getDay() + 1) / 7);
};

// --------------------
// ID & Object Utilities
// --------------------
export const generateId = (): string => {
    // Use crypto.randomUUID() if available, fallback to timestamp + random string
    return typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

export const sanitizeObject = <T extends Record<string, unknown>>(obj: T): Partial<T> => {
    const sanitized: Partial<T> = {};
    Object.keys(obj).forEach((key) => {
        const value = obj[key as keyof T];
        if (value !== undefined && value !== null) {
        sanitized[key as keyof T] = value;
        }
    });
    return sanitized;
};

// --------------------
// Pagination
// --------------------
export const paginate = (page: number = 1, limit: number = 20) => {
    const offset = (page - 1) * limit;
    return { limit, offset };
};


// --------------------
// Response helpers
// --------------------

export const successResponse = (message: string, data?: any) => {
    return {
        status: 'success',
        message,
        data: data ?? null,
        timestamp: new Date().toISOString(),
    };
};

export const errorResponse = (message: string, errors?: any) => {
    return {
        status: 'error',
        message,
        errors: errors ?? null,
        timestamp: new Date().toISOString(),
    };
};
