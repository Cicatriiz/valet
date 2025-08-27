export type Role = "admin" | "user";

export function hasRole(userRole: Role | undefined, required: Role): boolean {
  if (!userRole) return false;
  if (userRole === "admin") return true;
  return userRole === required;
}

export function requireRole<T>(userRole: Role | undefined, required: Role, fn: () => T): T {
  if (!hasRole(userRole, required)) {
    throw new Error("Unauthorized");
  }
  return fn();
}

