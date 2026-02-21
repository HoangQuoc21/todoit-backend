import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import { HttpError, type ThirdPartyResponse } from "@/types";
import status from "http-status";
import { extractPublicId } from "cloudinary-build-url";
import { MEMORY_UNIT } from "@/utils";

let _parser: multer.Multer | null = null;

export const cloudinaryService = {
  config: () => {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });

    const storage = new CloudinaryStorage({
      cloudinary,
      params: async (req, file) => ({
        allowed_formats: ["jpg", "jpeg", "png"],
        folder: process.env.CLOUDINARY_FOLDER_NAME!,
        public_id: `${Date.now()}-${file.originalname.replace(/\.[^/.]+$/, "")}`,
      }),
    });

    _parser = multer({
      storage,
      limits: { fileSize: 5 * MEMORY_UNIT.MB },
    });

    console.log("--> Cloudinary configured successfully");
  },
  get parser() {
    if (!_parser) {
      throw new HttpError(
        status.INTERNAL_SERVER_ERROR,
        "Cloudinary service not configured. Call config() first.",
        null,
      );
    }
    return _parser;
  },
  deleteImage: async (url: string): Promise<ThirdPartyResponse> => {
    try {
      const publicId = extractPublicId(url);

      const result = await cloudinary.uploader.destroy(publicId);
      if (result.result == "ok") {
        return {
          success: true,
          message: `Cloudinary image deleted successfully: ${publicId}`,
        };
      } else {
        return {
          success: false,
          message: `Cloudinary deletion failed: ${result.result}`,
        };
      }
    } catch (err) {
      return {
        success: false,
        message: `Cloudinary deletion error: ${(err as Error).message}`,
      };
    }
  },
};
