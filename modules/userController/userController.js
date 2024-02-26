const db = require("../../config/db");
exports.addUser = async (req, res) => {
  console.log(`request initiated || url : api/users req body || full Name : ${req.body.fullName} || Email : ${req.body.email} || Number : ${req.body.number}`)
  try {
    const { fullName, email, number } = req.body;

    const checkUserQuery = "SELECT * FROM users WHERE email = $1";
    const existingUser = await db.query(checkUserQuery, [email]);
    if(existingUser.rows.length>0){
      console.log(existingUser.rows[0].id,"===============================================================")
      var userId = existingUser.rows[0].id
    }

    if (!fullName) {
      return res.status(400).json({ error: "Full name is required" });
    }
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    if (!number) {
      return res.status(400).json({ error: "Number is required" });
    }

    const insertQuery = "INSERT INTO users (fullName, email, number) VALUES ($1, $2, $3) RETURNING id";

    if (existingUser.rows.length === 0) {
      const result = await db.query(insertQuery, [fullName, email, number]);
      const userId = result.rows[0].id;
      res.status(201).json({ success: "User added successfully", userId });
    } else {
      return res.status(201).json({ error: "User already exists", userId });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.checkUserExistence = async (req, res) => {
  try {
    console.log(`request initiated user verification|| url :/api/userExist/ Email : ${req.query.email} Number: ${req.query.number}`)
    const { email, number } = req.query;

    if (!email && !number) {
      return res
        .status(400)
        .json({ error: "Email or phone number is required" });
    }

    const checkUserQuery =
      "SELECT * FROM users WHERE email = $1 OR number = $2";
    const existingUser = await db.query(checkUserQuery, [email, number]);
    console.log(existingUser.rows[0])

    if (existingUser.rows.length > 0) {
      return res.status(200).json({ exists: true, user: existingUser.rows[0] });
    }

    return res.status(200).json({ exists: false });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
 