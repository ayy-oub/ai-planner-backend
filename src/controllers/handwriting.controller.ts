// src/controllers/handwriting.controller.ts
import { Response, NextFunction } from 'express';
import { OcrService } from '../services/ocr.service';
import { FirebaseService } from '../services/firebase.service';
import { N8nService } from '../services/n8n.service';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import { AuthRequest } from '@/middleware/auth';

const ocrService = new OcrService();
const firebaseService = new FirebaseService();
const n8nService = new N8nService();

export const convertHandwritingToText = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.uid;
        const { drawingData, sectionId, plannerId } = req.body;

        // Verify access to planner
        if (plannerId) {
            const hasPermission = await firebaseService.checkPlannerPermission(
                plannerId,
                userId,
                'edit'
            );
            if (!hasPermission) {
                throw new AppError('Insufficient permissions', 403);
            }
        }

        // Convert drawing data (base64 or SVG path) to image
        const imageBuffer = await ocrService.convertDrawingToImage(drawingData);

        // Send to n8n workflow for OCR processing
        const ocrResult = await n8nService.processHandwriting({
            userId,
            imageData: imageBuffer.toString('base64')
        });

        // Save handwriting data
        const handwriting = await firebaseService.saveHandwriting({
        userId,
        plannerId,
        sectionId,
        drawingData,
        recognizedText: ocrResult.text,
        confidence: ocrResult.confidence,
        createdAt: new Date()
        });

        logger.info(`Handwriting converted to text for user: ${userId}`);

        res.json({
        success: true,
        data: {
            id: handwriting.id,
            text: ocrResult.text,
            confidence: ocrResult.confidence
        }
        });
    } catch (error) {
        logger.error('Handwriting conversion error:', error);
        next(error);
    }
};

export const saveHandwritingDrawing = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.uid;
        const { drawingData, sectionId, plannerId } = req.body;

        // Verify access to planner
        if (plannerId) {
        const hasPermission = await firebaseService.checkPlannerPermission(
            plannerId,
            userId,
            'edit'
        );
        if (!hasPermission) {
            throw new AppError('Insufficient permissions', 403);
        }
        }

        // Convert drawing to image and upload to Firebase Storage
        const imageBuffer = await ocrService.convertDrawingToImage(drawingData);
        const imagePath = `handwriting/${userId}/${Date.now()}.png`;
        const imageUrl = await firebaseService.uploadToStorage(imagePath, imageBuffer);

        // Save handwriting record
        const handwriting = await firebaseService.saveHandwriting({
        userId,
        plannerId,
        sectionId,
        drawingData,
        imageUrl,
        createdAt: new Date()
        });

        logger.info(`Handwriting saved for user: ${userId}`);

        res.status(201).json({
        success: true,
        data: {
            id: handwriting.id,
            imageUrl
        }
        });
    } catch (error) {
        next(error);
    }
};

export const getHandwritingData = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.uid;
        const { id } = req.params;

        const handwriting = await firebaseService.getHandwriting(id);

        if (!handwriting) {
        throw new AppError('Handwriting not found', 404);
        }

        // Verify ownership or planner access
        if (handwriting.userId !== userId) {
        if (handwriting.plannerId) {
            const hasPermission = await firebaseService.checkPlannerPermission(
            handwriting.plannerId,
            userId,
            'view'
            );
            if (!hasPermission) {
            throw new AppError('Access denied', 403);
            }
        } else {
            throw new AppError('Access denied', 403);
        }
        }

        res.json({
        success: true,
        data: { handwriting }
        });
    } catch (error) {
        next(error);
    }
};

export const deleteHandwriting = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.uid;
        const { id } = req.params;

        const handwriting = await firebaseService.getHandwriting(id);

        if (!handwriting) {
        throw new AppError('Handwriting not found', 404);
        }

        // Verify ownership
        if (handwriting.userId !== userId) {
        throw new AppError('Access denied', 403);
        }

        // Delete image from storage if exists
        if (handwriting.imageUrl) {
        await firebaseService.deleteFromStorage(handwriting.imagePath);
        }

        // Delete record
        await firebaseService.deleteHandwriting(id);

        logger.info(`Handwriting deleted: ${id}`);

        res.json({
        success: true,
        message: 'Handwriting deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};