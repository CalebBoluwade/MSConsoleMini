import Link from "next/link";
import React, { useState } from "react";

const WelcomeBanner = () => (
  <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-8">
    <h2 className="text-2xl font-bold text-white mb-2">
      Welcome to the Monitoring Console
    </h2>
    <p className="text-gray-300">
      Explore your services, set up new monitors, and analyze performance all in
      one place.
    </p>
  </div>
);

const RecentlyVisitedSection = () => (
  <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
    <h3 className="text-xl font-bold text-white mb-4">Recently visited</h3>
    <ul className="space-y-3">
      {[{ name: "", icon: "" }].map((item) => (
        <li key={item.name}>
          <Link
            href="#"
            className="flex items-center text-blue-400 hover:text-blue-300 hover:underline"
          >
            {item.icon}
            <span>{item.name}</span>
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

const Console = () => {
  const [isSidebarCollapsed] = useState(false);
  return (
    <main
      className={`pt-[61px] p-8 transition-all duration-300 ${
        isSidebarCollapsed ? "pl-16" : "pl-64"
      }`}
    >
      <WelcomeBanner />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold text-white mb-4">
            Explore Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* {services.map((service) => (
              <ServiceCard key={service.name} service={service} />
            ))} */}
          </div>
        </div>

        <div className="space-y-8">
          <RecentlyVisitedSection />
        </div>
      </div>
    </main>
  );
};

export default Console;
