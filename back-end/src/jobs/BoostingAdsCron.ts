import cron from "node-cron";
import logger from "jet-logger";
import Room from "@src/models/mongoose/Room";
export const checkExpiredBoostingAds = () => {
  // Runs every day at 2:00 AM
  cron.schedule("0 2 * * *", async () => {
    logger.info("🚀 [CRON] Checking for expired boosting ads...");

    const now = new Date();

    try {
      const expiredRooms = await Room.find({
        boost_status: true,
        boost_end_at: { $lt: now },
      });

      if (expiredRooms.length === 0) {
        logger.info("✅ No expired boosted rooms found.");
        return;
      }

      for (const room of expiredRooms) {
        try {
          room.boost_history ??= [];
          room.boost_history.push({
            start_at: room.boost_start_at ?? new Date(0),
            end_at: room.boost_end_at ?? new Date(0),
          });
          room.boost_status = false;
          room.boost_start_at = undefined;
          room.boost_end_at = undefined;
          await room.save();

          logger.info(
            `🛑 Boost expired -> Room ${String(room._id)}${
              room.room_number ? ` (${String(room.room_number)})` : ""
            } updated.`,
          );
        } catch (err) {
          logger.err(
            `❌ Failed to update boost for Room ${String(room._id)}: ${
              err instanceof Error ? err.message : String(err)
            }`,
            err,
          );
        }
      }

      logger.info(
        `✅ Finished checking boost ads. Total updated: ${expiredRooms.length}`,
      );
    } catch (error) {
      logger.err("❌ Error during checking expired boosting ads:", error);
    }
  });
};
