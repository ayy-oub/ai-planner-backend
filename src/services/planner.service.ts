// src/services/planner.service.ts
import { firestore } from '../config/firebase';
import { Planner } from '../models/types';
import { FirebaseService } from './firebase.service';

const firebaseService = new FirebaseService();

export class PlannerService {
    async getUserPlanners(userId: string, includeArchived: boolean = false): Promise<Planner[]> {
        let query = firestore
        .collection('planners')
        .where('userId', '==', userId);

        if (!includeArchived) {
        query = query.where('isArchived', '==', false);
        }

        const snapshot = await query.orderBy('createdAt', 'desc').get();

        return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
        })) as Planner[];
    }

    async getPlanner(plannerId: string, userId: string): Promise<Planner | null> {
        const doc = await firestore.collection('planners').doc(plannerId).get();
        
        if (!doc.exists) return null;

        const planner = { id: doc.id, ...doc.data() } as Planner;

        // Check if user has access (owner or shared)
        if (planner.userId === userId) {
        return planner;
        }

        const hasAccess = await this.checkPermission(plannerId, userId, 'view');
        return hasAccess ? planner : null;
    }

    async createPlanner(plannerData: Partial<Planner>): Promise<Planner> {
        const plannerRef = await firestore.collection('planners').add({
        ...plannerData,
        createdAt: new Date(),
        updatedAt: new Date()
        });

        const doc = await plannerRef.get();
        return { id: doc.id, ...doc.data() } as Planner;
    }

    async updatePlanner(plannerId: string, updates: Partial<Planner>): Promise<Planner> {
        const plannerRef = firestore.collection('planners').doc(plannerId);
        await plannerRef.update({
        ...updates,
        updatedAt: new Date()
        });

        const doc = await plannerRef.get();
        return { id: doc.id, ...doc.data() } as Planner;
    }

    async deletePlanner(plannerId: string) {
        const batch = firestore.batch();

        // Delete planner
        batch.delete(firestore.collection('planners').doc(plannerId));

        // Delete all sections
        const sections = await firestore
        .collection('sections')
        .where('plannerId', '==', plannerId)
        .get();

        sections.docs.forEach(doc => {
        batch.delete(doc.ref);
        });

        // Delete all shares
        const shares = await firestore
        .collection('planner_shares')
        .where('plannerId', '==', plannerId)
        .get();

        shares.docs.forEach(doc => {
        batch.delete(doc.ref);
        });

        await batch.commit();
    }

    async duplicatePlanner(plannerId: string, userId: string, newTitle?: string): Promise<Planner> {
        const originalPlanner = await this.getPlanner(plannerId, userId);
        if (!originalPlanner) {
        throw new Error('Planner not found');
        }

        // Create new planner
        const duplicatedPlanner = await this.createPlanner({
        userId,
        title: newTitle || `${originalPlanner.title} (Copy)`,
        color: originalPlanner.color,
        icon: originalPlanner.icon,
        description: originalPlanner.description,
        isDefault: false,
        isArchived: false
        });

        // Copy sections from the last 7 days
        const today = new Date();
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);

        const sections = await firebaseService.getSectionsInRange(
        plannerId,
        sevenDaysAgo.toISOString().split('T')[0],
        today.toISOString().split('T')[0]
        );

        // Duplicate sections
        const batch = firestore.batch();
        sections.forEach(section => {
        const newSectionRef = firestore.collection('sections').doc();
        batch.set(newSectionRef, {
            plannerId: duplicatedPlanner.id,
            date: section.date,
            type: section.type,
            title: section.title,
            content: section.content,
            order: section.order,
            isCollapsed: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: userId
        });
        });

        await batch.commit();

        return duplicatedPlanner;
    }

    async unsetAllDefaults(userId: string) {
        const planners = await firestore
        .collection('planners')
        .where('userId', '==', userId)
        .where('isDefault', '==', true)
        .get();

        const batch = firestore.batch();
        planners.docs.forEach(doc => {
        batch.update(doc.ref, { isDefault: false });
        });

        await batch.commit();
    }

    async getPlannersByDate(userId: string, date: string): Promise<Planner[]> {
        // Get all user's planners
        const planners = await this.getUserPlanners(userId);

        // Get planners that have sections on this date
        const plannersWithData: Planner[] = [];

        for (const planner of planners) {
        const sections = await firebaseService.getSections(planner.id, date);
        if (sections.length > 0) {
            plannersWithData.push(planner);
        }
        }

        return plannersWithData;
    }

    async checkPermission(
        plannerId: string,
        userId: string,
        requiredPermission: 'view' | 'edit'
    ): Promise<boolean> {
        return firebaseService.checkPlannerPermission(plannerId, userId, requiredPermission);
    }
}