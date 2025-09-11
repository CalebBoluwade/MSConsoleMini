"use client";

import Image from "next/image";
import React from "react";

const NoRights = ({
  allowedRoles,
  userRoles,
}: {
  allowedRoles: Roles[];
  userRoles: string[];
}) => {
  return (
  


      <div className="text-2xl text-gray-600 text-center place-items-center justify-center h-screen bg-opacity-70 backdrop-blur-md">
        <Image
          aria-hidden
          src="/unauthorized.svg"
          width={300}
          height={300}
          alt=""
          className="mx-auto"
          priority
        />

        <p className="mb-2">
          I&#39;m sorry to be the one to gate keep, but you&#39;re unauthorized
          To view this page.
        </p>

        <p>
          Allowed Role For This View [
          {(allowedRoles ?? []).map((role) => `${role} `)}]
        </p>

        <p>
          Provisioned Roles [
          {(userRoles ?? []).map((role, index) =>
            index % 1 ? ` | ${role} ` : ` ${role} `
          )}
          ]
        </p>

        <div className="mt-7 inline-flex items-center gap-5">
          <span className="text-center cursor-pointer">
            Engage Application Admin For Support
          </span>

        </div>
      </div>

  );
};

export default NoRights;
