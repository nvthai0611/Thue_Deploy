import jwt from "jsonwebtoken";
import logger from "jet-logger";

interface RequestWithHeaders {
  headers: {
    authorization?: string,
  };
}

export function getUserIdFromRequest(req: RequestWithHeaders): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.split(" ")[1];
  if (!token) return null;
  try {
    const payload = jwt.verify(token, process.env.SUPABASE_JWT_SECRET!) as any;
    return payload.sub ?? null;
  } catch (err) {
    logger.err("Error verifying HS256 JWT token:", err);
    return null;
  }
}
