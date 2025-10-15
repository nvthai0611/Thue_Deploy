/******************************************************************************
                                 Constants
******************************************************************************/

import { TransactionType } from "@src/common/constants";

/******************************************************************************
                                  Types
******************************************************************************/

interface IRefund {
  m_refund_id: string;
  zp_refund_id?: number;
  refund_amount: number;
  refund_fee_amount?: number;
  refund_description?: string;
  refund_status?: string;
  refund_return_code?: number;
  refund_return_message?: string;
  refund_sub_return_code?: number;
  refund_sub_return_message?: string;
}
interface IZaloPayment {
  app_id: number;
  app_trans_id: string;
  app_time: number;
  app_user: string;
  amount: number;
  embed_data?: any;
  item?: any;
  zp_trans_id?: number;
  server_time?: number;
  channel?: number;
  merchant_user_id?: string;
  user_fee_amount?: number;
  discount_amount?: number;
  status?: number;
  callback_received?: boolean;
  error_message?: string;
  refunds?: IRefund;
}
export interface ITransaction {
  user_id: string;
  contract_id?: string;
  housing_area_id?: string;
  room_id?: string;
  type: TransactionType;
  notes?: string;
  zalo_payment?: IZaloPayment;
}

export interface ICreateTransactionReq {
  user_id: string;
  contract_id?: string;
  housing_area_id?: string;
  room_id?: string;
  type: TransactionType;
  notes?: string;
  zalo_payment?: IZaloPayment;
  refunds?: IRefund;
}
/******************************************************************************
                                  Setup
******************************************************************************/

/******************************************************************************
                                 Functions
******************************************************************************/
export function testAddTransactionReq(
  arg: unknown,
): arg is ICreateTransactionReq {
  if (typeof arg !== "object" || arg === null) return false;
  const data = arg as ICreateTransactionReq;
  const isValidType =
    typeof data.type === "string" &&
    Object.values(TransactionType).includes(data.type);

  // contract_id: required nếu type === 'deposit'
  const isValidContractId =
    data.type !== TransactionType.deposit ||
    (typeof data.contract_id === "string" && data.contract_id.length > 0);
  const isValidHousingAreaId =
    data.type !== TransactionType.service ||
    (typeof data.housing_area_id === "string" &&
      data.housing_area_id.length > 0);
  const isValidRoomId =
    data.type !== TransactionType.boosting_ads ||
    (typeof data.room_id === "string" && data.room_id.length > 0);
  // zalo_payment: required nếu type === 'service'
  const isValidZaloPayment =
    data.type !== "service" ||
    (typeof data.zalo_payment === "object" &&
      data.zalo_payment !== null &&
      typeof data.zalo_payment.app_id === "number" &&
      typeof data.zalo_payment.app_trans_id === "string" &&
      typeof data.zalo_payment.app_time === "number" &&
      typeof data.zalo_payment.app_user === "string" &&
      typeof data.zalo_payment.amount === "number");

  const isValidRefunds =
    data.type !== TransactionType.deposit ||
    (typeof data.refunds === "object" &&
      data.refunds !== null &&
      typeof data.refunds.m_refund_id === "string" &&
      typeof data.refunds.refund_amount === "number");

  const isValidNotes =
    data.notes === undefined || typeof data.notes === "string";

  return (
    isValidType &&
    isValidContractId &&
    isValidZaloPayment &&
    isValidRefunds &&
    isValidNotes &&
    isValidHousingAreaId &&
    isValidRoomId
  );
}

/******************************************************************************
                                Export default
******************************************************************************/

export default {
  testAddTransactionReq,
} as const;
