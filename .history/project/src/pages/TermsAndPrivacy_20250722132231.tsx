import React from 'react';

const TermsAndPrivacy = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200">
    <div className="backdrop-blur-md bg-white/30 rounded-xl shadow-lg p-8 max-w-xl w-full text-left">
      <h1 className="text-3xl font-bold mb-4 text-blue-700">Terms & Privacy</h1>
      <h2 className="text-xl font-semibold mt-4 mb-2">Terms of Service</h2>
      <p className="text-gray-700 mb-4">By using our platform, you agree to our terms of service. We strive to provide accurate information and a secure booking experience.</p>
      <h2 className="text-xl font-semibold mt-4 mb-2">Privacy Policy</h2>
      <p className="text-gray-700">We respect your privacy. Your data is stored securely and never shared with third parties except as required to provide our services or by law.</p>
    </div>
  </div>
);

export default TermsAndPrivacy; 