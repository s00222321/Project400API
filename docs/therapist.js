/**
 * @swagger
 * tags:
 *   name: Therapists
 *   description: Therapist management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Therapist:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the therapist
 *         username:
 *           type: string
 *           description: Therapist's username
 *         email:
 *           type: string
 *           format: email
 *           description: Therapist's email address
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the therapist account was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the therapist account was last updated
 *       example:
 *         _id: "60d725c6b0d7c7001504f657"
 *         username: "dr.smith"
 *         email: "dr.smith@example.com"
 *         createdAt: "2023-12-25T12:00:00Z"
 *         updatedAt: "2023-12-25T12:00:00Z"
 *     
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Error message
 *         error:
 *           type: string
 *           description: Detailed error message
 *       example:
 *         message: "Therapist not found"
 *         error: "Not found error"
 */

/**
 * @swagger
 * /api/therapist:
 *   get:
 *     summary: Get authenticated therapist's details
 *     description: Retrieves the profile information of the currently authenticated therapist (excludes password)
 *     tags: [Therapists]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Therapist details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Therapist'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Therapist not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Therapist not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */
