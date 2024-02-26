const db = require("../../config/db");
const fs = require("fs");
const path = require("path");

exports.addFoodItem = async (req, res) => {
  try {
    const image_name = req.file.filename;
    const { name, category, price } = req.body;
    console.log(`request || initiated name: ${name} category: ${category} price: ${price}`)
    const insertUserQuery =
      "INSERT INTO food_items (name, category, price, image_name) VALUES ($1, $2, $3, $4)";
    const { rows: added } = await db.query(insertUserQuery, [
      name,
      category,
      price,
      image_name,
    ]);
    res.status(200).json({ success: "response: food items created successfully", added });
  } catch (error) {
    if (req.file) {
      const imagePath = path.join(
        __dirname,
        "../../public/images", 
        req.file.filename
      );
      fs.unlink(imagePath, (unlinkError) => {
        if (unlinkError) {
          console.error("Error deleting image:", unlinkError);
        }
      });
    }
    res.status(500).json({ error: error.message });
  }
};
exports.getAllFoodItems = async (req, res) => {
  console.log("request initiated || for all food items")
  try {
    const getAllFoodItemsQuery = "SELECT * FROM food_items";
    const { rows: foodItems } = await db.query(getAllFoodItemsQuery);
    const foodItemsWithImages = foodItems.map((item) => {
      const imageUrl = `http://localhost:5000/images/${item.image_name}`;
      return { ...item, image: imageUrl };
    });
    console.log("response: ", foodItemsWithImages);

    res.status(200).json(foodItemsWithImages);
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getFoodItemsByCategory = async (req, res) => {
  try {
    const  {category}  = req.query;
  console.log(`request initiated for category ${category}`)

    if (!category) {
      return res.status(400).json({ error: 'Category is required' });
    }
    const getFoodItemsByCategoryQuery = 'SELECT * FROM food_items WHERE category = $1';
    const { rows: foodItems } = await db.query(getFoodItemsByCategoryQuery, [category]);

    const foodItemsWithImages = foodItems.map((item) => {
      const imageUrl = `http://localhost:5000/images/${item.image_name}`;
      return { ...item, image: imageUrl };
    });
    console.log("request completed ");
    res.status(200).json(foodItemsWithImages);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
};
