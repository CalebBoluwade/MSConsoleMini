"use client";

import Image from "next/image";
import React from "react";
import { motion } from "framer-motion";

const Header = ({
  title,
  subTitle,
  subTitle2,
  icon,
  ctaButton,
  image,
}: {
  title: string;
  subTitle: string;
  subTitle2: string;
  icon?: React.JSX.Element;
  ctaButton?: React.JSX.Element;
  image?: string;
}) => {
  return (
    <motion.header className="relative my-4 rounded-lg flex justify-between lg:flex-row gap-4 lg:gap-8 bg-slate-100 dark:bg-black">
      <div className="relative flex-1 --max-w-screen-xl px-4 py-12 sm:px-6 sm:py-12 lg:px-8">
        <div className="sm:flex sm:items-center gap-4">
          {icon}
          <div className="text-center sm:text-left">
            <motion.h1 className="inline-flex gap-2 text-2xl font-bold sm:text-3xl">
              {title}
            </motion.h1>

            {subTitle && (
              <div className="mt-1.5 text-center text-lg font-bold text-[#06509CED] sm:text-3xl">
                {subTitle}
                {subTitle2 && ". " + subTitle2}
              </div>
            )}

            {ctaButton && <div className="absolute bottom-3">{ctaButton}</div>}
          </div>
        </div>
      </div>

      {image && (
        <Image
          aria-hidden
          src={`/${image}.svg`}
          alt=""
          // className="absolute inset-x-3/4 object-cover w-96 h-96"
          width={225}
          height={225}
          priority
        />
      )}
    </motion.header>
  );
};

export default Header;
