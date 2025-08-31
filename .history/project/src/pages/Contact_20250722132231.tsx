import React from 'react';

const Contact = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200">
    <div className="backdrop-blur-md bg-white/30 rounded-xl shadow-lg p-8 max-w-xl w-full text-center">
      <h1 className="text-3xl font-bold mb-4 text-blue-700">Contact Us</h1>
      <p className="text-gray-700 mb-2">Have questions or need support? Reach out to us!</p>
      <div className="mt-4 space-y-2">
        <div>Email: <a href="mailto:support@eventbooker.com" className="text-blue-600 underline">support@eventbooker.com</a></div>
        <div>Phone: <span className="text-blue-600">+1 234 567 8901</span></div>
        <div>Address: 123 Event Lane, City, Country</div>
      </div>
    </div>
  </div>
);

export default Contact; 