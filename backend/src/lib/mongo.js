import mongoose from "mongoose";

const connectDB = async () => {
  const DB_URL = process.env.DB_URL;

  try {
    if (!DB_URL) {
      throw new Error("Database URL is not defined");
    }
    await mongoose.connect(DB_URL);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
};

export default connectDB