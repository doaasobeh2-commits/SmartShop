/** Future permission gates (health data, notifications, wearables). */
export type AppPermission = "notifications" | "healthKit" | "activity";

export type PermissionState = "unknown" | "granted" | "denied";

export type PermissionMap = Record<AppPermission, PermissionState>;

export const defaultPermissions: PermissionMap = {
  notifications: "unknown",
  healthKit: "unknown",
  activity: "unknown",
};
