import mongoose from "mongoose";
import logger from "jet-logger";

const { MONGODB_URI } = process.env;

export const connectDB = async () => {
  try {
    if (!MONGODB_URI) throw new Error("Missing MongoDB config");
    await mongoose.connect(MONGODB_URI);
    logger.info("MongoDB connected");
    logger.info(`MongoDB URI: ${MONGODB_URI}`);
  } catch (error) {
    logger.err(
      "MongoDB connection error: " +
        (error instanceof Error ? error.message : String(error)),
    );
    throw new Error("MongoDB connection failed");
  }
};
