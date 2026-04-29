import express from "express";
import { body } from "express-validator";
import { UserModel } from "../user";
import { authController } from "./auth.controller";
import { FORM_FIELDS, PASSWORD_MIN_LENGTH } from "@/constants";
import { middlewares } from "@/middlewares";

const authRouter = express.Router();

/**
 * @openapi
 * /auth/sign-up:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: User's password (minimum 6 characters)
 *               name:
 *                 type: string
 *                 description: User's full name
 *     responses:
 *       201:
 *         description: User successfully created
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
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                     imageUrl:
 *                       type: string
 *                       nullable: true
 *                     accessToken:
 *                       type: string
 *                     pushToken:
 *                       type: string
 *                       nullable: true
 *       400:
 *         description: Validation error or email already in use
 */
authRouter.post(
  "/sign-up",
  [
    body(FORM_FIELDS.EMAIL)
      .isEmail()
      .withMessage(`${FORM_FIELDS.EMAIL} must be a valid email`)
      .custom(async (value) => {
        const existingUser = await UserModel.findOne({ email: value });
        if (existingUser) {
          return Promise.reject("Email already in use");
        }
      })
      .normalizeEmail(),
    body(FORM_FIELDS.PASSWORD)
      .trim()
      .isLength({ min: PASSWORD_MIN_LENGTH })
      .withMessage(
        `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`,
      ),
    body(FORM_FIELDS.NAME)
      .trim()
      .not()
      .isEmpty()
      .withMessage(`${FORM_FIELDS.NAME} is required`),
  ],
  authController.signUp,
);

/**
 * @openapi
 * /auth/sign-in:
 *   post:
 *     summary: Sign in an existing user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: User's password (minimum 6 characters)
 *     responses:
 *       200:
 *         description: Successfully signed in
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
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                     imageUrl:
 *                       type: string
 *                       nullable: true
 *                     accessToken:
 *                       type: string
 *                     pushToken:
 *                       type: string
 *                       nullable: true
 *       400:
 *         description: Validation error
 *       401:
 *         description: Incorrect password
 *       404:
 *         description: User not found
 */
authRouter.post(
  "/sign-in",
  [
    body(FORM_FIELDS.EMAIL).isEmail().withMessage("Email must be valid"),
    body(FORM_FIELDS.PASSWORD)
      .trim()
      .isLength({ min: PASSWORD_MIN_LENGTH })
      .withMessage(
        `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`,
      ),
  ],
  authController.signIn,
);

/**
 * @openapi
 * /auth/sign-out:
 *   post:
 *     summary: Sign out the current user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully signed out
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
 *                   type: object
 *                   nullable: true
 *       401:
 *         description: Unauthorized - user not authenticated
 */
authRouter.post(
  "/sign-out",
  middlewares.isAuthenticatedHandler,
  authController.signOut,
);

export { authRouter };
