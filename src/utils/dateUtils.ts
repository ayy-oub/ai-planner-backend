// ============================================
// src/utils/dateUtils.ts - Date Utilities
// ============================================
import {
    addDays,
    addWeeks,
    addMonths,
    addYears,
    subDays,
    subWeeks,
    subMonths,
    subYears,
    format,
} from 'date-fns';
import { getWeekNumber } from './helpers';

export type ViewType = 'daily' | 'weekly' | 'monthly' | 'yearly';

export class DateUtils {
    // --------------------
    // Next / Previous Period
    // --------------------
    static getNextPeriod(date: Date, viewType: ViewType): Date {
        switch (viewType) {
        case 'daily':
            return addDays(date, 1);
        case 'weekly':
            return addWeeks(date, 1);
        case 'monthly':
            return addMonths(date, 1);
        case 'yearly':
            return addYears(date, 1);
        }
    }

    static getPreviousPeriod(date: Date, viewType: ViewType): Date {
        switch (viewType) {
        case 'daily':
            return subDays(date, 1);
        case 'weekly':
            return subWeeks(date, 1);
        case 'monthly':
            return subMonths(date, 1);
        case 'yearly':
            return subYears(date, 1);
        }
    }

    // --------------------
    // Format Period Name
    // --------------------
    static formatPeriodName(date: Date, viewType: ViewType): string {
        switch (viewType) {
        case 'daily':
            return format(date, 'EEEE, MMMM d, yyyy');
        case 'weekly': {
            const weekStart = this.getWeekStart(date);
            const weekEnd = addDays(weekStart, 6);
            return `Week ${getWeekNumber(date)} - ${format(weekStart, 'MMM d')} to ${format(weekEnd, 'MMM d')}`;
        }
        case 'monthly':
            return format(date, 'MMMM yyyy');
        case 'yearly':
            return format(date, 'yyyy');
        }
    }

    // --------------------
    // Week Utilities
    // --------------------
    static getWeekStart(date: Date): Date {
        const dayOfWeek = date.getDay(); // Sunday = 0
        const start = new Date(date);
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // start on Monday
        start.setDate(start.getDate() + diff);
        start.setHours(0, 0, 0, 0);
        return start;
    }

    // --------------------
    // Month Utilities
    // --------------------
    static getDaysInMonth(date: Date): Date[] {
        const year = date.getFullYear();
        const month = date.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        return Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1));
    }

    static getMonthsInYear(date: Date): Date[] {
        const year = date.getFullYear();
        return Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));
    }
}
