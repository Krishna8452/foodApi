const db = require("../../config/db");
const mjml2html = require("mjml");
require("dotenv").config();
const transporter = require("../../helper/bill/transporter");
const ejs = require("ejs");
const path = require("path");
const fs = require("fs");

exports.addToCart = async (req, res) => {
  try {
    console.log(
      `request initiated: url: /api/carts/addtocart || userId : ${req.body.userId} `
    );
    const { items } = req.body;
    const userId = req.body.userId;
    const userExistsResult = await db.query(
      "SELECT * FROM users WHERE id = $1",
      [userId]
    );


    if (userExistsResult.rowCount === 0) {
      return res.status(404).send("User not found");
    }

    const cartExistsResult = await db.query(
      "SELECT * FROM carts WHERE user_id = $1",
      [userId]
    );

    if (cartExistsResult.rowCount > 0) {
      const cartId = cartExistsResult.rows[0].id;

      for (const item of items) {
        const productDetailsResult = await db.query(
          "SELECT * FROM food_items WHERE id = $1",
          [item.productId]
        );

        if (productDetailsResult.rowCount === 0) {
          return res.status(404).send("foodItems not found");
        }

        const productDetails = productDetailsResult.rows[0];

        const existingProduct = await db.query(
          "SELECT * FROM carts_food_items WHERE cart_id = $1 AND food_item_id = $2",
          [cartId, item.productId]
        );

        if (existingProduct.rowCount > 0) {
          const existingProductData = existingProduct.rows[0];
          const newQuantity = existingProductData.quantity + item.quantity;
          const newPrice = newQuantity * productDetails.price;

          await db.query(
            "UPDATE carts_food_items SET quantity = $1, price = $2 WHERE cart_id = $3 AND food_item_id = $4",
            [newQuantity, newPrice, cartId, item.productId]
          );
        } else {
          const newPrice = item.quantity * productDetails.price;
          await db.query(
            "INSERT INTO carts_food_items (cart_id, food_item_id, quantity, price) VALUES ($1, $2, $3, $4)",
            [cartId, item.productId, item.quantity, newPrice]
          );
        }
      }

      const updatedTotalPriceQuery =
        "SELECT SUM(price) AS total_price FROM carts_food_items WHERE cart_id = $1";
      const updatedTotalPriceResult = await db.query(updatedTotalPriceQuery, [
        cartId,
      ]);

      const updatedTotalPrice = updatedTotalPriceResult.rows[0].total_price;

      const updateCartQuery = "UPDATE carts SET total_price = $1 WHERE id = $2";
      await db.query(updateCartQuery, [updatedTotalPrice, cartId]);

      res.status(200).json({ success: "Cart updated successfully" });
    } else {
      let total_price = 0;

      const insertCartResult = await db.query(
        "INSERT INTO carts (user_id, total_price) VALUES ($1, $2) RETURNING id",
        [userId, total_price]
      );

      for (const item of items) {
        const productDetailsResult = await db.query(
          "SELECT * FROM food_items WHERE id = $1",
          [item.productId]
        );

        if (productDetailsResult.rowCount === 0) {
          return res.status(404).send("Product not found");
        }

        const productDetails = productDetailsResult.rows[0];

        if (productDetails.quantity < item.quantity) {
          return res.status(400).send("Product quantity is not available");
        }

        const newPrice = item.quantity * productDetails.price;
        total_price += newPrice;

        await db.query(
          "INSERT INTO carts_food_items (cart_id, food_item_id, quantity, price) VALUES ($1, $2, $3, $4)",
          [insertCartResult.rows[0].id, item.productId, item.quantity, newPrice]
        );
      }

      await db.query("UPDATE carts SET total_price = $1 WHERE id = $2", [
        total_price,
        insertCartResult.rows[0].id,
      ]);

      res.status(200).json({
        success: "Product added to cart successfully",
      });
    }
    console.log("request completed || product added successfully");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.checkout = async (req, res) => {
  console.log(`request initiated || API: /api/carts/checkout  userId : ${req.query.userId} `);
  const userId = req.query.userId;
  console.log(userId, "dfdfdfd");
  const query = "SELECT * FROM carts WHERE user_id = $1";
  const userCartData = await db.query(query, [userId]);
  if (userCartData.rowCount === 0) {
    return res
      .status(404)
      .json({ message: "carts for this user not found !!!" });
  }
  const userCart = userCartData.rows[0];
  const cartId = userCart.id;
  const cartProduct = await db.query(
    "SELECT cp.quantity, cp.price, p.id, p.name FROM carts_food_items cp JOIN food_items p ON CP.food_item_id = p.id  WHERE cp.cart_id =$1",
    [userCart.id]
  );
  userCart.products = cartProduct.rows;

  const order = await db.query(
    "INSERT INTO orders (user_id, total_price) VALUES($1, $2) RETURNING *",
    [userId, userCart.total_price]
  );
  const orderId = order.rows[0].id;
  for (const product of userCart.products) {
    await db.query(
      "INSERT INTO orders_food_items (order_id, food_item_id, quantity, price) VALUES($1, $2, $3, $4)",
      [orderId, product.id, product.quantity, product.price]
    );

    await db.query("DELETE FROM carts_food_items WHERE cart_id = $1", [cartId]);
    await db.query("DELETE FROM carts WHERE user_id = $1", [userId]);
  }
  console.log("--------------------->>", userCart);

  res.status(200).send( userCart);
};

exports.removeFromCart = async (req, res) => {
  console.log(
    `request initiated || API:/api/carts/removeFromOrder || userId : ${req.query.user_id} || food_item_id : ${req.query.food_item_id}`
  );
  const { user_id } = req.query;
  const { food_item_id } = req.query;
  console.log(user_id, ",,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,");

  try {
    const userExistsResult = await db.query(
      "SELECT * FROM users WHERE id = $1",
      [user_id]
    );

    if (userExistsResult.rowCount === 0) {
      return res.status(404).send("User  not found");
    }

    const orderExistsResult = await db.query(
      "SELECT * FROM orders WHERE user_id = $1",
      [user_id]
    );

    if (orderExistsResult.rowCount === 0) {
      return res.status(404).send("order not found");
    }

    const order_id = orderExistsResult.rows[0].id;
    console.log(order_id, "cartidddddddddddddddddddd");

    const existingProduct = await db.query(
      "SELECT * FROM orders_food_items WHERE order_id = $1 AND food_item_id = $2",
      [order_id, food_item_id]
    );

    if (existingProduct.rowCount === 0) {
      return res.status(404).send("food item not found in the Order");
    }

    await db.query(
      "DELETE FROM orders_food_items WHERE order_id = $1 AND food_item_id = $2",
      [order_id, food_item_id]
    );
    const checkingOrderExistingProduct = await db.query(
      "SELECT * FROM orders_food_items WHERE order_id = $1",
      [order_id] 
    );
    console.log(checkingOrderExistingProduct.rowCount, "kkkkkkkkkk");
    if (checkingOrderExistingProduct.rowCount > 0) {
      const updatedTotalPriceQuery =
        "SELECT SUM(price) AS total_price FROM orders_food_items WHERE order_id = $1";
      const updatedTotalPriceResult = await db.query(updatedTotalPriceQuery, [
        order_id,
      ]);
      const updatedTotalPrice = updatedTotalPriceResult.rows[0].total_price;

      await db.query("UPDATE orders SET total_price = $1 WHERE id = $2", [
        updatedTotalPrice,
        order_id,
      ]);
    } else {
      await db.query("DELETE FROM orders WHERE id = $1", [order_id]);
    }
    res.send("food item removed from the order, and order updated");
  } catch (error) {
    res
      .status(500)
      .send({ message: "Internal Server Error", error: error.message });
  }
};

exports.getOrderDetailsByUserId = async (req, res) => {
  console.log(`Request initiated || API: api/carts/getOrder/${req.params.id}`);
  const userId = req.params.id;
  try {
    const userExistsResult = await db.query(
      "SELECT * FROM users WHERE id = $1",
      [userId]
    );

    if (userExistsResult.rowCount === 0) {
      return res.status(404).send("User not found");
    }

    const orderResult = await db.query(
      "SELECT * FROM orders WHERE user_id = $1",
      [userId]
    );

    if (orderResult.rowCount === 0) {
      return res.status(404).send("Order not found for the user");
    }

    const orderId = orderResult.rows[0].id;

    const orderDetailsResult = await db.query(
      "SELECT cp.quantity, cp.price, p.id AS product_id, p.name AS product_name FROM orders_food_items cp JOIN food_items p ON cp.food_item_id = p.id WHERE cp.order_id = $1",
      [orderId]
    );

    const orderDetails = {
      orderId: orderId,
      total_price: orderResult.rows[0].total_price,
      status: orderResult.rows[0].status,
      products: orderDetailsResult.rows,
    };

    res.status(200).json(orderDetails);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  console.log(`request initiated || API : /api/order`)
  try {
    const allOrdersResult = await db.query("SELECT * FROM orders");
    const allOrders = allOrdersResult.rows;

    const ordersDetails = await Promise.all(
      allOrders.map(async (order) => {
        const orderDetailsResult = await db.query(
          "SELECT cp.quantity, cp.price, p.id AS product_id, p.name AS product_name FROM orders_food_items cp JOIN food_items p ON cp.food_item_id = p.id WHERE cp.order_id = $1",
          [order.id]
        );

        return {
          orderId: order.id,
          total_price: order.total_price,
          products: orderDetailsResult.rows,
        };
      })
    );
    res.status(200).json(ordersDetails);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

exports.sendBill = async (req, res) => { 
  console.log(`request initiated: || API: /api/order/bill/${req.params.userId}`)
  try {
    const userId = req.params.userId; 

    const userResult = await db.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);

    if (userResult.rowCount === 0) {
      return res.status(404).send("User not found");
    }

    const user = userResult.rows[0];

    const orderResult = await db.query(
      "SELECT * FROM orders WHERE user_id = $1",
      [userId]
    );

    if (orderResult.rowCount === 0) {
      return res.status(404).send("Order not found for the user");
    }

    const orderId = orderResult.rows[0].id;

    const orderDetailsResult = await db.query(
      "SELECT cp.quantity, cp.price, p.id AS food_id,  p.price AS food_rate, p.name AS food_name FROM orders_food_items cp JOIN food_items p ON cp.food_item_id = p.id WHERE cp.order_id = $1",
      [orderId]
    );
    const today = new Date().toLocaleDateString();


    const userOrderDetail = {
      userId: userId,
      orderId: orderId,
      date:today,
      userName:userResult.rows[0].fullname,
      email:userResult.rows[0].email,
      total_price: orderResult.rows[0].total_price,
      status: orderResult.rows[0].status,
      products: orderDetailsResult.rows,
    };  

    const mjmlTemplate = fs.readFileSync(
      path.resolve(__dirname, "../../helper/bill/bill.mjml"),
      "utf8"
    ); 
    const templateVars = {
      userOrderDetail
    };

    const renderedMJML = ejs.render(mjmlTemplate, templateVars);
    const { html } = mjml2html(renderedMJML);

    const info = await transporter.sendMail({
      from: `uniqkris100@gmail.com`,
      to: userResult.rows[0].email,
      subject: "Your Invoice",
      html: html, 
    });
    console.log(`respone ||  ${userOrderDetail}`)
    return res.status(200).json({message: "Invoice sent successfully", userOrderDetail});
  } catch (error) {
    console.error("Error sending invoice:", error);
    return res.status(500).json( error.message );
  }
};
