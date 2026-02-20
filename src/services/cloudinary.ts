import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import { HttpError } from "@/types";
import status from "http-status";

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
        folder: process.env.CLOUDINARY_FOLDER_NAME!,
        public_id: `${Date.now()}-${file.originalname}`,
      }),
    });

    _parser = multer({ storage });
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
};
