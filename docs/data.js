/**
 * @swagger
 * tags:
 *   name: Actions
 *   description: Action management and analysis endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Action:
 *       type: object
 *       required:
 *         - timestamp
 *         - reactionTime
 *         - finger
 *         - hand
 *         - gameMode
 *       properties:
 *         userId:
 *           type: string
 *           description: ID of the user who performed the action
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: When the action was performed
 *         reactionTime:
 *           type: number
 *           description: Reaction time in milliseconds
 *         finger:
 *           type: string
 *           description: Which finger was used
 *           enum: [thumb, index, middle, ring, pinky]
 *         hand:
 *           type: string
 *           description: Which hand was used
 *           enum: [left, right]
 *         gameMode:
 *           type: string
 *           description: The game mode being played
 *       example:
 *         userId: "60d725c6b0d7c7001504f657"
 *         timestamp: "2023-12-25T12:00:00Z"
 *         reactionTime: 250
 *         finger: "index"
 *         hand: "right"
 *         gameMode: "standard"
 *     
 *     ActionResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Action'
 *     
 *     TrendsResponse:
 *       type: object
 *       properties:
 *         averageReactionTime:
 *           type: number
 *           description: Average reaction time across all actions
 *         trendData:
 *           type: object
 *           description: Various trend analysis data
 */

/**
 * @swagger
 * /api/data/save-action:
 *   post:
 *     summary: Save a new action
 *     tags: [Actions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - timestamp
 *               - reactionTime
 *               - finger
 *               - hand
 *               - gameMode
 *             properties:
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *               reactionTime:
 *                 type: number
 *               finger:
 *                 type: string
 *                 enum: [thumb, index, middle, ring, pinky]
 *               hand:
 *                 type: string
 *                 enum: [left, right]
 *               gameMode:
 *                 type: string
 *     responses:
 *       201:
 *         description: Action saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Action saved successfully
 *                 data:
 *                   $ref: '#/components/schemas/Action'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/data/get-actions/{userId}:
 *   get:
 *     summary: Get all actions for a specific user
 *     tags: [Actions]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user
 *     responses:
 *       200:
 *         description: List of actions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ActionResponse'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/data/get-actions:
 *   get:
 *     summary: Get all actions for the authenticated user
 *     tags: [Actions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of actions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ActionResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/data/trends/{userId}:
 *   get:
 *     summary: Get trend analysis for a specific user
 *     tags: [Actions]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user
 *     responses:
 *       200:
 *         description: Trend analysis retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TrendsResponse'
 *       500:
 *         description: Server error or Python script execution failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to process data
 */
