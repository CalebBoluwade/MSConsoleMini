import { PageNameEnum } from "../config/site-map";
import authConfig from "../../config/auth-access.json";

export type AuthAccess = Record<PageNameEnum, Array<Roles>>;

export const AuthAccess: AuthAccess = authConfig as AuthAccess;
