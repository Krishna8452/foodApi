const express = require('express')
const router = express.Router()
const {
    addToCart,
    checkout,
    removeFromCart,
    getOrderDetailsByUserId, 
    sendBill
} = require("../modules/cart/cartController")

/**
 * @swagger
 * components:
 *   schemas:   
 *     carts:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *           description: The ID of the user who owns the order.
 *         items:
 *           type: array
 *           description: An array of items in the order.
 *           items:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *                 description: The ID of the product in the order.
 *               quantity:
 *                 type: integer
 *                 description: The quantity of the product in the cart.
 *         price:
 *           type: number
 *           description: The total price of the cart.
 *           default: 0
 *       example:
 *         userId: "5f8a2b9a3deac124c82294e0"
 *         items:
 *           - productId: "5f8a2b9a3deac124c82294e2"
 *             quantity: 3
 */

/**
 * @swagger
 * tags:
 *   - name: Order
 *     description: Order-related APIs
 */

/**
 * @swagger
 * /api/carts/addtocart:
 *   post:
 *     summary: Add items to a shopping cart
 *     tags:
 *       - Order
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/carts'
 *     responses:
 *       '200':
 *         description: Items added to the order successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/orders'
 *       '500':
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/carts/checkout:
 *   post:
 *     summary: Checkout a shopping cart
 *     tags:
 *       - Order
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user who owns the cart to be checked out.
 *     responses:
 *       '200':
 *         description: Checkout successful
 *       '404':
 *         description: User or cart not found
 *       '500':
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/carts/removeFromOrder:
 *   delete:
 *     summary: Remove an item from the shopping cart
 *     tags:
 *       - Order
 *     parameters:
 *       - in: query
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user who owns the cart.
 *       - in: query
 *         name: food_item_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the food item to be removed from the cart.
 *     responses:
 *       '204':
 *         description: Item removed from the cart successfully
 *       '404':
 *         description: User, cart, or food item not found
 *       '500':
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/carts/getOrder/{id}:
 *   get:
 *     summary: Get order details for a specific user by user ID
 *     tags:
 *       - Order
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user whose order details are to be retrieved.
 *     responses:
 *       '200':
 *         description: Order details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/orders'  
 *       '404':
 *         description: User or order not found
 *       '500':
 *         description: Internal server error
 */

router.route("/carts/getOrder/:id").get(getOrderDetailsByUserId);
router.route("/carts/removeFromOrder").delete(removeFromCart);
router.route("/carts/addtocart").post(addToCart)
router.route("/carts/checkout").post(checkout)
router.route("/order/bill/:userId").get(sendBill)

module.exports = router 