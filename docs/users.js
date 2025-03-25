/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and preferences endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the user
 *         username:
 *           type: string
 *           description: User's username
 *         therapistId:
 *           type: string
 *           description: ID of the assigned therapist
 *         preferences:
 *           type: object
 *           properties:
 *             hand:
 *               type: string
 *               enum: [left, right]
 *               description: User's dominant hand
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         _id: "60d725c6b0d7c7001504f657"
 *         username: "johnsmith"
 *         therapistId: "60d725c6b0d7c7001504f658"
 *         preferences:
 *           hand: "right"
 *         createdAt: "2023-12-25T12:00:00Z"
 *         updatedAt: "2023-12-25T12:00:00Z"
 *     
 *     UserPreferences:
 *       type: object
 *       properties:
 *         hand:
 *           type: string
 *           enum: [left, right]
 *           description: User's dominant hand
 *       example:
 *         hand: "right"
 *     
 *     RegisterUserInput:
 *       type: object
 *       required:
 *         - username
 *         - password
 *         - therapistId
 *         - hand
 *       properties:
 *         username:
 *           type: string
 *           description: User's username
 *         password:
 *           type: string
 *           format: password
 *           description: User's password
 *         therapistId:
 *           type: string
 *           description: ID of the assigned therapist
 *         hand:
 *           type: string
 *           enum: [left, right]
 *           description: User's dominant hand
 *       example:
 *         username: "johnsmith"
 *         password: "securepassword123"
 *         therapistId: "60d725c6b0d7c7001504f658"
 *         hand: "right"
 */

/**
 * @swagger
 * /api/users/{therapistId}:
 *   get:
 *     summary: Get all users for a specific therapist
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: therapistId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the therapist
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: Get authenticated user's details
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/preferences:
 *   get:
 *     summary: Get user preferences
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User preferences retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserPreferences'
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 *   
 *   put:
 *     summary: Update user preferences
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - preferences
 *             properties:
 *               preferences:
 *                 $ref: '#/components/schemas/UserPreferences'
 *     responses:
 *       200:
 *         description: Preferences updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserPreferences'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/register-user:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterUserInput'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User registered successfully!
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
