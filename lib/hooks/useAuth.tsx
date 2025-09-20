"use client";

import { useState, useEffect } from "react";

const useAuth = (): UserAuthLoginResponse => {
  const [authData, setAuthData] = useState<UserAuthLoginResponse>({
    isAuthenticated: false,
    message: "Loading...",
  });

  useEffect(() => {
    try {
      const usersession = localStorage.getItem("session");
      if (!usersession) {
        setAuthData({
          isAuthenticated: false,
          message: "No session found",
        });
        return;
      }

      const user = JSON.parse(usersession);
      setAuthData(user);
    } catch (error) {
      console.error("Auth error:", error);
      setAuthData({
        isAuthenticated: false,
        message: "Error retrieving session",
      });
    }
  }, []);

  return authData;
};

export default useAuth;
