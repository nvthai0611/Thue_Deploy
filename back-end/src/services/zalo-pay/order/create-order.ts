import {
  OrderCreateRequest,
  OrderCreateResponse,
} from "@zalopay-oss/zalopay-nodejs";
import { orderAPI } from "../config";
import { getAppTransId, mergeEmbedData } from "../utils";
import logger from "jet-logger";

export async function createOrderRequest({
  app_trans_id,
  app_user,
  amount,
  item,
  embed_data,
  description,
}: OrderCreateRequest): Promise<OrderCreateResponse> {
  const now = Date.now();
  app_trans_id = getAppTransId(app_trans_id);
  logger.info(app_trans_id);

  const request: OrderCreateRequest = {
    app_id: Number(process.env.ZALO_PAY_APP_ID),
    app_trans_id,
    app_user,
    amount,
    app_time: now,
    embed_data: mergeEmbedData(embed_data, process.env.ZALO_PAY_REDIRECT_URL!),
    item: item || "[]",
    mac: "",
    description,
    callback_url: `${process.env.ZALO_PAY_CALLBACK_URL}/create-order/callback`,
  };

  return await orderAPI.create(request);
}
