import {
  isBankAccount,
  isIdentityCard,
  isMembershipActivity,
  isPartialBankAccount,
  isPartialIdentityCard,
  isPartialPropertyDocument,
  isPropertyDocument,
} from "@src/common/util/validators";
import { isBoolean, isString } from "jet-validators";
import { parseObject, TParseOnError } from "jet-validators/utils";

/******************************************************************************
                                 Constants
******************************************************************************/

const DEFAULT_USER_DETAIL_VALS = (): IUserDetail => ({
  user_id: "",
  identity_card: {
    id_number: "",
    full_name: "",
    gender: "",
    date_of_birth: new Date(),
    nationality: "",
    issue_date: new Date(),
    expiry_date: new Date(),
    place_of_origin: "",
    place_of_residence: "",
    personal_identification_number: "",
    photo_url: "",
    issued_by: "",
    card_type: "",
  },
  membership_activity: [],
  property_document: {
    verified_by: "",
    type: "",
    description: "",
    image: [],
    reason: "",
    status: "",
    uploaded_at: new Date(),
    verified_at: new Date(),
  },
  bank_account: {
    bank_name: "",
    account_number: "",
    status: "",
    verified_at: new Date(),
  },
  post_count: 0,
  post_limit: 0,
  status: "",
  saved_rooms: [],
  verified: false,
  hasPostedBefore: false,
});
/******************************************************************************
                                  Types
******************************************************************************/

export interface IUserDetail {
  user_id: string;
  avatar_url?: string; // Optional field for user avatar URL
  identity_card: {
    id_number: string,
    full_name: string,
    gender: string,
    date_of_birth: Date,
    nationality: string,
    issue_date: Date,
    expiry_date: Date,
    place_of_origin: string,
    place_of_residence: string,
    personal_identification_number: string,
    photo_url: string,
    issued_by: string,
    card_type: string,
  };
  membership_activity: {
    membership_id: string,
    start_date: Date,
    end_date: Date,
  }[];
  property_document?: {
    verified_by: string,
    type: string,
    description: string,
    image: {
      url: string,
      type: string,
    }[],
    reason?: string,
    status: string,
    uploaded_at: Date,
    verified_at: Date,
  };
  bank_account: {
    bank_name: string,
    account_number: string,
    status: string,
    verified_at: Date,
  };
  post_count: number;
  post_limit: number;
  status: string;
  chat_with?: string[];
  saved_rooms: string[];
  verified: boolean;
  hasPostedBefore: boolean;
}

export type IUserDetailCreate = Pick<IUserDetail, "status" | "verified">;

export interface IUserDetailUpdate {
  user_id?: string;
  avatar_url?: string;
  identity_card?: Partial<{
    id_number: string,
    full_name: string,
    gender: string,
    date_of_birth: Date,
    nationality: string,
    issue_date: Date,
    expiry_date: Date,
    place_of_origin: string,
    place_of_residence: string,
    personal_identification_number: string,
    photo_url: string,
    issued_by: string,
    card_type: string,
  }>;
  bank_account?: Partial<{
    bank_name: string,
    account_number: string,
    status: string,
    verified_at: Date,
  }>;
  property_document?: Partial<{
    verified_by: string,
    type: string,
    description: string,
    image: {
      url: string,
      type: string,
    }[],
    reason: string,
    status: string,
    uploaded_at: Date,
    verified_at: Date,
  }>;
  status?: string;
  verified?: boolean;
  hasPostedBefore?: boolean;
}

/******************************************************************************
                                  Setup
******************************************************************************/

// Initialize the "parseUserDetail" function
const parseUserDetail = parseObject<IUserDetail>({
  user_id: isString,
  avatar_url: (val: unknown) => val === undefined || isString(val),
  identity_card: isIdentityCard,
  membership_activity: isMembershipActivity,
  property_document: isPropertyDocument,
  bank_account: isBankAccount,
  status: isString,
  chat_with: (val: unknown) => Array.isArray(val) && val.every(isString),
  saved_rooms: (val: unknown) => Array.isArray(val) && val.every(isString),
  verified: isBoolean,
  hasPostedBefore: (val: unknown) => isBoolean(val),
  post_count: (val: unknown) => typeof val === "number",
  post_limit: (val: unknown) => typeof val === "number",
}); // Initialize the "parseUserDetailCreate" function
const parseUserDetailCreate = parseObject<IUserDetailCreate>({
  status: isString,
  verified: isBoolean,
});

// Initialize the "parseUserDetailUpdate" function
const parseUserDetailUpdate = parseObject<IUserDetailUpdate>({
  user_id: (val: unknown) => val === undefined || isString(val),
  avatar_url: (val: unknown) => val === undefined || isString(val),
  identity_card: (val: unknown) =>
    val === undefined || isPartialIdentityCard(val),
  bank_account: (val: unknown) =>
    val === undefined || isPartialBankAccount(val),
  property_document: (val: unknown) =>
    val === undefined || isPartialPropertyDocument(val),
  status: (val: unknown) => val === undefined || isString(val),
  verified: (val: unknown) => val === undefined || isBoolean(val),
  hasPostedBefore: (val: unknown) => val === undefined || isBoolean(val),
}); /******************************************************************************
                                 Functions
******************************************************************************/

/**
 * New user detail object.
 */
function newUserDetail(userDetail?: Partial<IUserDetail>): IUserDetail {
  const retVal = { ...DEFAULT_USER_DETAIL_VALS(), ...userDetail };
  return parseUserDetail(retVal, (errors) => {
    throw new Error(
      "Setup new user detail failed " + JSON.stringify(errors, null, 2),
    );
  });
}

/**
 * Check is a user detail object. For the route validation.
 */
function testUserDetail(
  arg: unknown,
  errCb?: TParseOnError,
): arg is IUserDetail {
  return !!parseUserDetail(arg, errCb);
}

/**
 * Check is a user detail create request object. For the route validation.
 */
function testUserDetailCreate(
  arg: unknown,
  errCb?: TParseOnError,
): arg is IUserDetailCreate {
  return !!parseUserDetailCreate(arg, errCb);
}

/**
 * Check is a user detail update request object. For the route validation.
 */
function testUserDetailUpdate(
  arg: unknown,
  errCb?: TParseOnError,
): arg is IUserDetailUpdate {
  return !!parseUserDetailUpdate(arg, errCb);
}

/******************************************************************************
                                Export default
******************************************************************************/

export default {
  new: newUserDetail,
  test: testUserDetail,
  testUserDetailCreate: testUserDetailCreate,
  testUserDetailUpdate: testUserDetailUpdate,
} as const;
