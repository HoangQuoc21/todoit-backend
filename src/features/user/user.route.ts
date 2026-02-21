import express from "express";
import { body } from "express-validator";
import { userController } from "./user.controller";
import { FORM_FIELDS, PASSWORD_MIN_LENGTH } from "@/utils";
import { middlewares } from "@/middlewares";
import { validators } from "@/validators";

const userRouter = express.Router();

/**
 * @openapi
 * /user/me:
 *   get:
 *     summary: Get current authenticated user's profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *       401:
 *         description: Unauthorized
 */
userRouter.get("/me", middlewares.isAuthenticatedHandler, userController.getMe);

/**
 * @openapi
 * /user/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB User ID
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 email:
 *                   type: string
 *                 name:
 *                   type: string
 *       400:
 *         description: Invalid user ID format
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
userRouter.get(
  "/:id",
  [middlewares.isAuthenticatedHandler, validators.paramIdValidator],
  userController.getUser,
);

/**
 * @openapi
 * /user:
 *   put:
 *     summary: Update user information
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 description: User's new password
 *               name:
 *                 type: string
 *                 description: User's full name
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
userRouter.put(
  "/",
  [
    middlewares.isAuthenticatedHandler,
    body(FORM_FIELDS.EMAIL)
      .isEmail()
      .withMessage("Email must be valid")
      .normalizeEmail(),
    body(FORM_FIELDS.PASSWORD)
      .optional()
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
    validators.bodyImageUrlValidator,
  ],
  userController.editUser,
);

/**
 * @openapi
 * /user:
 *   delete:
 *     summary: Delete the current user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 */
userRouter.delete(
  "/",
  middlewares.isAuthenticatedHandler,
  userController.deleteUser,
);

userRouter.patch(
  "/update-push-token",
  [
    middlewares.isAuthenticatedHandler,
    body(FORM_FIELDS.PUSH_TOKEN)
      .trim()
      .notEmpty()
      .withMessage(`${FORM_FIELDS.PUSH_TOKEN} is required`),
  ],
  userController.updatePushToken,
);

export { userRouter };
