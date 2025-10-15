import {
  RefundCreateRequest,
  RefundCreateResponse,
} from "@zalopay-oss/zalopay-nodejs";
import { refundAPI } from "../config";

/**
 * Create a refund request to ZaloPay.
 * @param params RefundCreateRequest (except mac, app_id, timestamp will be auto-filled)
 * @returns RefundCreateResponse
 */
export async function createRefundRequest({
  m_refund_id,
  zp_trans_id,
  amount,
  description,
  timestamp = Date.now(),
}: RefundCreateRequest): Promise<RefundCreateResponse> {
  const request: RefundCreateRequest = {
    app_id: Number(process.env.ZALO_PAY_APP_ID),
    m_refund_id,
    zp_trans_id,
    amount,
    timestamp,
    mac: "",
    description,
  };

  return await refundAPI.create(request);
}
