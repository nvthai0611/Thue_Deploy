/******************************************************************************
                              Enums
******************************************************************************/

// NOTE: These need to match the names of your ".env" files
export enum NodeEnvs {
  Dev = "development",
  Test = "test",
  Production = "production",
}

export enum RoleEnum {
  tenant = "tenant",
  admin = "admin",
  landlord = "landlord",
}

export enum HousingAreaStatus {
  pending = "pending",
  approved = "approved",
  rejected = "rejected",
  publish = "published",
  unpublish = "unpublished",
  delete = "deleted",
}

export enum RoomType {
  single = "SINGLE",
  couple = "COUPLE",
}

export enum BoostStatus {
  active = "active",
  inactive = "inactive",
}

export enum TransactionType {
  deposit = "deposit",
  service = "service",
  boosting_ads = "boosting_ads",
  refund = "refund",
}

export enum RoomStatus {
  available = "AVAILABLE",
  hidden = "HIDDEN",
  occupied = "OCCUPIED",
  delete = "DELETED",
}

export enum Sort {
  asc = "asc",
  desc = "desc",
  sortBy = "price",
}

export enum SearchParams {
  minPrice = "minPrice",
  maxPrice = "maxPrice",
  minArea = "minArea",
  maxArea = "maxArea",
  type = "type",
  maxOccupancy = "maxOccupancy",
  status = "status",
  title = "title",
  room_number = "room_number",
  facilities = "facilities",
  page = "page",
  limit = "limit",
  sortBy = "sortBy",
  sortOrder = "sortOrder",
}

export enum Mongo_Field {
  _id = "_id",
  user_id = "user_id",
  userdetails = "userdetails",
  owner = "owner",
  owner_id = "owner_id",
  housing_area = "housing_area",
  housingareas = "housingareas", //name of collection
  housing_area_id = "housing_area_id",
}

export enum rateStatus {
  pending = "pending",
  approved = "approved",
  rejected = "rejected",
}

export enum ContractStatus {
  pending = "pending",
  active = "active",
  terminated = "terminated",
  expired = "expired",
}

export enum DisputeStatus {
  pending = "pending",
  resolved = "resolved",
  rejected = "rejected",
}

export enum DisputeResolution {
  disputer_wins = "disputer_wins",
  rejected = "rejected",
}

// export enum FacilityCode {
//   Bed = 1,
//   Wardrobe = 2,
//   Desk = 3,
//   AirConditioner = 4,
//   ElectricFan = 5,
//   WashingMachine = 6,
//   Fridge = 7,
//   Kitchenette = 8,
//   PrivateBathroom = 9,
//   WaterHeater = 10,
//   Wifi = 11,
//   Window = 12,
//   Mirror = 13,
// }

// export const FacilityNameMap: Record<FacilityCode, string> = {
//   [FacilityCode.Bed]: "Bed",
//   [FacilityCode.Wardrobe]: "Wardrobe",
//   [FacilityCode.Desk]: "Desk",
//   [FacilityCode.AirConditioner]: "Air conditioner",
//   [FacilityCode.ElectricFan]: "Electric fan",
//   [FacilityCode.WashingMachine]: "Washing machine",
//   [FacilityCode.Fridge]: "Fridge",
//   [FacilityCode.Kitchenette]: "Kitchenette",
//   [FacilityCode.PrivateBathroom]: "Private bathroom",
//   [FacilityCode.WaterHeater]: "Water heater",
//   [FacilityCode.Wifi]: "Wifi",
//   [FacilityCode.Window]: "Window",
//   [FacilityCode.Mirror]: "Mirror",
// };
