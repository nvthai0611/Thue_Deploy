import {
  RefundQueryRequest,
  RefundQueryResponse,
} from "@zalopay-oss/zalopay-nodejs";
import { refundAPI } from "../config";

/**
 * Query the status of a refund request from ZaloPay.
 * @param m_refund_id Refund ID (format: yymmdd_appid_xxxxxxxxxx)
 * @returns RefundQueryResponse
 */
export async function queryRefundRequest({
  m_refund_id,
  timestamp = Date.now(),
}: RefundQueryRequest): Promise<RefundQueryResponse> {
  const request: RefundQueryRequest = {
    app_id: Number(process.env.ZALO_PAY_APP_ID),
    m_refund_id,
    timestamp,
    mac: "",
  };

  return await refundAPI.query(request);
}
