import {
  Config,
  OrderAPI,
  RefundAPI,
  TokenizationAPI,
  ZaloPayClient,
} from "@zalopay-oss/zalopay-nodejs";

const config: Config = {
  appId: process.env.ZALO_PAY_APP_ID!,
  key1: process.env.ZALO_PAY_KEY1!,
  key2: process.env.ZALO_PAY_KEY2!,
  callbackUrl: process.env.ZALO_PAY_CALLBACK_URL!,
  env: "sandbox",
};

// Initialize the ZaloPay client object with merchant information
const client = new ZaloPayClient(config);

// Initialize the API object
const tokenizationAPI: TokenizationAPI = new TokenizationAPI(client);

// Initialize the Order API object
const orderAPI: OrderAPI = new OrderAPI(client);

// Initialize the Refund API object
const refundAPI: RefundAPI = new RefundAPI(client);

export { client, tokenizationAPI, orderAPI, refundAPI };
