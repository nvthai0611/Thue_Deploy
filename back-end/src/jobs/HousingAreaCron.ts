import { HousingAreaStatus } from "@src/common/constants";
import HousingArea from "@src/models/mongoose/HousingArea";
import logger from "jet-logger";
import cron from "node-cron";

export const startDeleteOldPendingHousingAreasJob = () => {
  // Runs every day at 1:00 AM
  cron.schedule("0 1 * * *", async () => {
    logger.info("Checking for old pending HousingArea...");

    const now = new Date();
    const thresholdDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    try {
      const result = await HousingArea.deleteMany({
        status: HousingAreaStatus.pending,
        createdAt: { $lte: thresholdDate },
      });

      logger.info(
        `Deleted ${result.deletedCount} HousingArea pending older than 7 days.`,
      );
    } catch (error) {
      logger.err("Error when delete", error);
    }
  });
};
