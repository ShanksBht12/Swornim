import React from 'react';

const AboutUs = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200">
    <div className="backdrop-blur-md bg-white/30 rounded-xl shadow-lg p-8 max-w-xl w-full text-center">
      <h1 className="text-3xl font-bold mb-4 text-blue-700">About Us</h1>
      <p className="text-gray-700 mb-2">
        Welcome to our Event Booking Platform! We connect clients with the best service providers for weddings, parties, and all kinds of events.
      </p>
      <p className="text-gray-600">
        Our mission is to make event planning seamless, transparent, and enjoyable. Whether you need a venue, photographer, caterer, or decorator, we bring everything together in one place.
      </p>
    </div>
  </div>
);

export default AboutUs; 