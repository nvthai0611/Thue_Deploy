import { IUserDetail } from "@src/models/UserDetail";
import { isNumber, isDate, isString } from "jet-validators";
import { transform } from "jet-validators/utils";

/******************************************************************************
                                Functions
******************************************************************************/

/**
 * Database relational key.
 */
export function isRelationalKey(arg: unknown): arg is number {
  return isNumber(arg) && arg >= -1;
}

/**
 * Convert to date object then check is a validate date.
 */
export const transIsDate = transform(
  (arg) => new Date(arg as string),
  (arg) => isDate(arg),
);

/**
 * Membership activity validator.
 */
export const isMembershipActivity = (
  val: unknown,
): val is IUserDetail["membership_activity"] => {
  if (!Array.isArray(val)) return false;
  return val.every(
    (item) =>
      item &&
      typeof item === "object" &&
      isString(item.membership_id) &&
      transIsDate(item.start_date) &&
      transIsDate(item.end_date),
  );
};

/**
 * Property document validator.
 */
export const isPropertyDocument = (
  val: unknown,
): val is IUserDetail["property_document"] => {
  if (!Array.isArray(val)) return false;
  return val.every(
    (item) =>
      item &&
      typeof item === "object" &&
      isString(item.verified_by) &&
      isString(item.type) &&
      isString(item.value) &&
      isString(item.url) &&
      isString(item.status) &&
      transIsDate(item.uploaded_at) &&
      transIsDate(item.verified_at),
  );
};

/**
 * Identity card validator.
 */
export const isIdentityCard = (
  val: unknown,
): val is IUserDetail["identity_card"] => {
  if (!val || typeof val !== "object") return false;
  const obj = val as any;
  return (
    isString(obj.id_number) &&
    isString(obj.full_name) &&
    isString(obj.gender) &&
    transIsDate(obj.date_of_birth) &&
    isString(obj.nationality) &&
    transIsDate(obj.issue_date) &&
    transIsDate(obj.expiry_date) &&
    isString(obj.place_of_origin) &&
    isString(obj.place_of_residence) &&
    isString(obj.personal_identification_number) &&
    isString(obj.photo_url) &&
    isString(obj.issued_by) &&
    isString(obj.card_type)
  );
};

/**
 * Bank account validator.
 */
export const isBankAccount = (
  val: unknown,
): val is IUserDetail["bank_account"] => {
  if (!val || typeof val !== "object") return false;
  const obj = val as any;
  return (
    isString(obj.bank_name) &&
    isString(obj.account_number) &&
    isString(obj.status) &&
    transIsDate(obj.verified_at)
  );
};

/**
 * Identity card validator for partial updates.
 */
export const isPartialIdentityCard = (
  val: unknown,
): val is Partial<IUserDetail["identity_card"]> => {
  if (!val || typeof val !== "object") return false;
  const obj = val as any;

  // Check only provided fields are valid
  return Object.keys(obj).every((key) => {
    switch (key) {
    case "id_number":
    case "full_name":
    case "gender":
    case "nationality":
    case "place_of_origin":
    case "place_of_residence":
    case "personal_identification_number":
    case "photo_url":
    case "issued_by":
    case "card_type":
      return isString(obj[key]);
    case "date_of_birth":
    case "issue_date":
    case "expiry_date":
      return transIsDate(obj[key]);
    default:
      return false;
    }
  });
};

/**
 * Bank account validator for partial updates.
 */
export const isPartialBankAccount = (
  val: unknown,
): val is Partial<IUserDetail["bank_account"]> => {
  if (!val || typeof val !== "object") return false;
  const obj = val as any;

  // Check only provided fields are valid
  return Object.keys(obj).every((key) => {
    switch (key) {
    case "bank_name":
    case "account_number":
    case "status":
      return isString(obj[key]);
    case "verified_at":
      return transIsDate(obj[key]);
    default:
      return false;
    }
  });
};

export const isPartialPropertyDocument = (
  val: unknown,
): val is Partial<IUserDetail["property_document"]> => {
  if (!val || typeof val !== "object") return false;
  const obj = val as any;

  // Check only provided fields are valid
  return Object.keys(obj).every((key) => {
    switch (key) {
    case "verified_by":
    case "type":
    case "description":
    case "reason":
    case "status":
      return isString(obj[key]);
    case "image":
      return (
        Array.isArray(obj[key]) &&
          obj[key].every(
            (img: any) => img && isString(img.url) && isString(img.type),
          )
      );
    case "uploaded_at":
    case "verified_at":
      return transIsDate(obj[key]);
    default:
      return false;
    }
  });
};
