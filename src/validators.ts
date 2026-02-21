import { body, param, query } from "express-validator";
import { FORM_FIELDS } from "./constants";
import { cloudinaryService } from "./services";
import { HttpError } from "./types";
import status from "http-status";

const paginationValidators = [
  query(FORM_FIELDS.PAGE)
    .optional()
    .isInt({ min: 0 })
    .withMessage(`${FORM_FIELDS.PAGE} must be a non-negative integer`),
  query(FORM_FIELDS.SIZE)
    .optional()
    .isInt({ min: 1 })
    .withMessage(`${FORM_FIELDS.SIZE} must be a positive integer`),
];

const paramIdValidator = param(FORM_FIELDS.ID)
  .trim()
  .notEmpty()
  .withMessage(`${FORM_FIELDS.ID} is required`)
  .bail()
  .isMongoId()
  .withMessage("Invalid MongoDB Category ID format");

const bodyImageUrlValidator = body(FORM_FIELDS.IMAGE_URL)
  .optional()
  .isURL()
  .withMessage(`${FORM_FIELDS.IMAGE_URL} must be a valid URL`)
  .bail()
  .custom((value) => {
    if (!cloudinaryService.isCloudinaryUrl(value)) {
      throw new HttpError(
        status.BAD_REQUEST,
        `${FORM_FIELDS.IMAGE_URL} must be a valid Cloudinary URL`,
        null,
      );
    }
    return true;
  });

export const validators = {
  paginationValidators,
  paramIdValidator,
  bodyImageUrlValidator,
};
