"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthAccess } from "@/lib/helpers/PageAccess";
import NoRights from "@/components/NoRights";
import useAuth from "./useAuth";

const AuthRequired =
  (pageName: string) =>
  <Props extends object>(
    WrappedComponent: React.ComponentType<Props>
  ): React.FC<Props> => {
    const AuthComponent = (props: Props) => {
      const { data: LoggedInUser, isAuth: sessionStatus } = useAuth();
      const [Unauthorized, setUnauthorized] = useState(false);
      const router = useRouter();

      const key: keyof AuthAccess = pageName;
      const AuthAllowedRoles: Roles[] = useMemo(
        () => AuthAccess[key] ?? ["MS005"],
        [key]
      );
      // console.log("Auth Page Roles", pageName, key, AuthAllowedRoles);

      useEffect(() => {
        // Check if user is authenticated and has the required role
        const userRole: Roles[] = LoggedInUser ? LoggedInUser.Role! : ["MS005"];

        const hasPermission =
          sessionStatus &&
          AuthAllowedRoles.some((role) => LoggedInUser?.Role?.includes(role));
        console.info(LoggedInUser, userRole, AuthAllowedRoles, hasPermission);

        const logOutTime = setTimeout(() => {
          if (!sessionStatus) {
            console.log("User is not logged in and not authorized");

            router.push(
              `/auth?callbackUrl=${
                location.pathname ? location.pathname : "/console"
              }`,
              {
                scroll: true,
              }
            );
          }

          if (sessionStatus && !hasPermission) {
            console.log("User is logged in but not authorized");
            // router.push("/console/unauthorized", { scroll: true });
            setUnauthorized(true);
          }
        }, 1000);

        // Redirect to login page or handle unauthorized access
        return () => clearTimeout(logOutTime);
      }, [LoggedInUser, AuthAllowedRoles, sessionStatus, router]);

      // Render the wrapped component if authorized
      return Unauthorized ? (
        <NoRights
          allowedRoles={AuthAllowedRoles}
          userRoles={LoggedInUser ? LoggedInUser.Role : []}
        />
      ) : (
        <WrappedComponent {...props} />
      );
    };

    return AuthComponent;
  };

export default AuthRequired;
