import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Camera, Eye, EyeOff, ArrowLeft, AlertCircle, CheckCircle, User, MapPin, Palette } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const SignupPage = () => {
  const navigate = useNavigate();
  const { signup, loading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'client' as 'client' | 'photographer' | 'cameraman' | 'venue' | 'makeupArtist' | 'decorator' | 'caterer'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);

  const roles = [
    {
      id: 'client',
      title: 'Client',
      description: 'Book photographers, venues, and services for your events',
      icon: <User className="w-6 h-6" />
    },
    {
      id: 'photographer',
      title: 'Photographer',
      description: 'Offer photography services and showcase your portfolio',
      icon: <Camera className="w-6 h-6" />
    },
    {
      id: 'venue',
      title: 'Venue Owner',
      description: 'List your venue and accept bookings from clients',
      icon: <MapPin className="w-6 h-6" />
    },
    {
      id: 'makeupArtist',
      title: 'Makeup Artist',
      description: 'Provide beauty and makeup services for events',
      icon: <Palette className="w-6 h-6" />
    },
    {
      id: 'decorator',
      title: 'Decorator',
      description: 'Offer decoration services for events',
      icon: <Palette className="w-6 h-6" />
    },
    {
      id: 'caterer',
      title: 'Caterer',
      description: 'Provide catering services for events',
      icon: <Palette className="w-6 h-6" />
    }
  ];

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    return strength;
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        if (!formData.role) {
          setError('Please select your role');
          return false;
        }
        break;
      case 2:
        if (!formData.firstName || !formData.lastName) {
          setError('Please fill in all required personal information');
          return false;
        }
        break;
      case 3:
        if (!formData.email || !formData.password || !formData.confirmPassword) {
          setError('Please fill in all account details');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return false;
        }
        if (passwordStrength < 50) {
          setError('Password is too weak. Use at least 8 characters with mixed case, numbers.');
          return false;
        }
        break;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateStep(3)) return;

    try {
      // Map role to backend userType
      let userType: string = formData.role;
      if (userType === 'makeupArtist') userType = 'makeup_artist';
      // Add similar mappings for other roles if needed
      const signupData = {
        name: formData.firstName + ' ' + formData.lastName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        userType, // string type
        phone: formData.phone
      };
      await signup(signupData);
      setSuccess('Account created successfully! Please check your email to verify your account.');
      setTimeout(() => navigate('/verify-email'), 1500);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    // Clear errors when user starts typing
    if (error) setError('');
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setError('');
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setError('');
    setCurrentStep(currentStep - 1);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 25) return 'bg-red-500';
    if (passwordStrength < 50) return 'bg-orange-500';
    if (passwordStrength < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 25) return 'Weak';
    if (passwordStrength < 50) return 'Fair';
    if (passwordStrength < 75) return 'Good';
    return 'Strong';
  };

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

        {/* Signup Card */}
        <div className="card p-8 fade-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center">
                <Camera className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="headline-large mb-2">Create Account</h1>
            <p className="body-medium text-slate-600">
              Join Swornim and start your journey
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    step <= currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {step < currentStep ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    step
                  )}
                </div>
                {step < 3 && (
                  <div
                    className={`w-8 h-1 mx-2 transition-all ${
                      step < currentStep ? 'bg-blue-600' : 'bg-slate-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
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

          <form onSubmit={handleSubmit}>
            {/* Step 1: Role Selection */}
            {currentStep === 1 && (
              <div className="space-y-6 slide-in-right">
                <div>
                  <h2 className="title-large mb-4">Choose Your Role</h2>
                  <div className="grid gap-4">
                    {roles.map((role) => (
                      <label
                        key={role.id}
                        className={`card p-4 cursor-pointer transition-all duration-200 hover:scale-105 ${
                          formData.role === role.id
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-slate-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name="role"
                          value={role.id}
                          checked={formData.role === role.id}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                          className="sr-only"
                        />
                        <div className="flex items-start space-x-3">
                          <div className={`${formData.role === role.id ? 'text-blue-600' : 'text-slate-500'}`}>
                            {role.icon}
                          </div>
                          <div>
                            <div className="title-medium font-medium mb-1">{role.title}</div>
                            <p className="body-small text-slate-600">{role.description}</p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={nextStep}
                  className="btn-primary w-full"
                  disabled={loading}
                >
                  Continue
                </button>
              </div>
            )}

            {/* Step 2: Personal Information */}
            {currentStep === 2 && (
              <div className="space-y-6 slide-in-right">
                <div>
                  <h2 className="title-large mb-4">Personal Information</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="firstName" className="label-large block mb-2">
                          First Name *
                        </label>
                        <input
                          id="firstName"
                          name="firstName"
                          type="text"
                          required
                          value={formData.firstName}
                          onChange={handleChange}
                          className="input-field"
                          placeholder="John"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="label-large block mb-2">
                          Last Name *
                        </label>
                        <input
                          id="lastName"
                          name="lastName"
                          type="text"
                          required
                          value={formData.lastName}
                          onChange={handleChange}
                          className="input-field"
                          placeholder="Doe"
                          disabled={loading}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="label-large block mb-2">
                        Phone Number
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="+977-9800000000"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="btn-secondary flex-1"
                    disabled={loading}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="btn-primary flex-1"
                    disabled={loading}
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Account Details */}
            {currentStep === 3 && (
              <div className="space-y-6 slide-in-right">
                <div>
                  <h2 className="title-large mb-4">Account Details</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="email" className="label-large block mb-2">
                        Email Address *
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="john@example.com"
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label htmlFor="password" className="label-large block mb-2">
                        Password *
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={formData.password}
                          onChange={handleChange}
                          className="input-field pr-12"
                          placeholder="Create a strong password"
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
                      
                      {/* Password Strength Indicator */}
                      {formData.password && (
                        <div className="mt-2">
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-slate-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                                style={{ width: `${passwordStrength}%` }}
                              />
                            </div>
                            <span className="body-small text-slate-600">
                              {getPasswordStrengthText()}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="label-large block mb-2">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="input-field pr-12"
                          placeholder="Confirm your password"
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                          disabled={loading}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="btn-secondary flex-1"
                    disabled={loading}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex-1 flex items-center justify-center"
                  >
                    {loading ? (
                      <div className="loading-spinner w-5 h-5" />
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Sign In Link */}
          <div className="mt-8 text-center">
            <p className="body-medium text-slate-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;