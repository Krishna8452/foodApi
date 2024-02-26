const express = require("express");
const router = express.Router();
const {
  addFoodItem,
  getAllFoodItems,
  getFoodItemsByCategory
} = require("../modules/foodItemController/foodItemController");
const { uploadImage } = require("../helper/imageUpload");

/**
 * @swagger
 * components:
 *   schemas:
 *     FoodItem:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the food item
 *         category:
 *           type: string
 *           description: Category of the food item
 *         price:
 *           type: number
 *           description: Price of the food item
 *         image:
 *           type: string
 *           format: binary
 *           description: Image file of the food item
 *       required:
 *         - name
 *         - category
 *         - price
 *         - availability_status
 *         - image
 *       example:
 *         name: Food Item Name
 *         category: Food Category
 *         price: 19.99
 *         image: [binary data]
 */

/**
 * @swagger
 * /api/foodItem:
 *   post:
 *     summary: Add a new food item
 *     tags:
 *       - Food Item
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the food item
 *               category:
 *                 type: string
 *                 description: Category of the food item
 *               price:
 *                 type: number
 *                 description: Price of the food item
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file of the food item
 *             required:
 *               - name
 *               - category
 *               - price
 *               - image
 *     responses:
 *       '200':
 *         description: Food item added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FoodItem'
 *       '500':
 *         description: Internal server error
 *   get:
 *     summary: Get all food items
 *     tags:
 *       - Food Item
 *     responses:
 *       '200':
 *         description: Food items retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FoodItem'
 *       '500':
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/foodItem/category:
 *   get:
 *     summary: Get food items by category
 *     tags:
 *       - Food Item
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         required: true
 *         description: Category of the food items to retrieve
 *     responses:
 *       '200':
 *         description: Food items retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FoodItem'
 *       '400':
 *         description: Bad Request - Missing or invalid category parameter
 *       '500':
 *         description: Internal server error
 */


router.route("/foodItem")
    .post(uploadImage, addFoodItem)
    .get(getAllFoodItems)
router.route("/foodItem/category")
    .get(getFoodItemsByCategory)

module.exports = router;
