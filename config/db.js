const mongoose = require("mongoose");

async function connectToDB() {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is not defined in the environment variables");
    process.exit(1);
  }
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Connection failed to MongoDB", error);
    process.exit(1);
  }
}
process.on("SIGINT", async () => {
  try {
    await mongoose.connection.close();
    console.log("MongoDB connection closed due to app termination");
    process.exit(0);
  } catch (error) {
    console.error("Error closing MongoDB connection", error);
    process.exit(1);
  }
});

module.exports = connectToDB;
