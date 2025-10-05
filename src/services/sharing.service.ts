// src/services/sharing.service.ts
import { firestore } from '../config/firebase';
import { PlannerShare } from '../models/types';
import { N8nService } from './n8n.service';

const n8nService = new N8nService();

export class SharingService {
    async createShare(shareData: Partial<PlannerShare>): Promise<PlannerShare> {
        const shareRef = await firestore.collection('planner_shares').add({
        ...shareData,
        createdAt: new Date()
        });

        const doc = await shareRef.get();
        return { id: doc.id, ...doc.data() } as PlannerShare;
    }

    async getShare(shareId: string): Promise<PlannerShare | null> {
        const doc = await firestore.collection('planner_shares').doc(shareId).get();
        return doc.exists ? { id: doc.id, ...doc.data() } as PlannerShare : null;
    }

    async getPlannerShares(plannerId: string): Promise<PlannerShare[]> {
        const snapshot = await firestore
        .collection('planner_shares')
        .where('plannerId', '==', plannerId)
        .orderBy('createdAt', 'desc')
        .get();

        return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
        })) as PlannerShare[];
    }

    async getShareByPlannerAndUser(
        plannerId: string,
        userId: string
    ): Promise<PlannerShare | null> {
        const snapshot = await firestore
        .collection('planner_shares')
        .where('plannerId', '==', plannerId)
        .where('sharedWithUserId', '==', userId)
        .limit(1)
        .get();

        if (snapshot.empty) return null;

        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() } as PlannerShare;
    }

    async updateShare(shareId: string, updates: Partial<PlannerShare>): Promise<PlannerShare> {
        const shareRef = firestore.collection('planner_shares').doc(shareId);
        await shareRef.update({
        ...updates,
        updatedAt: new Date()
        });

        const doc = await shareRef.get();
        return { id: doc.id, ...doc.data() } as PlannerShare;
    }

    async deleteShare(shareId: string) {
        await firestore.collection('planner_shares').doc(shareId).delete();
    }

    async getPendingInvitations(userId: string): Promise<PlannerShare[]> {
        const snapshot = await firestore
        .collection('planner_shares')
        .where('sharedWithUserId', '==', userId)
        .where('isAccepted', '==', false)
        .orderBy('createdAt', 'desc')
        .get();

        return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
        })) as PlannerShare[];
    }

    async getSharedWithMe(userId: string): Promise<any[]> {
        const snapshot = await firestore
        .collection('planner_shares')
        .where('sharedWithUserId', '==', userId)
        .where('isAccepted', '==', true)
        .get();

        const shares = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
        })) as PlannerShare[];

        // Get planner details for each share
        const planners = await Promise.all(
        shares.map(async (share) => {
            const plannerDoc = await firestore
            .collection('planners')
            .doc(share.plannerId)
            .get();

            return {
            ...share,
            planner: plannerDoc.exists ? { id: plannerDoc.id, ...plannerDoc.data() } : null
            };
        })
        );

        return planners.filter(p => p.planner !== null);
    }

    async sendShareNotification(shareId: string, plannerTitle: string) {
        try {
        await n8nService.sendShareNotification({
            shareId,
            plannerTitle
        });
        } catch (error) {
        console.error('Failed to send share notification:', error);
        // Don't throw - notification failure shouldn't break the share
        }
    }
}