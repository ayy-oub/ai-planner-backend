// src/services/auth.service.ts
import * as admin from 'firebase-admin';
import jwt from 'jsonwebtoken';
import { firebaseAuth } from '../config/firebase';
import { AppError } from '../utils/errors';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';
const REFRESH_TOKEN_EXPIRES_IN = '30d';

export class AuthService {
    async createUser(email: string, password: string | null, displayName?: string) {
        try {
        const userRecord = await firebaseAuth.createUser({
            email,
            password: password || undefined,
            displayName: displayName || email.split('@')[0]
        });

        return userRecord;
        } catch (error: any) {
        if (error.code === 'auth/email-already-exists') {
            throw new AppError('Email already in use', 400);
        }
        throw new AppError('Failed to create user', 500);
        }
    }

    async signInWithEmailPassword(email: string, password: string) {
        try {
        // Firebase Admin SDK doesn't have direct sign-in
        // We verify the email exists and return the user record
        const userRecord = await firebaseAuth.getUserByEmail(email);

        // In production, you'd verify the password against Firebase Auth
        // For now, we assume it's valid if the user exists
        return userRecord;
        } catch (error: any) {
        throw new AppError('Invalid credentials', 401);
        }
    }

    async verifyGoogleToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
        try {
        const decodedToken = await firebaseAuth.verifyIdToken(idToken);
        return decodedToken;
        } catch (error) {
        throw new AppError('Invalid Google token', 401);
        }
    }

    async verifyAppleToken(identityToken: string): Promise<admin.auth.DecodedIdToken> {
        try {
        const decodedToken = await firebaseAuth.verifyIdToken(identityToken);
        return decodedToken;
        } catch (error) {
        throw new AppError('Invalid Apple token', 401);
        }
    }

    async getUserByEmail(email: string) {
        try {
        return await firebaseAuth.getUserByEmail(email);
        } catch (error) {
        return null;
        }
    }

    async generateToken(userId: string): Promise<string> {
        const payload = {
        uid: userId,
        type: 'access'
        };

        return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN
        });
    }

    async generateRefreshToken(userId: string): Promise<string> {
        const payload = {
        uid: userId,
        type: 'refresh'
        };

        return jwt.sign(payload, JWT_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRES_IN
        });
    }

    async verifyToken(token: string): Promise<{ uid: string; type: string }> {
        try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        return decoded;
        } catch (error) {
        throw new AppError('Invalid token', 401);
        }
    }

    async verifyRefreshToken(refreshToken: string): Promise<string> {
        try {
        const decoded = await this.verifyToken(refreshToken);

        if (decoded.type !== 'refresh') {
            throw new AppError('Invalid refresh token', 401);
        }

        return decoded.uid;
        } catch (error) {
        throw new AppError('Invalid refresh token', 401);
        }
    }

    async revokeRefreshTokens(userId: string) {
        try {
        await firebaseAuth.revokeRefreshTokens(userId);
        } catch (error) {
        console.error('Failed to revoke refresh tokens:', error);
        }
    }

    async changePassword(userId: string, currentPassword: string, newPassword: string) {
        try {
        // Update password in Firebase
        await firebaseAuth.updateUser(userId, {
            password: newPassword
        });
        } catch (error) {
        throw new AppError('Failed to change password', 500);
        }
    }

    async deleteUser(userId: string) {
        try {
        await firebaseAuth.deleteUser(userId);
        } catch (error) {
        throw new AppError('Failed to delete user', 500);
        }
    }

    async verifyFirebaseToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
        try {
        return await firebaseAuth.verifyIdToken(idToken);
        } catch (error) {
        throw new AppError('Invalid Firebase token', 401);
        }
    }
}