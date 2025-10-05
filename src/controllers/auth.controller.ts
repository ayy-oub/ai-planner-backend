// src/controllers/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { FirebaseService } from '../services/firebase.service';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import { AuthRequest } from '@/middleware/auth';

const authService = new AuthService();
const firebaseService = new FirebaseService();

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, displayName } = req.body;

    // Create Firebase user
    const userRecord = await authService.createUser(email, password, displayName);

    // Create user document in Firestore
    await firebaseService.createUserDocument(userRecord.uid, {
      email,
      displayName,
      photoURL: "",
      preferences: {
        theme: 'light',
        accentColor: 'blue',
        defaultView: 'daily',
        notifications: true
      },
      createdAt: new Date(),
      lastLogin: new Date()
    });

    // Generate JWT token
    const token = await authService.generateToken(userRecord.uid);
    const refreshToken = await authService.generateRefreshToken(userRecord.uid);

    logger.info(`User registered: ${email}`);

    res.status(201).json({
      success: true,
      data: {
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName
        },
        token,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Verify credentials
    const userRecord = await authService.signInWithEmailPassword(email, password);

    // Update last login
    await firebaseService.updateUserDocument(userRecord.uid, {
      lastLogin: new Date()
    });

    // Generate tokens
    const token = await authService.generateToken(userRecord.uid);
    const refreshToken = await authService.generateRefreshToken(userRecord.uid);

    // Get user data
    const userData = await firebaseService.getUserDocument(userRecord.uid);

    logger.info(`User logged in: ${email}`);

    res.json({
      success: true,
      data: {
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
          photoURL: userRecord.photoURL,
          ...userData
        },
        token,
        refreshToken
      }
    });
  } catch (error) {
    next(new AppError('Invalid email or password', 401));
  }
};

export const googleAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idToken } = req.body;

    // Verify Google token
    const decodedToken = await authService.verifyGoogleToken(idToken);
    
    // Get or create user
    let userRecord = await authService.getUserByEmail(decodedToken.email!);
    
    if (!userRecord) {
      userRecord = await authService.createUser(
        decodedToken.email!,
        null,
        decodedToken.name
      );

      await firebaseService.createUserDocument(userRecord.uid, {
        email: decodedToken.email!,
        displayName: decodedToken.name,
        photoURL: decodedToken.picture,
        authProvider: 'google',
        preferences: {
          theme: 'light',
          accentColor: 'blue',
          defaultView: 'daily',
          notifications: true
        },
        createdAt: new Date(),
        lastLogin: new Date()
      });
    } else {
      await firebaseService.updateUserDocument(userRecord.uid, {
        lastLogin: new Date()
      });
    }

    // Generate tokens
    const token = await authService.generateToken(userRecord.uid);
    const refreshToken = await authService.generateRefreshToken(userRecord.uid);

    const userData = await firebaseService.getUserDocument(userRecord.uid);

    res.json({
      success: true,
      data: {
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
          photoURL: userRecord.photoURL,
          ...userData
        },
        token,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

export const appleAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { identityToken, user } = req.body;

    // Verify Apple token
    const decodedToken = await authService.verifyAppleToken(identityToken);

    // Get or create user
    let userRecord = await authService.getUserByEmail(decodedToken.email!);

    if (!userRecord) {
      userRecord = await authService.createUser(
        decodedToken.email!,
        null,
        user?.fullName
      );

      await firebaseService.createUserDocument(userRecord.uid, {
        email: decodedToken.email!,
        displayName: user?.fullName || 'User',
        photoURL: "",
        authProvider: 'apple',
        preferences: {
          theme: 'light',
          accentColor: 'blue',
          defaultView: 'daily',
          notifications: true
        },
        createdAt: new Date(),
        lastLogin: new Date()
      });
    } else {
      await firebaseService.updateUserDocument(userRecord.uid, {
        lastLogin: new Date()
      });
    }

    // Generate tokens
    const token = await authService.generateToken(userRecord.uid);
    const refreshToken = await authService.generateRefreshToken(userRecord.uid);

    const userData = await firebaseService.getUserDocument(userRecord.uid);

    res.json({
      success: true,
      data: {
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
          ...userData
        },
        token,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError('Refresh token required', 400);
    }

    // Verify and generate new tokens
    const userId = await authService.verifyRefreshToken(refreshToken);
    const newToken = await authService.generateToken(userId);
    const newRefreshToken = await authService.generateRefreshToken(userId);

    res.json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    next(new AppError('Invalid refresh token', 401));
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.uid;

    const userData = await firebaseService.getUserDocument(userId);

    res.json({
      success: true,
      data: {
        user: {
          uid: userId,
          ...userData
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.uid;

    // Revoke refresh tokens
    await authService.revokeRefreshTokens(userId);

    logger.info(`User logged out: ${userId}`);

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.uid;
    const { displayName, photoURL, preferences } = req.body;

    await firebaseService.updateUserDocument(userId, {
      displayName,
      photoURL,
      preferences,
      updatedAt: new Date()
    });

    const updatedUser = await firebaseService.getUserDocument(userId);

    res.json({
      success: true,
      data: { user: updatedUser }
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.uid;
    const { currentPassword, newPassword } = req.body;

    await authService.changePassword(userId, currentPassword, newPassword);

    logger.info(`Password changed for user: ${userId}`);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.uid;

    // Delete all user data
    await firebaseService.deleteUserData(userId);

    // Delete Firebase user
    await authService.deleteUser(userId);

    logger.info(`Account deleted: ${userId}`);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};