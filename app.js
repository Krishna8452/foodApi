require('dotenv').config()
const port = parseInt(process.env.PORT);
const express = require("express");
const bodyParser = require("body-parser")
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const db = require("./config/db")
const app = express();
const path = require('path') 
const cors = require('cors')
app.use(express.json());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors({origin:'http://localhost:3000'}))

app.use(express.static(path.join(__dirname, 'public')));

db.connect()
.then(()=>{
  console.log('postgreSQL database connected successfully')
})
.catch((error) =>{
  console.log(error, "failed to connect with postgreSQL database")
})

const foodItemRouter = require("./routes/foodItemRouter");
const userRouter = require ("./routes/userRouter")
const cartRouter = require("./routes/cartRouter")


app.use("/api", foodItemRouter);
app.use("/api", userRouter);
app.use("/api", cartRouter);
const options = {
  definition: {  
    openapi: '3.0.0',
    info: {
      title: 'This is Node express api for User',
      version: '1.0.0',
      description:'this is a api for user web application'
    },
    servers: [
      {
        url: `http://localhost:${port}`
      }
    ]
  },
  apis  : ["./routes/*.js"],
};

const specs = swaggerJSDoc(options);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});