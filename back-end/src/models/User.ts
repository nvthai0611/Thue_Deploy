import { isEnumVal, isString } from "jet-validators";
import { parseObject, TParseOnError } from "jet-validators/utils";

import { RoleEnum } from "@src/common/constants";

/******************************************************************************
                                 Constants
******************************************************************************/

const DEFAULT_USER_VALS = (): IUser => ({
  name: "",
  email: "",
  role: RoleEnum.tenant, // Default role
  phone: "",
});

/******************************************************************************
                                  Types
******************************************************************************/

export interface IUser {
  name: string;
  email: string;
  role: RoleEnum; // e.g., 'user', 'admin'
  phone?: string; // Optional phone number
}

export interface IUserCreate {
  name: string;
  email: string;
  phone: string;
}

/******************************************************************************
                                  Setup
******************************************************************************/

// Initialize the "parseUser" function
const parseUser = parseObject<IUser>({
  name: isString,
  email: isString,
  role: isEnumVal(RoleEnum),
  phone: isString,
});

/******************************************************************************
                                 Functions
******************************************************************************/

/**
 * New user object.
 */
function newUser(user?: Partial<IUser>): IUser {
  const retVal = { ...DEFAULT_USER_VALS(), ...user };
  return parseUser(retVal, (errors) => {
    throw new Error("Setup new user failed " + JSON.stringify(errors, null, 2));
  });
}

/**
 * Check is a user object. For the route validation.
 */
function testUser(arg: unknown, errCb?: TParseOnError): arg is IUser {
  return !!parseUser(arg, errCb);
}

/**
 * Check is a user add request object. For the route validation.
 */
function testUserCreate(arg: unknown): arg is IUserCreate {
  if (typeof arg !== "object" || arg === null) return false;
  const data = arg as IUserCreate;
  return (
    typeof data.name === "string" &&
    typeof data.email === "string" &&
    data.email.includes("@") &&
    typeof data.phone === "string"
  );
}
/******************************************************************************
                                Export default
******************************************************************************/

export default {
  new: newUser,
  test: testUser,
  testUserCreate: testUserCreate,
} as const;
