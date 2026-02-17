import express from "express";
import { body } from "express-validator";
import { userModel } from "../user/user.model";
import { authController } from "./auth.controller";
import { FORM_FIELDS, PASSWORD_MIN_LENGTH } from "../../utils";
import { middlewares } from "../../middlewares";

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
 *                 minLength: 8
 *                 description: User's password (minimum 8 characters)
 *               name:
 *                 type: string
 *                 description: User's full name
 *     responses:
 *       201:
 *         description: User successfully created
 *       400:
 *         description: Validation error or email already in use
 */
authRouter.post(
  "/sign-up",
  [
    body(FORM_FIELDS.EMAIL)
      .isEmail()
      .withMessage("Email must be valid")
      .custom(async (value) => {
        const existingUser = await userModel.findOne({ email: value });
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
      .withMessage("Name is required"),
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
 *                 minLength: 8
 *                 description: User's password
 *     responses:
 *       200:
 *         description: Successfully signed in
 *       400:
 *         description: Invalid credentials
 *       401:
 *         description: Unauthorized
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
 *       401:
 *         description: Unauthorized - user not authenticated
 */
authRouter.post(
  "/sign-out",
  middlewares.isAuthenticatedHandler,
  authController.signOut,
);

export { authRouter };
