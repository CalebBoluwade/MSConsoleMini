// "use client";

import { useLayoutEffect, useState, cache } from "react";
import { decrypt } from "../helpers/auth/sessions";

const useAuth = () => {
  const [loggedInUser, setLoggedInUser] = useState<{
    data: JWTAuthPayload | null;
    isAuth: boolean;
  }>({ data: null, isAuth: false });

  useLayoutEffect(() => {
    const GetUserSessionData = cache(async () => {
      const usersession = localStorage.getItem("session")?.replaceAll('"', "");

      const user = await decrypt(usersession!);

      if (!user) {
        return setLoggedInUser({ data: null, isAuth: false });
      }

      if (user) {
        console.log("decrypted session data >>> ", user);
     
        return setLoggedInUser({ data: user, isAuth: true });
      }
    });

    GetUserSessionData();

    return () => {};
  }, []);

  return loggedInUser;
  // return GetUserData;
};



export default useAuth;
