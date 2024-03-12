const mongoose = require("mongoose");
const path = require('path'); // Import the 'path' module
require('dotenv').config({ path: path.join(__dirname, '.env') });

const url = process.env.MONGO_URL;

console.log("MongoDB connection URL:", process.env.MONGO_URL);

module.exports.connect = async () => {
  try {
    await mongoose.connect(url); // Removed deprecated options

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
  }
};
