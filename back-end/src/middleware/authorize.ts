import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import { Actions, defineAbilityFor, Subjects } from "@src/common/util/ability";
import { getUserIdFromRequest } from "@src/common/util/authorization";
import { sendError } from "@src/common/util/response";
import { supabase } from "@src/common/util/supabase";
import { IReq, IRes } from "@src/routes/common/types";
import { NextFunction } from "express";

export function authorize(action: Actions, subject: Subjects) {
  return async (req: IReq, res: IRes, next: NextFunction): Promise<void> => {
    const userId = getUserIdFromRequest(req);
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("auth_user_id", userId)
      .single();

    if (error || !data) {
      sendError(res, "Unauthorized", HttpStatusCodes.UNAUTHORIZED);
      return;
    }

    if (!userId) {
      sendError(res, "Unauthorized", HttpStatusCodes.UNAUTHORIZED);
      return;
    }

    const role = data.role;
    const ability = defineAbilityFor(role);

    if (ability.can(action, subject)) {
      return next();
    }

    sendError(res, "Forbidden", HttpStatusCodes.FORBIDDEN, {
      action,
      subject,
    });
  };
}
