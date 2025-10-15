import { TransactionType } from "@src/common/constants";
import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import { sendError, sendSuccess } from "@src/common/util/response";
import ContractRepo from "@src/repos/ContractRepo";
import RoomRepo from "@src/repos/RoomRepo";
import ContractService from "@src/services/ContractService";
import HousingAreaService from "@src/services/HousingAreaService";
import TransactionService from "@src/services/TransactionService";
import { createOrderRequest } from "@src/services/zalo-pay/order/create-order";
import { queryOrderRequest } from "@src/services/zalo-pay/order/query-order";
import { createRefundRequest } from "@src/services/zalo-pay/refund/create-refund";
import { queryRefundRequest } from "@src/services/zalo-pay/refund/query-refund";
import { agreementBindRequest } from "@src/services/zalo-pay/tokenization/agreement-bind";
import {
  AgreementBindRequest,
  OrderCreateRequest,
  OrderQueryRequest,
  RefundCreateRequest,
  RefundQueryRequest,
} from "@zalopay-oss/zalopay-nodejs";
import logger from "jet-logger";
import { IReq, IRes } from "./common/types";
import RoomService from "@src/services/RoomService";
/******************************************************************************
                                Constants
******************************************************************************/

/******************************************************************************
                                Functions
******************************************************************************/

/**
 * @swagger
 * /api/zalopay/agreement-bind:
 *   post:
 *     summary: Create ZaloPay agreement bind
 *     tags: [ZaloPay]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [app_trans_id, identifier, max_amount, binding_data]
 *             properties:
 *               app_trans_id:
 *                 type: string
 *               identifier:
 *                 type: string
 *               max_amount:
 *                 type: number
 *               binding_data:
 *                 type: string
 *     responses:
 *       201:
 *         description: Agreement bind successful
 *       400:
 *         description: Agreement bind failed
 */
async function agreementBind(req: IReq, res: IRes): Promise<any> {
  const { app_trans_id, identifier, max_amount, binding_data } =
    req.body as any as AgreementBindRequest;

  try {
    const response = await agreementBindRequest({
      app_trans_id,
      identifier,
      max_amount,
      binding_data,
      req_date: Date.now(),
    });
    sendSuccess(
      res,
      "Agreement bind request successful",
      response,
      HttpStatusCodes.CREATED,
    );
  } catch (error) {
    logger.err(error);
    sendError(
      res,
      "Agreement bind request failed",
      HttpStatusCodes.BAD_REQUEST,
      error,
    );
  }
}

/******************************************************************************
                                 ORDER
******************************************************************************/

/**
 * @swagger
 * /api/zalopay/create-order:
 *   post:
 *     summary: Create ZaloPay order
 *     tags: [ZaloPay]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [app_trans_id, app_user, amount, embed_data, item, description]
 *             properties:
 *               app_trans_id:
 *                 type: string
 *               app_user:
 *                 type: string
 *               amount:
 *                 type: number
 *               embed_data:
 *                 type: string
 *               item:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Create order successful
 *       400:
 *         description: Create order failed
 */
async function createOrder(req: IReq, res: IRes): Promise<any> {
  const { app_trans_id, app_user, amount, embed_data, item, description } =
    req.body as unknown as OrderCreateRequest;

  try {
    const response = await createOrderRequest({
      app_trans_id,
      app_user,
      amount,
      embed_data,
      item,
      description,
      app_time: Date.now(),
    });
    sendSuccess(
      res,
      "Create order request successful",
      response,
      HttpStatusCodes.CREATED,
    );
  } catch (error) {
    logger.err(error);
    sendError(
      res,
      "Create order request failed",
      HttpStatusCodes.BAD_REQUEST,
      error,
    );
  }
}

/**
 * @swagger
 * /api/zalopay/query-order:
 *   post:
 *     summary: Query ZaloPay order status
 *     tags: [ZaloPay]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [app_trans_id]
 *             properties:
 *               app_trans_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Query order successful
 *       400:
 *         description: Query order failed
 */
async function queryOrder(req: IReq, res: IRes): Promise<any> {
  const { app_trans_id } = req.body as unknown as OrderQueryRequest;

  try {
    const response = await queryOrderRequest({ app_trans_id });
    sendSuccess(
      res,
      "Query order request successful",
      response,
      HttpStatusCodes.OK,
    );
  } catch (error) {
    logger.err(error);
    sendError(
      res,
      "Query order request failed",
      HttpStatusCodes.BAD_REQUEST,
      error,
    );
  }
}

interface ServiceTransactionParams {
  housing_area_id: string;
  user_id: string;
  type: TransactionType;
  app_id: number;
  app_trans_id: string;
  zp_trans_id: number;
  app_time: number;
  app_user: string;
  amount: number;
  channel: number;
  res: IRes;
}

async function handleServiceTransaction({
  housing_area_id,
  user_id,
  type,
  app_id,
  app_trans_id,
  zp_trans_id,
  app_time,
  app_user,
  amount,
  channel,
  res,
}: ServiceTransactionParams) {
  if (!housing_area_id || !user_id) {
    logger.err("Missing housing_area_id or user_id in embed_data");
    return res.json({
      return_code: -1,
      return_message: "Missing housing_area_id or user_id",
    });
  }

  try {
    await HousingAreaService.markHousingAreaAsPaid(housing_area_id);

    await TransactionService.addTransaction({
      user_id,
      housing_area_id,
      type,
      zalo_payment: {
        app_id,
        app_trans_id,
        zp_trans_id,
        app_time,
        app_user,
        amount,
        channel,
        status: 1,
        callback_received: true,
      },
      notes: `ZaloPay transaction for ${type} of housingArea ${housing_area_id}`,
    });

    logger.info(
      `HousingArea ${housing_area_id} marked as paid & transaction saved`,
    );

    return res.json({
      return_code: 1,
      return_message: "success",
    });
  } catch (error) {
    logger.err("Failed to process post_housing:", error);
    return res.json({
      return_code: 0,
      return_message: "Failed to process post_housing",
    });
  }
}

interface DepositTransactionParams {
  contract_id: string;
  user_id: string;
  type: TransactionType;
  app_id: number;
  app_trans_id: string;
  zp_trans_id: number;
  app_time: number;
  app_user: string;
  amount: number;
  channel: number;
  res: IRes;
}

async function handleDepositTransaction({
  contract_id,
  user_id,
  type,
  app_id,
  app_trans_id,
  zp_trans_id,
  app_time,
  app_user,
  amount,
  channel,
  res,
}: DepositTransactionParams) {
  const contract = await ContractRepo.findContractById(contract_id);
  const roomId = contract?.room_id;
  const room = await RoomRepo.findById(roomId!);
  const roomPrice = room?.price;

  // Check if the amount matches the room price
  if (amount !== roomPrice) {
    sendError(
      res,
      "Amount does not match room price",
      HttpStatusCodes.BAD_REQUEST,
    );
    return;
  }

  // Save the transaction details to the database
  const notes = `ZaloPay transaction for ${type} of contract ${contract_id}`;
  const zalo_payment = {
    app_id,
    app_trans_id,
    zp_trans_id,
    app_time,
    app_user,
    amount,
    channel,
    status: 1,
    callback_received: true,
  };

  await TransactionService.addTransaction({
    user_id,
    contract_id,
    type,
    zalo_payment,
    notes,
  })
    .then(() => {
      // Update deposit status in the contract
      ContractService.updateDepositStatus(contract_id);
    })
    .then(() => {
      res.json({
        return_code: 1,
        return_message: "success",
      });
    })
    .catch((error: unknown) => {
      logger.err(error);
      res.json({
        return_code: 0,
        return_message: "exception",
      });
    });
}
interface BoostingAdsTransactionParams {
  room_id: string;
  user_id: string;
  type: TransactionType;
  app_id: number;
  app_trans_id: string;
  zp_trans_id: number;
  app_time: number;
  app_user: string;
  amount: number;
  channel: number;
  res: IRes;
}
async function handleBoostingAdsTransaction({
  room_id,
  user_id,
  type,
  app_id,
  app_trans_id,
  zp_trans_id,
  app_time,
  app_user,
  amount,
  channel,
  res,
}: BoostingAdsTransactionParams) {
  try {
    await RoomService.boostingRoom(room_id, user_id);
    const notes = `ZaloPay transaction for ${type} of room ${room_id}`;
    const zalo_payment = {
      app_id,
      app_trans_id,
      zp_trans_id,
      app_time,
      app_user,
      amount,
      channel,
      status: 1,
      callback_received: true,
    };
    await TransactionService.addTransaction({
      user_id,
      room_id,
      type,
      zalo_payment,
      notes,
    });
    logger.info(`Room ${room_id} boosted & transaction saved`);
    return res.json({
      return_code: 1,
      return_message: "success",
    });
  } catch (error) {
    logger.err("Failed to process boosting ads transaction:" + error);
    return res.json({
      return_code: 0,
      return_message: "Failed to process post_housing",
    });
  }
}

/**
 * @swagger
 * /api/zalopay/callback:
 *   post:
 *     summary: ZaloPay payment callback
 *     tags: [ZaloPay]
 *     description: Webhook endpoint for ZaloPay payment notifications
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: object
 *     responses:
 *       200:
 *         description: Callback processed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 return_code:
 *                   type: number
 *                 return_message:
 *                   type: string
 */
async function createOrderCallback(req: IReq, res: IRes): Promise<any> {
  logger.info("ZaloPay callback validation passed");
  logger.info(JSON.stringify(req.body, null, 2));

  // Parse req.body.data if it is a string
  let data = req.body.data;
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch (e) {
      logger.err(e);
      return res.json({
        return_code: -1,
        return_message: "Invalid data format",
      });
    }
  }

  const {
    app_id,
    app_trans_id,
    app_time,
    app_user,
    amount,
    embed_data,
    item,
    zp_trans_id,
    server_time,
    channel,
    merchant_user_id,
    user_fee_amount,
    discount_amount,
  } = data ?? ({} as any);

  logger.info("ZaloPay Callback Data:");
  logger.info(`app_id: ${app_id}`);
  logger.info(`app_trans_id: ${app_trans_id}`);
  logger.info(`app_time: ${app_time}`);
  logger.info(`app_user: ${app_user}`);
  logger.info(`amount: ${amount}`);
  logger.info(`embed_data: ${embed_data}`);
  logger.info(`item: ${item}`);
  logger.info(`zp_trans_id: ${zp_trans_id}`);
  logger.info(`server_time: ${server_time}`);
  logger.info(`channel: ${channel}`);
  logger.info(`merchant_user_id: ${merchant_user_id}`);
  logger.info(`user_fee_amount: ${user_fee_amount}`);
  logger.info(`discount_amount: ${discount_amount}`);

  const parsed_embed_data = embed_data ? JSON.parse(embed_data) : {};
  const { type, housing_area_id, contract_id, user_id, room_id } =
    parsed_embed_data;

  if (type === TransactionType.service) {
    return handleServiceTransaction({
      housing_area_id,
      user_id,
      type,
      app_id,
      app_trans_id,
      zp_trans_id,
      app_time,
      app_user,
      amount,
      channel,
      res,
    });
  } else if (type === TransactionType.deposit) {
    return handleDepositTransaction({
      contract_id,
      user_id,
      type,
      app_id,
      app_trans_id,
      zp_trans_id,
      app_time,
      app_user,
      amount,
      channel,
      res,
    });
  } else if (type === TransactionType.boosting_ads) {
    return handleBoostingAdsTransaction({
      room_id: room_id,
      user_id,
      type,
      app_id,
      app_trans_id,
      zp_trans_id,
      app_time,
      app_user,
      amount,
      channel,
      res,
    });
  }
  return res.json({
    return_code: -1,
    return_message: "Unknown transaction type",
  });
}
/******************************************************************************
                                 REFUND
******************************************************************************/
/**
 * @swagger
 * /api/zalopay/create-refund:
 *   post:
 *     summary: Create ZaloPay refund
 *     tags: [ZaloPay]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [m_refund_id, zp_trans_id, amount, description]
 *             properties:
 *               m_refund_id:
 *                 type: string
 *               zp_trans_id:
 *                 type: number
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Create refund successful
 *       400:
 *         description: Create refund failed
 */
async function createRefund(req: IReq, res: IRes): Promise<any> {
  const { m_refund_id, zp_trans_id, amount, description } =
    req.body as unknown as RefundCreateRequest;

  try {
    const response = await createRefundRequest({
      m_refund_id,
      zp_trans_id,
      amount,
      description,
      timestamp: Date.now(),
    });
    sendSuccess(
      res,
      "Create refund request successful",
      response,
      HttpStatusCodes.CREATED,
    );
  } catch (error) {
    logger.err(error);
    sendError(
      res,
      "Create refund request failed",
      HttpStatusCodes.BAD_REQUEST,
      error,
    );
  }
}

/**
 * @swagger
 * /api/zalopay/query-refund:
 *   post:
 *     summary: Query ZaloPay refund status
 *     tags: [ZaloPay]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [m_refund_id]
 *             properties:
 *               m_refund_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Query refund successful
 *       400:
 *         description: Query refund failed
 */
async function queryRefund(req: IReq, res: IRes): Promise<any> {
  const { m_refund_id } = req.body as unknown as RefundQueryRequest;

  try {
    const response = await queryRefundRequest({
      m_refund_id,
      timestamp: Date.now(),
    });

    sendSuccess(
      res,
      "Query refund request successful",
      response,
      HttpStatusCodes.OK,
    );
  } catch (error) {
    logger.err(error);

    sendError(
      res,
      "Query refund request failed",
      HttpStatusCodes.BAD_REQUEST,
      error,
    );
  }
}

export default {
  agreementBind,
  createOrder,
  queryOrder,
  createOrderCallback,
  createRefund,
  queryRefund,
} as const;
