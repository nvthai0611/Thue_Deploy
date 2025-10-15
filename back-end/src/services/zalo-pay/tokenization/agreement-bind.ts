import {
  AgreementBindRequest,
  AgreementBindResponse,
} from "@zalopay-oss/zalopay-nodejs";
import { tokenizationAPI } from "../config";

export async function agreementBindRequest({
  app_trans_id,
  identifier,
  max_amount,
  binding_data,
}: AgreementBindRequest): Promise<AgreementBindResponse> {
  const now = Date.now();
  const request: AgreementBindRequest = {
    app_id: Number(process.env.ZALO_PAY_APP_ID),
    app_trans_id,
    binding_type: AgreementBindRequest.BindingTypeEnum.Wallet,
    identifier,
    mac: "",
    max_amount,
    redirect_deep_link: "",
    redirect_url: process.env.ZALO_PAY_REDIRECT_URL!,
    req_date: now,
    binding_data: binding_data ?? "",
  };

  return await tokenizationAPI.bind(request);
}
