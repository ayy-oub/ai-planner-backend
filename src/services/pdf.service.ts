// src/services/pdf.service.ts
import { Section } from '../models/types';

export class PdfService {
    convertToCalendarEvents(schedules: Section[]): any[] {
        const events: any[] = [];

        schedules.forEach(section => {
        const content = section.content as any;

        if (content.events && Array.isArray(content.events)) {
            content.events.forEach((event: any) => {
            events.push({
                summary: event.title,
                description: event.description || '',
                start: {
                dateTime: this.combineDateTime(section.date, event.time),
                timeZone: 'UTC'
                },
                end: {
                dateTime: this.combineDateTime(section.date, event.time, 60), // Default 60 min duration
                timeZone: 'UTC'
                }
            });
            });
        }
        });

        return events;
    }

    private combineDateTime(date: string, time: string, addMinutes: number = 0): string {
        const [hours, minutes] = time.split(':').map(Number);
        const dateTime = new Date(date);
        dateTime.setHours(hours, minutes + addMinutes, 0, 0);
        return dateTime.toISOString();
    }

    async generateICSFile(events: any[]): Promise<{ icsContent: string; filename: string }> {
        let icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//AI Planner//Calendar Export//EN',
        'CALSCALE:GREGORIAN'
        ];

        events.forEach(event => {
        icsContent.push('BEGIN:VEVENT');
        icsContent.push(`DTSTART:${this.formatICSDate(event.start.dateTime)}`);
        icsContent.push(`DTEND:${this.formatICSDate(event.end.dateTime)}`);
        icsContent.push(`SUMMARY:${event.summary}`);
        if (event.description) {
            icsContent.push(`DESCRIPTION:${event.description}`);
        }
        icsContent.push(`UID:${Date.now()}-${Math.random()}@aiplanner.com`);
        icsContent.push('END:VEVENT');
        });

        icsContent.push('END:VCALENDAR');

        return {
        icsContent: icsContent.join('\r\n'),
        filename: `ai-planner-export-${Date.now()}.ics`
        };
    }

    private formatICSDate(isoDate: string): string {
        return new Date(isoDate)
        .toISOString()
        .replace(/[-:]/g, '')
        .replace(/\.\d{3}/, '');
    }
}