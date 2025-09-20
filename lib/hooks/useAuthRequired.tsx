"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AuthAccess } from "@/lib/helpers/PageAccess";
import { PageNameEnum } from "@/lib/config/site-map";
import NoRights from "@/components/NoRights";
import useAuth from "./useAuth";

const AuthRequired =
  (pageName: PageNameEnum) =>
  <Props extends object>(
    WrappedComponent: React.ComponentType<Props>
  ): React.FC<Props> => {
    const AuthComponent = (props: Props) => {
      const { isAuthenticated, userData: LoggedInUser, message } = useAuth();
      const router = useRouter();

      const AuthAllowedRoles: Roles[] = useMemo(
        () =>
          AuthAccess[pageName] ?? [
            process.env.NEXT_PUBLIC_USER_GROUP_DEFAULT_ACCESS as Roles,
          ],
        []
      );

      const hasPermission = useMemo(() => {
        if (!isAuthenticated || !LoggedInUser?.groups) return false;
        return AuthAllowedRoles.some((role) =>
          LoggedInUser.groups.includes(role)
        );
      }, [isAuthenticated, LoggedInUser?.groups, AuthAllowedRoles]);

      useEffect(() => {
        if (message !== "Loading..." && !isAuthenticated) {
          const callbackUrl =
            typeof window !== "undefined"
              ? window.location.pathname || "/console"
              : "/console";
          router.push(`/auth?callbackUrl=${callbackUrl}`);
        }
      }, [isAuthenticated, message, router]);

      if (message === "Loading...") {
        return <div>Loading...</div>;
      }

      if (!isAuthenticated) {
        return null;
      }

      if (!hasPermission) {
        return (
          <NoRights
            allowedRoles={AuthAllowedRoles}
            userRoles={LoggedInUser?.groups || []}
          />
        );
      }

      return <WrappedComponent {...props} />;
    };

    return AuthComponent;
  };

export default AuthRequired;
