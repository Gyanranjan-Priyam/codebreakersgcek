"use client";

import EventDetails from "./_components/EventsDetails";


export function Events() {
  return (
    <div className="w-full min-h-screen bg-black py-20">
      <div className="max-w-7xl mx-auto px-4 mb-12">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white text-center mb-4">
          Our Events
        </h2>
        <p className="text-gray-400 text-center text-lg max-w-2xl mx-auto">
          Explore the exciting events we organize throughout the year. From hackathons to workshops, we create opportunities for learning, collaboration, and growth.
        </p>
      </div>
      <div>
         <EventDetails />
      </div>
    </div>
  );
}

