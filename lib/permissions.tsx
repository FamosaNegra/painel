export const permissions: Record<string, string[]> = {
  OBRAS: ["admin", "cac analyst"],
  ADMIN: ["admin"],
  USERS: ["admin", "marketing", "cac", "cac analyst"],
  VIDEO: ["admin", "marketing"],

};

export type PermissionKey = keyof typeof permissions;
