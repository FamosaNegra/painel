export const permissions: Record<string, string[]> = {
  OBRAS: ["admin", "cac analyst"],
  ADMIN: ["admin"],
  USERS: ["admin", "marketing", "cac", "cac analyst"],
  VIDEO: ["admin", "video"],

};

export type PermissionKey = keyof typeof permissions;
