import * as CryptoJS from "crypto-js";

function calculateHmac(data: string, key: string) {
  return CryptoJS.HmacSHA256(data, key).toString();
}

export default function validateZaloCallback(
  req: { body: { data: unknown, mac: string } },
  res: { status: (code: number) => { json: (body: unknown) => void } },
  next: () => void,
) {
  const key = process.env.ZALO_PAY_KEY2!;
  const data = req.body.data;
  const dataStr = typeof data === "string" ? data : JSON.stringify(data);
  const reqmac = calculateHmac(dataStr, key);
  if (reqmac !== req.body.mac) {
    res.status(400).json({
      error: "Invalid MAC",
    });
    return;
  }

  next();
}
