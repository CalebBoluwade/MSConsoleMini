export type AuthAccess = Record<string, Array<Roles>>;

export const AuthAccess: Record<string, Array<Roles>> = {
  MissionControl: ["MS005", "ADMIN"],
  ConsoleMain: ["MS005", "ADMIN"],
  Live: [],
  Admin: ["ADMIN"],
};
