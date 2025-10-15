import {
  AbilityBuilder,
  createMongoAbility,
  MongoAbility,
} from "@casl/ability";

export type Actions =
  | "manage"
  | "create"
  | "read"
  | "update"
  | "delete"
  | "approve"
  | "reject"
  | "publish"
  | "unpublish"
  | "deleteAdmin";

export type Subjects = "HousingArea" | "User" | "Room" | "Contract" | "all";

export type AppAbility = MongoAbility<[Actions, Subjects]>;

export const defineAbilityFor = (role: string) => {
  const { can, rules } = new AbilityBuilder<AppAbility>(createMongoAbility);

  if (role === "admin") {
    can("manage", "all");
  } else if (role === "landlord") {
    can("create", "HousingArea");
    can("update", "HousingArea");
    can("delete", "HousingArea");
    can("update", "Room");
    can("delete", "Room");
    can("create", "Room");
    can("update", "Contract");
  } else if (role === "user") {
    can("read", "HousingArea");
  }

  return createMongoAbility(rules);
};
