"use client";

import Image from "next/image";
import React from "react";
import { motion } from "framer-motion";

const NoRights = ({
  allowedRoles,
  userRoles,
}: {
  allowedRoles: Roles[];
  userRoles: string[];
}) => {
  return (
    <motion.div className="h-screen flex items-center justify-center">
    <div className="text-2xl text-gray-600 text-center bg-opacity-70 backdrop-blur-md">
      <Image
        aria-hidden
        src="/unauthorized.svg"
        width={300}
        height={300}
        alt=""
        className="mx-auto"
        priority
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />

      <p className="mb-2">
        I&#39;m sorry to be the one to gate keep.
      </p>

       <p className="mb-5">
        you&#39;re not permitted to view this page.
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
    </motion.div>
  );
};

export default NoRights;
