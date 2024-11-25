const express = require("express");
require("dotenv").config();
const connectToDB = require("./config/db");

// Connection to database
connectToDB();

const app = express();

app.use(express.json());

// ROUTES:
app.use("/api/auth", require("./routes/userRoutes"));

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(
    `Server is running in ${process.env.MODE_ENV} mode on port ${port}`
  );
});
