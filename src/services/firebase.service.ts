// src/services/firebase.service.ts
import { firestore, storage } from '../config/firebase';
import {
    User,
    Section,
    ActivityLog,
    PlannerShare,
    ExportRecord,
    HandwritingRecord
} from '../models/types';
import { AppError } from '../utils/errors';

export class FirebaseService {
    // ======================
    // User operations
    // ======================
    async createUserDocument(userId: string, userData: Partial<User>) {
        try {
        const userRef = firestore.collection('users').doc(userId);
        await userRef.set({ ...userData, createdAt: new Date(), updatedAt: new Date() });
        return userRef.id;
        } catch (error: unknown) {
        throw new AppError('Failed to create user', 500, error instanceof Error ? [error.message] : undefined);
        }
    }

    async getUserDocument(userId: string): Promise<User | null> {
        try {
        const userDoc = await firestore.collection('users').doc(userId).get();
        return userDoc.exists ? { uid: userDoc.id, ...userDoc.data() } as User : null;
        } catch (error: unknown) {
        throw new AppError('Failed to fetch user', 500, error instanceof Error ? [error.message] : undefined);
        }
    }

    async getUserByEmail(email: string): Promise<User | null> {
        try {
        const snapshot = await firestore.collection('users').where('email', '==', email).limit(1).get();
        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return { uid: doc.id, ...doc.data() } as User;
        } catch (error: unknown) {
        throw new AppError('Failed to fetch user by email', 500, error instanceof Error ? [error.message] : undefined);
        }
    }

    async updateUserDocument(userId: string, updates: Partial<User>) {
        try {
        const userRef = firestore.collection('users').doc(userId);
        await userRef.update({ ...updates, updatedAt: new Date() });
        } catch (error: unknown) {
        throw new AppError('Failed to update user', 500, error instanceof Error ? [error.message] : undefined);
        }
    }

    async deleteUserData(userId: string) {
        try {
        const batch = firestore.batch();
        const planners = await firestore.collection('planners').where('userId', '==', userId).get();
        planners.docs.forEach(doc => batch.delete(doc.ref));
        const shares = await firestore.collection('planner_shares').where('sharedWithUserId', '==', userId).get();
        shares.docs.forEach(doc => batch.delete(doc.ref));
        batch.delete(firestore.collection('users').doc(userId));
        await batch.commit();
        } catch (error: unknown) {
        throw new AppError('Failed to delete user data', 500, error instanceof Error ? [error.message] : undefined);
        }
    }

    // ======================
    // Section operations
    // ======================
    async createSection(sectionData: Partial<Section>): Promise<Section> {
        try {
        const sectionRef = await firestore.collection('sections').add({ ...sectionData, createdAt: new Date(), updatedAt: new Date() });
        const doc = await sectionRef.get();
        return { id: doc.id, ...doc.data() } as Section;
        } catch (error: unknown) {
        throw new AppError('Failed to create section', 500, error instanceof Error ? [error.message] : undefined);
        }
    }

    async getSection(sectionId: string): Promise<Section | null> {
        try {
        const doc = await firestore.collection('sections').doc(sectionId).get();
        return doc.exists ? { id: doc.id, ...doc.data() } as Section : null;
        } catch (error: unknown) {
        throw new AppError('Failed to fetch section', 500, error instanceof Error ? [error.message] : undefined);
        }
    }

    async getSections(plannerId: string, date: string): Promise<Section[]> {
        try {
        const snapshot = await firestore.collection('sections')
            .where('plannerId', '==', plannerId)
            .where('date', '==', date)
            .orderBy('order', 'asc')
            .get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Section[];
        } catch (error: unknown) {
        throw new AppError('Failed to fetch sections', 500, error instanceof Error ? [error.message] : undefined);
        }
    }

    async getSectionsInRange(plannerId: string, startDate: string, endDate: string): Promise<Section[]> {
        try {
        const snapshot = await firestore.collection('sections')
            .where('plannerId', '==', plannerId)
            .where('date', '>=', startDate)
            .where('date', '<=', endDate)
            .orderBy('date', 'asc')
            .orderBy('order', 'asc')
            .get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Section[];
        } catch (error: unknown) {
        throw new AppError('Failed to fetch sections in range', 500, error instanceof Error ? [error.message] : undefined);
        }
    }

    async getSectionsByType(plannerId: string, type: string): Promise<Section[]> {
        try {
        const snapshot = await firestore.collection('sections')
            .where('plannerId', '==', plannerId)
            .where('type', '==', type)
            .orderBy('date', 'desc')
            .limit(50)
            .get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Section[];
        } catch (error: unknown) {
        throw new AppError('Failed to fetch sections by type', 500, error instanceof Error ? [error.message] : undefined);
        }
    }

    async updateSection(sectionId: string, updates: Partial<Section>): Promise<Section> {
        try {
        const ref = firestore.collection('sections').doc(sectionId);
        await ref.update({ ...updates, updatedAt: new Date() });
        const doc = await ref.get();
        return { id: doc.id, ...doc.data() } as Section;
        } catch (error: unknown) {
        throw new AppError('Failed to update section', 500, error instanceof Error ? [error.message] : undefined);
        }
    }

    async deleteSection(sectionId: string) {
        try {
        await firestore.collection('sections').doc(sectionId).delete();
        } catch (error: unknown) {
        throw new AppError('Failed to delete section', 500, error instanceof Error ? [error.message] : undefined);
        }
    }

    async reorderSections(sectionOrders: Array<{ id: string; order: number }>) {
        try {
        const batch = firestore.batch();
        sectionOrders.forEach(({ id, order }) => batch.update(firestore.collection('sections').doc(id), { order, updatedAt: new Date() }));
        await batch.commit();
        } catch (error: unknown) {
        throw new AppError('Failed to reorder sections', 500, error instanceof Error ? [error.message] : undefined);
        }
    }

    async bulkUpdateSections(sections: Array<{ id: string; updates: Partial<Section> }>) {
        try {
        const batch = firestore.batch();
        sections.forEach(({ id, updates }) => batch.update(firestore.collection('sections').doc(id), { ...updates, updatedAt: new Date() }));
        await batch.commit();
        } catch (error: unknown) {
        throw new AppError('Failed to bulk update sections', 500, error instanceof Error ? [error.message] : undefined);
        }
    }

    // ======================
    // Activity log operations
    // ======================
    async logActivity(activityData: Partial<ActivityLog>) {
        try {
        await firestore.collection('activity_logs').add({ ...activityData, timestamp: new Date() });
        } catch (error: unknown) {
        throw new AppError('Failed to log activity', 500, error instanceof Error ? [error.message] : undefined);
        }
    }

    async getActivityLogs(plannerId: string, limit: number, startAfter?: string): Promise<ActivityLog[]> {
        try {
        let query: FirebaseFirestore.Query = firestore.collection('activity_logs')
            .where('plannerId', '==', plannerId)
            .orderBy('timestamp', 'desc')
            .limit(limit);
        if (startAfter) {
            const startDoc = await firestore.collection('activity_logs').doc(startAfter).get();
            query = query.startAfter(startDoc);
        }
        const snapshot = await query.get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ActivityLog[];
        } catch (error: unknown) {
        throw new AppError('Failed to fetch activity logs', 500, error instanceof Error ? [error.message] : undefined);
        }
    }

    async getUserActivityLogs(userId: string, limit: number, startAfter?: string): Promise<ActivityLog[]> {
        try {
        let query: FirebaseFirestore.Query = firestore.collection('activity_logs')
            .where('userId', '==', userId)
            .orderBy('timestamp', 'desc')
            .limit(limit);
        if (startAfter) {
            const startDoc = await firestore.collection('activity_logs').doc(startAfter).get();
            query = query.startAfter(startDoc);
        }
        const snapshot = await query.get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ActivityLog[];
        } catch (error: unknown) {
        throw new AppError('Failed to fetch user activity logs', 500, error instanceof Error ? [error.message] : undefined);
        }
    }

    async getActivityLog(activityId: string): Promise<ActivityLog | null> {
        try {
        const doc = await firestore.collection('activity_logs').doc(activityId).get();
        return doc.exists ? { id: doc.id, ...doc.data() } as ActivityLog : null;
        } catch (error: unknown) {
        throw new AppError('Failed to fetch activity log', 500, error instanceof Error ? [error.message] : undefined);
        }
    }

    async clearActivityLogs(plannerId: string) {
        try {
        const batch = firestore.batch();
        const snapshot = await firestore.collection('activity_logs').where('plannerId', '==', plannerId).get();
        snapshot.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
        } catch (error: unknown) {
        throw new AppError('Failed to clear activity logs', 500, error instanceof Error ? [error.message] : undefined);
        }
    }

    // ======================
    // Chat history
    // ======================
    async saveChatMessage(data: { plannerId: string; userId: string; message: string; response: string; timestamp: Date }) {
        try {
        await firestore.collection('chat_history').add(data);
        } catch (error: unknown) {
        throw new AppError('Failed to save chat message', 500, error instanceof Error ? [error.message] : undefined);
        }
    }

    async getChatHistory(plannerId: string, limit: number): Promise<any[]> {
        try {
        const snapshot = await firestore.collection('chat_history')
            .where('plannerId', '==', plannerId)
            .orderBy('timestamp', 'desc')
            .limit(limit)
            .get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error: unknown) {
        throw new AppError('Failed to fetch chat history', 500, error instanceof Error ? [error.message] : undefined);
        }
    }

    async clearChatHistory(plannerId: string) {
        try {
        const batch = firestore.batch();
        const snapshot = await firestore.collection('chat_history').where('plannerId', '==', plannerId).get();
        snapshot.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
        } catch (error: unknown) {
        throw new AppError('Failed to clear chat history', 500, error instanceof Error ? [error.message] : undefined);
        }
    }

    // ======================
    // Handwriting operations
    // ======================
    async saveHandwriting(data: any) {
        try {
        const ref = await firestore.collection('handwriting').add(data);
        const doc = await ref.get();
        return { id: doc.id, ...doc.data() } as HandwritingRecord;
        } catch (error: unknown) {
        throw new AppError('Failed to save handwriting', 500, error instanceof Error ? [error.message] : undefined);
        }
    }

    async getHandwriting(id: string): Promise<HandwritingRecord | null> {
        try {
        const doc = await firestore.collection('handwriting').doc(id).get();
        if (!doc.exists) return null;
        const data = doc.data();
        if (!data?.userId || !data?.drawingData) return null;
        return { id: doc.id, ...data } as HandwritingRecord;
        } catch (error: unknown) {
        throw new AppError('Failed to fetch handwriting', 500, error instanceof Error ? [error.message] : undefined);
        }
    }

    async deleteHandwriting(id: string) {
        try {
        await firestore.collection('handwriting').doc(id).delete();
        } catch (error: unknown) {
        throw new AppError('Failed to delete handwriting', 500, error instanceof Error ? [error.message] : undefined);
        }
    }

    // ======================
    // Export operations
    // ======================
    async getExportStatus(exportId: string, userId: string): Promise<ExportRecord | null> {
        try {
        const doc = await firestore.collection('exports').doc(exportId).get();
        if (!doc.exists) return null;
        const data = doc.data();
        if (!data || data.userId !== userId) return null;
        const requiredFields = ['status', 'filePath', 'filename'] as const;
        for (const field of requiredFields) if (!(field in data)) return null;
        return { id: doc.id, ...data } as ExportRecord;
        } catch (error: unknown) {
        throw new AppError('Failed to fetch export status', 500, error instanceof Error ? [error.message] : undefined);
        }
    }

    async getExportData(exportId: string, userId: string): Promise<ExportRecord | null> {
        return this.getExportStatus(exportId, userId);
    }

    async getExportDownloadUrl(filePath: string): Promise<string> {
        try {
        const file = storage.bucket().file(filePath);
        const [url] = await file.getSignedUrl({ action: 'read', expires: Date.now() + 3600 * 1000 });
        return url;
        } catch (error: unknown) {
        throw new AppError('Failed to generate export download URL', 500, error instanceof Error ? [error.message] : undefined);
        }
    }

    // ======================
    // Storage
    // ======================
    async uploadToStorage(path: string, buffer: Buffer): Promise<string> {
        try {
        const file = storage.bucket().file(path);
        await file.save(buffer);
        const [url] = await file.getSignedUrl({ action: 'read', expires: '03-01-2500' });
        return url;
        } catch (error: unknown) {
        throw new AppError('Failed to upload to storage', 500, error instanceof Error ? [error.message] : undefined);
        }
    }

    async deleteFromStorage(path: string) {
        try {
        const file = storage.bucket().file(path);
        await file.delete();
        } catch (error: unknown) {
        throw new AppError('Failed to delete from storage', 500, error instanceof Error ? [error.message] : undefined);
        }
    }

    // ======================
    // Permissions
    // ======================
    async checkPlannerPermission(plannerId: string, userId: string, requiredPermission: 'view' | 'edit'): Promise<boolean> {
        try {
        const plannerDoc = await firestore.collection('planners').doc(plannerId).get();
        if (!plannerDoc.exists) return false;
        const plannerData = plannerDoc.data();
        if (plannerData?.userId === userId) return true;
        const shareSnapshot = await firestore.collection('planner_shares')
            .where('plannerId', '==', plannerId)
            .where('sharedWithUserId', '==', userId)
            .where('isAccepted', '==', true)
            .limit(1)
            .get();
        if (shareSnapshot.empty) return false;
        const share = shareSnapshot.docs[0].data() as PlannerShare;
        if (requiredPermission === 'view') return true;
        if (requiredPermission === 'edit') return share.permission === 'edit';
        return false;
        } catch (error: unknown) {
        throw new AppError('Failed to check planner permission', 500, error instanceof Error ? [error.message] : undefined);
        }
    }

    // ======================
    // Habit data
    // ======================
    async getHabitDataInRange(plannerId: string, dateRange: { start: string; end: string }) {
        try {
        const sections = await this.getSectionsInRange(plannerId, dateRange.start, dateRange.end);
        return sections.filter(s => s.type === 'habit_tracker').map(s => ({ date: s.date, habits: s.content }));
        } catch (error: unknown) {
        throw new AppError('Failed to fetch habit data', 500, error instanceof Error ? [error.message] : undefined);
        }
    }
}
