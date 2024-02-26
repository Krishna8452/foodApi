const express = require('express')
const router = express.Router()
const {
    addUser,
    checkUserExistence
} = require("../modules/userController/userController")


/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         fullName:
 *           type: string
 *           description: Full name of the user
 *         email:
 *           type: string
 *           format: email
 *           description: Email address of the user
 *         number:
 *           type: string
 *           description: Phone number of the user
 *       required:
 *         - fullName
 *         - email
 *         - number
 *       example:
 *         fullName: John Doe
 *         email: john.doe@example.com
 *         number: +1234567890
 */

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Add a new user
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       '200':
 *         description: User added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '500':
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/userExist:
 *   get:
 *     summary: Check if a user exists
 *     tags:
 *       - User
 *     parameters:
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Email address of the user
 *       - in: query
 *         name: number
 *         schema:
 *           type: string
 *         description: Phone number of the user
 *     responses:
 *       '200':
 *         description: User exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exists:
 *                   type: boolean
 *                   description: Indicates whether the user exists or not
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       '404':
 *         description: User does not exist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exists:
 *                   type: boolean
 *                   description: Indicates whether the user exists or not
 *       '500':
 *         description: Internal server error
 */



router.route("/users")
    .post(addUser)
router.route("/userExist") 
    .get(checkUserExistence)


module.exports = router