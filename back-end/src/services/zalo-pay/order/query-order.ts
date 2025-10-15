import {
  OrderQueryRequest,
  OrderQueryResponse,
} from "@zalopay-oss/zalopay-nodejs";
import { orderAPI } from "../config";

export async function queryOrderRequest({
  app_trans_id,
}: OrderQueryRequest): Promise<OrderQueryResponse> {
  const request: OrderQueryRequest = {
    app_id: Number(process.env.ZALO_PAY_APP_ID),
    app_trans_id,
    mac: "",
  };

  return await orderAPI.query(request);
}
