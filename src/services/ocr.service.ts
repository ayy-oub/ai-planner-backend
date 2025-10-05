// src/services/ocr.service.ts
import sharp from 'sharp';
import { createCanvas } from 'canvas';

export class OcrService {
    async convertDrawingToImage(drawingData: string): Promise<Buffer> {
        try {
        // Check if it's base64 image
        if (drawingData.startsWith('data:image')) {
            const base64Data = drawingData.split(',')[1];
            return Buffer.from(base64Data, 'base64');
        }

        // If it's SVG path data, convert to image
        if (drawingData.startsWith('<svg') || drawingData.includes('path')) {
            return await this.svgToImage(drawingData);
        }

        // If it's canvas drawing data (JSON)
        try {
            const drawingJson = JSON.parse(drawingData);
            return await this.canvasDataToImage(drawingJson);
        } catch {
            throw new Error('Invalid drawing data format');
        }
        } catch (error) {
        console.error('Drawing conversion error:', error);
        throw new Error('Failed to convert drawing to image');
        }
    }

    private async svgToImage(svgData: string): Promise<Buffer> {
        try {
        const buffer = await sharp(Buffer.from(svgData))
            .png()
            .toBuffer();

        return buffer;
        } catch (error) {
        throw new Error('Failed to convert SVG to image');
        }
    }

    private async canvasDataToImage(drawingData: any): Promise<Buffer> {
        try {
        // Create a canvas
        const canvas = createCanvas(800, 600);
        const ctx = canvas.getContext('2d');

        // Fill white background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 800, 600);

        // Draw paths
        if (drawingData.paths && Array.isArray(drawingData.paths)) {
            drawingData.paths.forEach((path: any) => {
            ctx.beginPath();
            ctx.strokeStyle = path.color || 'black';
            ctx.lineWidth = path.width || 2;

            if (path.points && Array.isArray(path.points)) {
                path.points.forEach((point: any, index: number) => {
                if (index === 0) {
                    ctx.moveTo(point.x, point.y);
                } else {
                    ctx.lineTo(point.x, point.y);
                }
                });
            }

            ctx.stroke();
            });
        }

        // Convert to buffer
        return canvas.toBuffer('image/png');
        } catch (error) {
        throw new Error('Failed to convert canvas data to image');
        }
    }

    async optimizeImageForOCR(imageBuffer: Buffer): Promise<Buffer> {
        try {
        // Enhance image for better OCR
        return await sharp(imageBuffer)
            .greyscale()
            .normalize()
            .sharpen()
            .png()
            .toBuffer();
        } catch (error) {
        console.error('Image optimization error:', error);
        return imageBuffer; // Return original if optimization fails
        }
    }
}