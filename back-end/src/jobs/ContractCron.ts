import { ContractStatus } from "@src/common/constants";
import Contract from "@src/models/mongoose/Contract";
import HousingAreaRepo from "@src/repos/HousingAreaRepo";
import RoomRepo from "@src/repos/RoomRepo";
import TransactionRepo from "@src/repos/TransactionRepo";
import ContractService from "@src/services/ContractService";
import {
  sendContractAboutToExpireMail,
  sendContractAboutToExpireToLandlord,
  sendExpiredContractMail,
  sendExtendedMail,
} from "@src/services/email/emailService";
import UserService from "@src/services/UserService";
import logger from "jet-logger";
import cron from "node-cron";

export const setExpiredContracts = () => {
  // Runs every day at 2:00 AM
  cron.schedule("0 2 * * *", async () => {
    logger.info("📆 [CRON] Checking for expired rental contracts...");

    const now = new Date();

    try {
      // Find contracts that are still active but have passed their end date
      const expiredContracts = await Contract.find({
        status: ContractStatus.active,
        end_date: { $lt: now },
      });

      for (const contract of expiredContracts) {
        const tenant = await UserService.getUserById(contract.tenant_id);
        const owner = await UserService.getUserById(contract.owner_id);
        const getRoom = await RoomRepo.findById(contract.room_id);
        if (!getRoom) {
          logger.err(`❌ Không tìm thấy phòng với ID ${contract.room_id}`);
          continue;
        }
        const getHousingArea = await HousingAreaRepo.findOneById(
          getRoom?.housing_area_id?.toString(),
        );

        if (ContractService.isContractPendingLegit(contract)) {
          const pending = contract.pending_updates;
          if (pending?.new_end_date) {
            contract.end_date = new Date(pending.new_end_date);
            contract.status = ContractStatus.active;
            contract.pending_updates = undefined;
            await contract.save();
            await sendExtendedMail(
              tenant.email,
              tenant.name ?? "người dùng",
              getRoom?.room_number ?? "không xác định",
              getHousingArea?.name ?? "Không rõ",
              new Date(pending.new_end_date),
            );
            await sendExtendedMail(
              owner.email,
              owner.name ?? "người dùng",
              getRoom?.room_number ?? "không xác định",
              getHousingArea?.name ?? "Không rõ",
              new Date(pending.new_end_date),
            );
            continue;
          }
        }
        await ContractService.updateContractExpired(contract.id);
        const transaction = await TransactionRepo.findByContractId(contract.id);
        logger.info(
          `🔍 Found expired contract ${contract.id} with transaction ${transaction?.id}.`,
        );
        // Refund the deposit if it was paid
        if (transaction) {
          try {
            await ContractService.refundDeposit(transaction);
            logger.info(
              `✅ Refunded deposit for contract ${contract.id} successfully.`,
            );
          } catch (error) {
            logger.err("❌ Failed to refund deposit:" + error);
          }
        }
        await sendExpiredContractMail(
          tenant.email,
          tenant.name ?? "người dùng",
          getRoom?.room_number ?? "không xác định",
          getHousingArea?.name ?? "Không rõ",
          contract.end_date,
        );
        await sendExpiredContractMail(
          owner.email,
          owner.name ?? "người dùng",
          getRoom?.room_number ?? "không xác định",
          getHousingArea?.name ?? "Không rõ",
          contract.end_date,
        );
      }

      logger.info(
        `✅ Processed ${expiredContracts.length} expired rental contracts.`,
      );
    } catch (error) {
      logger.err("❌ Failed to process expired rental contracts:" + error);
    }
  });
};

export const notifyExpiringContracts = () => {
  // Chạy lúc 8h sáng mỗi ngày
  cron.schedule("*0 8 * * *", async () => {
    logger.info("📆 [CRON] Kiểm tra hợp đồng sắp hết hạn...");

    try {
      const now = new Date();

      // Các mốc thời gian cần kiểm tra
      const daysBeforeList = [7, 3, 1];

      for (const daysBefore of daysBeforeList) {
        // Tính ngày bắt đầu và kết thúc của targetDate (theo UTC)
        const targetDate = new Date(
          Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate() + daysBefore,
            0,
            0,
            0,
            0,
          ),
        );
        const endOfTargetDate = new Date(
          Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate() + daysBefore,
            23,
            59,
            59,
            999,
          ),
        );

        const contracts = await Contract.find({
          status: ContractStatus.active,
          end_date: {
            $gte: targetDate,
            $lte: endOfTargetDate,
          },
        });

        logger.info(
          `🔔 Tìm thấy ${contracts.length} hợp đồng hết hạn sau ${daysBefore} ngày.`,
        );

        for (const contract of contracts) {
          if (ContractService.isContractPendingLegit(contract)) {
            logger.info(`🔍 Bỏ qua hợp đồng ${contract.id} vì đã gia hạn`);
            continue;
          }
          const tenant = await UserService.getUserById(contract.tenant_id);
          const owner = await UserService.getUserById(contract.owner_id);
          const getRoom = await RoomRepo.findById(contract.room_id);
          if (!getRoom) {
            logger.err(`❌ Không tìm thấy phòng với ID ${contract.room_id}`);
            continue;
          }
          const getHousingArea = await HousingAreaRepo.findOneById(
            getRoom?.housing_area_id?.toString(),
          );

          // Gửi cho tenant
          if (tenant?.email) {
            try {
              await sendContractAboutToExpireMail(
                tenant.email,
                tenant.name ?? "người dùng",
                getRoom?.room_number ?? "không xác định",
                getHousingArea?.name ?? "Không rõ",
                contract.end_date,
              );
            } catch (err) {
              logger.err(`❌ Lỗi gửi mail cho tenant ${tenant.email}:`, err);
            }
          }

          // Gửi cho owner
          if (owner?.email) {
            try {
              await sendContractAboutToExpireToLandlord(
                owner.email,
                owner.name ?? "người dùng",
                getRoom?.room_number ?? "không xác định",
                getHousingArea?.name ?? "Không rõ",
                contract.end_date,
              );
            } catch (err) {
              logger.err(`❌ Lỗi gửi mail cho tenant ${tenant.email}:`, err);
            }
          }
        }
      }
    } catch (error) {
      logger.err("❌ Lỗi khi kiểm tra hợp đồng hết hạn:", error);
    }
  });
};
