import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const EmailVerificationPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card p-8 fade-in text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="headline-large mb-2">Verify Your Email</h1>
          <p className="body-medium text-slate-600 mb-6">
            We have sent a verification link to your email address.<br />
            Please check your inbox and click the link to activate your account.
          </p>
          <Link to="/login" className="btn-primary w-full mt-4">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage; 