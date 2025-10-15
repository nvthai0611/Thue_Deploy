import * as dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import logger from "jet-logger";

dotenv.config({
  path: path.resolve(__dirname, "../../config/.env.development"),
});

const uri = process.env.MONGODB_URI;

async function connectToMongo() {
  try {
    await mongoose.connect(uri!);
    logger.info("Connected to MongoDB successfully");
    await mongoose.disconnect();
    logger.info("Disconnected from MongoDB successfully");
  } catch (error) {
    logger.err(
      "MongoDB connection error: " +
        (error instanceof Error ? error.message : String(error)),
    );
    throw error;
  }
}

connectToMongo();
