import React from "react";

const Divider = ({
  title,
  subTitle,
}: {
  title: string;
  subTitle: string | React.JSX.Element;
}) => {
  return (
    <span className="ml-2 my-10">
      <span className="flex items-center">
        <span className="pr-6 font-semibold text-2xl">{title}</span>
        <span className="h-px flex-1 bg-black dark:bg-gray-400"></span>
      </span>

      <h2 className="font-bold mt-3 mb-6">{subTitle}</h2>
    </span>
  );
};

export default Divider;