"use client";

import React, { useEffect, useState } from "react";
import { Orbitron } from "next/font/google";

const orbitron = Orbitron({ subsets: ["latin"] });

const addZero = (num: number) => (num < 10 ? `0${num}` : num);

const useTimer = () => {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      const h = addZero(d.getHours());
      const m = addZero(d.getMinutes());
      const s = addZero(d.getSeconds());
      setTime(`${h}:${m}:${s}`);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <time dateTime={time} className={`font-bold font-mono ${orbitron.className}`}>
      {time}
    </time>
  );
};

export default useTimer;
