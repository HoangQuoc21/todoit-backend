import express from "express";
import { uploadController } from "./upload.controller";
import { middlewares } from "@/middlewares";

const uploadRouter = express.Router();

/**
 * @swagger
 * /upload/image:
 *   post:
 *     tags:
 *       - Upload
 *     summary: Upload an image to Cloudinary
 *     description: Upload an image file to Cloudinary storage. Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The image file to upload
 *             required:
 *               - image
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 errors:
 *                   type: array
 *                   nullable: true
 *                   items:
 *                     type: object
 *                 data:
 *                   type: string
 *                   description: URL of the uploaded image on Cloudinary
 *       401:
 *         description: Unauthorized - Authentication required
 *       400:
 *         description: Bad request - Invalid file or missing image
 *       500:
 *         description: Internal server error - Upload failed
 */
uploadRouter.post(
  "/image",
  middlewares.isAuthenticatedHandler,
  middlewares.cloudinaryUploadHandler,
  uploadController.uploadImage,
);

export { uploadRouter };
