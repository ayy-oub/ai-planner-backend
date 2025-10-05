// src/services/n8n.service.ts
import axios from 'axios';
import { n8nConfig } from '../config/n8n';
import { logger } from '../utils/logger';

export class N8nService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = n8nConfig.baseUrl;
  }

  async sendChatMessage(data: {
    userId: string;
    plannerId: string;
    message: string;
    plannerContext: any;
  }): Promise<{ message: string; suggestions?: string[] }> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/webhook/ai-chat`,
        data,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000
        }
      );

      return response.data;
    } catch (error) {
      logger.error('n8n AI chat error:', error);
      throw new Error('AI chat service temporarily unavailable');
    }
  }

  async generateMealPlan(data: {
    userId: string;
    preferences?: any;
    date: string;
  }): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/webhook/generate-meal-plan`,
        data,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 20000
        }
      );

      return response.data;
    } catch (error) {
      logger.error('n8n meal plan generation error:', error);
      throw new Error('Meal planning service temporarily unavailable');
    }
  }

  async generateSchedule(data: {
    userId: string;
    tasks: any[];
    date: string;
    preferences?: any;
  }): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/webhook/generate-schedule`,
        data,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 20000
        }
      );

      return response.data;
    } catch (error) {
      logger.error('n8n schedule generation error:', error);
      throw new Error('Schedule generation service temporarily unavailable');
    }
  }

  async analyzeHabits(data: {
    userId: string;
    habitData: any[];
  }): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/webhook/analyze-habits`,
        data,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 20000
        }
      );

      return response.data;
    } catch (error) {
      logger.error('n8n habit analysis error:', error);
      throw new Error('Habit analysis service temporarily unavailable');
    }
  }

  async suggestTasks(data: {
    userId: string;
    context: any;
  }): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/webhook/suggest-tasks`,
        data,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 15000
        }
      );

      return response.data;
    } catch (error) {
      logger.error('n8n task suggestion error:', error);
      throw new Error('Task suggestion service temporarily unavailable');
    }
  }

  async generateGoals(data: {
    userId: string;
    timeframe: string;
    category?: string;
  }): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/webhook/generate-goals`,
        data,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 15000
        }
      );

      return response.data;
    } catch (error) {
      logger.error('n8n goal generation error:', error);
      throw new Error('Goal generation service temporarily unavailable');
    }
  }

  async provideFeedback(data: {
    userId: string;
    sections: any[];
  }): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/webhook/provide-feedback`,
        data,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 15000
        }
      );

      return response.data;
    } catch (error) {
      logger.error('n8n feedback error:', error);
      throw new Error('Feedback service temporarily unavailable');
    }
  }

  async generatePDF(data: {
    userId: string;
    planner: any;
    sections: any[];
    date?: string;
    startDate?: string;
    endDate?: string;
    viewType: string;
  }): Promise<{ id: string; status: string }> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/webhook/export-pdf`,
        data,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 60000
        }
      );

      return response.data;
    } catch (error) {
      logger.error('n8n PDF generation error:', error);
      throw new Error('PDF export service temporarily unavailable');
    }
  }

  async processHandwriting(data: {
    userId: string;
    imageData: string;
  }): Promise<{ text: string; confidence: number }> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/webhook/handwriting-to-text`,
        data,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000
        }
      );

      return response.data;
    } catch (error) {
      logger.error('n8n handwriting OCR error:', error);
      throw new Error('Handwriting recognition service temporarily unavailable');
    }
  }

  async syncToGoogleCalendar(userId: string, events: any[]): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/webhook/calendar-sync`,
        { userId, events },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000
        }
      );

      return response.data;
    } catch (error) {
      logger.error('n8n calendar sync error:', error);
      throw new Error('Calendar sync service temporarily unavailable');
    }
  }

  async sendShareNotification(data: {
    shareId: string;
    plannerTitle: string;
  }): Promise<void> {
    try {
      await axios.post(
        `${this.baseUrl}/webhook/share-notification`,
        data,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000
        }
      );
    } catch (error) {
      logger.error('n8n share notification error:', error);
      // Don't throw - notification failures shouldn't break functionality
    }
  }
}