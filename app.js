const express = require("express");
const { notFound, errorHandler } = require("./middlewares/errors");
require("dotenv").config();
const connectToDB = require("./config/db");
const cors = require("cors");

// Connection to database
connectToDB();

const app = express();

// middlewares
app.use(express.json());
// app.use(notFound);
// app.use(errorHandler);

// ROUTES:
app.use(cors());
app.use("/api/auth", require("./routes/userRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(
    `Server is running in ${process.env.MODE_ENV} mode on port ${port}`
  );
});
