import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Camera, Eye, EyeOff, ArrowLeft, Mail, Lock } from 'lucide-react';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields.');
      return;
    }
    try {
      await login(formData.email, formData.password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const quickLoginOptions = [
    { email: 'client@swornim.com', password: 'password123', label: 'Client' },
    { email: 'photographer@swornim.com', password: 'password123', label: 'Photographer' },
    { email: 'venue@swornim.com', password: 'password123', label: 'Venue' }
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl flex flex-col lg:flex-row overflow-hidden">
          {/* Left side: Login form */}
          <div className="w-full lg:w-1/2 p-8 sm:p-12 flex flex-col justify-center">
            <button
              onClick={() => navigate('/welcome')}
              className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 mb-6 transition-colors self-start"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium text-sm">Back to Welcome</span>
            </button>

            <div className="w-full max-w-md mx-auto">
              <div className="text-center lg:text-left mb-8">
                <Link to="/welcome" className="inline-flex items-center space-x-2 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-slate-800">Swornim</span>
                </Link>
                <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Welcome Back!</h1>
                <p className="text-slate-600">Sign in to unlock your perfect event.</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field pl-12"
                    placeholder="Email Address"
                    disabled={loading}
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="input-field pl-12 pr-12"
                    placeholder="Password"
                    disabled={loading}
                  />
                   <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center space-x-2 text-slate-600">
                    <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" disabled={loading} />
                    <span>Remember me</span>
                  </label>
                  <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-700">
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full"
                >
                  {loading ? <div className="loading-spinner w-5 h-5" /> : 'Sign In'}
                </button>
              </form>

              <div className="divider text-xs text-slate-500 my-6">OR</div>
              
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-2">Quick Demo Login</p>
                <div className="flex justify-center gap-2">
                  {quickLoginOptions.map(option => (
                    <button
                      key={option.label}
                      onClick={() => setFormData({ email: option.email, password: option.password })}
                      className="text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                      disabled={loading}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-center text-sm text-slate-600 mt-8">
                Don't have an account?{' '}
                <Link to="/signup" className="font-semibold text-blue-600 hover:text-blue-700">
                  Sign up for free
                </Link>
              </p>
            </div>
          </div>

          {/* Right side: Image */}
          <div className="hidden lg:block lg:w-1/2 relative">
            <img 
              src="https://images.unsplash.com/photo-1527529482837-4698179dc6ce?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" 
              alt="Event celebration" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/50 to-purple-900/30"></div>
            <div className="absolute bottom-12 left-12 text-white">
              <h2 className="text-4xl font-bold leading-tight">Your Vision, Our Expertise</h2>
              <p className="text-lg text-blue-100 mt-2 max-w-md">Find the best professionals for your most memorable moments.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;