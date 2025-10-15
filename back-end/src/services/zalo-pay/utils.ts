export function mergeEmbedData(
  embed_data: string | object | undefined,
  redirecturl: string,
): string {
  let embedDataObj: any = {};
  try {
    if (embed_data) {
      embedDataObj =
        typeof embed_data === "string" ? JSON.parse(embed_data) : embed_data;
    }
  } catch {
    embedDataObj = {};
  }
  embedDataObj.redirecturl = embedDataObj.redirecturl ?? redirecturl;
  return JSON.stringify(embedDataObj);
}

export function getAppTransId(orderId: string): string {
  const now = new Date();
  // Convert to Vietnam timezone (GMT+7)
  const vnTime = new Date(
    now.getTime() + 7 * 60 * 60 * 1000 - now.getTimezoneOffset() * 60000,
  );
  const yymmdd = vnTime.toISOString().slice(2, 10).replace(/-/g, "");
  return `${yymmdd}_${orderId}`;
}

export function getVNDateYYMMDD(): string {
  const now = new Date();
  // Convert to Vietnam timezone (GMT+7)
  const vnTime = new Date(
    now.getTime() + 7 * 60 * 60 * 1000 - now.getTimezoneOffset() * 60000,
  );
  return vnTime.toISOString().slice(2, 10).replace(/-/g, "");
}

function getRandom6Digit(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function getMRefundId(appid: number): string {
  const yymmdd = getVNDateYYMMDD();
  const random = getRandom6Digit();
  return `${yymmdd}_${appid}_${random}`;
}
