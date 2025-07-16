"use client";

import React from "react";
import "ldrs/waveform";
import { Waveform } from "ldrs/react";
import "ldrs/react/Waveform.css";
import Script from "next/script";

const LoadingEventUI = ({ loadingText }: { loadingText?: string }) => {
  return (
    <div className="flex flex-col justify-center items-center">
      <Script
        type="module"
        defer
        src="https://cdn.jsdelivr.net/npm/ldrs/dist/auto/waveform.js"
      />

      <Waveform size="35" stroke="3.5" speed="1" color="green" />

      {loadingText && (
        <p className="text-center font-semibold mt-3">Loading...</p>
      )}
    </div>
  );
};

export default LoadingEventUI;
