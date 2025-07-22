import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Camera, Eye, EyeOff, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await login(formData.email, formData.password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear errors when user starts typing
    if (error) setError('');
  };

  const quickLoginOptions = [
    { email: 'client@swornim.com', password: 'password123', label: 'Client Demo', role: 'client' },
    { email: 'photographer@swornim.com', password: 'password123', label: 'Photographer Demo', role: 'photographer' },
    { email: 'venue@swornim.com', password: 'password123', label: 'Venue Demo', role: 'venue' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={() => navigate('/welcome')}
          className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 mb-8 transition-colors fade-in"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="body-medium">Back to Welcome</span>
        </button>

        {/* Login Card */}
        <div className="card p-8 fade-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center">
                <Camera className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="headline-large mb-2">Welcome Back</h1>
            <p className="body-medium text-slate-600">
              Sign in to continue to Swornim
            </p>
          </div>

          {/* Success Alert */}
          {success && (
            <div className="alert alert-success mb-6 flex items-start space-x-3 slide-in-left">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="body-medium">{success}</p>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="alert alert-error mb-6 flex items-start space-x-3 slide-in-left">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="body-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="label-large block mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`input-field ${error && !formData.email ? 'error' : ''}`}
                placeholder="Enter your email"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="label-large block mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`input-field pr-12 ${error && !formData.password ? 'error' : ''}`}
                  placeholder="Enter your password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  disabled={loading}
                />
                <span className="body-small text-slate-600">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="body-small text-blue-600 hover:text-blue-700 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center"
            >
              {loading ? (
                <div className="loading-spinner w-5 h-5" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Quick Login Demo */}
          <div className="mt-8">
            <div className="divider my-6"></div>
            <p className="body-small text-slate-500 text-center mb-4">Quick Demo Login</p>
            <div className="grid gap-2">
              {quickLoginOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setFormData({ email: option.email, password: option.password });
                    setError('');
                    setSuccess('');
                  }}
                  className="btn-text text-left p-2 rounded-lg hover:bg-slate-50 text-xs transition-colors"
                  disabled={loading}
                >
                  <span className="font-medium">{option.label}</span>
                  <span className="text-slate-500 block">{option.email}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="mt-8 text-center">
            <p className="body-medium text-slate-600">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 fade-in">
          <p className="body-small text-slate-500">
            By signing in, you agree to our{' '}
            <Link to="/terms" className="text-blue-600 hover:text-blue-700 transition-colors">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-blue-600 hover:text-blue-700 transition-colors">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;