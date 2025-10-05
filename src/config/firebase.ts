// ============================================
// src/config/firebase.ts - Firebase Admin SDK
// ============================================
import admin, { ServiceAccount } from 'firebase-admin';
import { logger } from '../utils/logger';

interface FirebaseEnv {
    projectId?: string;
    clientEmail?: string;
    privateKey?: string;
}

// Parse service account from environment variables
const firebaseEnv: FirebaseEnv = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        };

    // Validate essential fields
    if (!firebaseEnv.projectId || !firebaseEnv.clientEmail || !firebaseEnv.privateKey) {
        console.log('Loaded Firebase ENV:', firebaseEnv);
        throw new Error('Firebase credentials are missing or incomplete.');
    }

// Type-safe service account
const serviceAccount: ServiceAccount = {
    projectId: firebaseEnv.projectId,
    clientEmail: firebaseEnv.clientEmail,
    privateKey: firebaseEnv.privateKey,
};

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: `https://${firebaseEnv.projectId}.firebaseio.com`,
    });
    logger.info('✅ Firebase Admin initialized');
}

// Export Firestore, Auth, and Storage instances
export const firebaseAuth = admin.auth();
export const firestore = admin.firestore();
export const storage = admin.storage();

export default admin;