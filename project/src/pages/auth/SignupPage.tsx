"use client"

import React, { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import {
  Camera,
  Eye,
  EyeOff,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  User,
  MapPin,
  Palette,
  Sparkles,
  Shield,
  Package,
  Calendar,
} from "lucide-react"
import { useAuth } from "../../context/AuthContext"

const SignupPage = () => {
  const navigate = useNavigate()
  const { signup, loading } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    role: "client" as "client" | "photographer" | "cameraman" | "venue" | "makeupArtist" | "decorator" | "caterer" | "eventOrganizer",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [passwordStrength, setPasswordStrength] = useState(0)

  const roles = [
    {
      id: "client",
      title: "Client",
      description: "Book photographers, venues, and services for your events",
      icon: <User className="w-6 h-6" />,
      color: "from-blue-500 to-indigo-600",
    },
    {
      id: "photographer",
      title: "Photographer",
      description: "Offer photography services and showcase your portfolio",
      icon: <Camera className="w-6 h-6" />,
      color: "from-purple-500 to-pink-600",
    },
    {
      id: "venue",
      title: "Venue Owner",
      description: "List your venue and accept bookings from clients",
      icon: <MapPin className="w-6 h-6" />,
      color: "from-emerald-500 to-teal-600",
    },
    {
      id: "makeupArtist",
      title: "Makeup Artist",
      description: "Provide beauty and makeup services for events",
      icon: <Palette className="w-6 h-6" />,
      color: "from-orange-500 to-red-600",
    },
    {
      id: "decorator",
      title: "Decorator",
      description: "Transform venues with creative decor and styling",
      icon: <Sparkles className="w-6 h-6" />,
      color: "from-pink-500 to-purple-600",
    },
    {
      id: "caterer",
      title: "Caterer",
      description: "Offer catering services for events and parties",
      icon: <Package className="w-6 h-6" />,
      color: "from-green-500 to-lime-600",
    },
    {
      id: "eventOrganizer",
      title: "Event Organizer",
      description: "Plan and manage events for clients",
      icon: <Calendar className="w-6 h-6" />,
      color: "from-pink-500 to-orange-600",
    },
  ]

  const userTypeMap = {
    photographer: 'photographer',
    makeupArtist: 'makeup_artist',
    decorator: 'decorator',
    venue: 'venue',
    caterer: 'caterer',
    eventOrganizer: 'event_organizer',
    client: 'client',
    cameraman: 'cameraman',
  };

  const calculatePasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength += 25
    if (/[a-z]/.test(password)) strength += 25
    if (/[A-Z]/.test(password)) strength += 25
    if (/[0-9]/.test(password)) strength += 25
    return strength
  }

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        if (!formData.role) {
          setError("Please select your role")
          return false
        }
        break
      case 2:
        if (!formData.firstName || !formData.lastName) {
          setError("Please fill in all required personal information")
          return false
        }
        break
      case 3:
        if (!formData.email || !formData.password || !formData.confirmPassword) {
          setError("Please fill in all account details")
          return false
        }
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match")
          return false
        }
        if (passwordStrength < 50) {
          setError("Password is too weak. Use at least 8 characters with mixed case, numbers.")
          return false
        }
        break
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!validateStep(3)) return

    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.firstName || !formData.lastName) {
      setError("Please fill in all required fields.")
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    try {
      await signup({
        name: formData.firstName + " " + formData.lastName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        userType: userTypeMap[formData.role], // Map to backend value
        phone: formData.phone,
      })
      setSuccess("Registration successful! Please check your email to verify your account.")
      setTimeout(() => navigate("/verify-email"), 2000)
    } catch (err: any) {
      setError(err.message || "Signup failed. Please try again.")
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })

    if (name === "password") {
      setPasswordStrength(calculatePasswordStrength(value))
    }

    // Clear errors when user starts typing
    if (error) setError("")
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setError("")
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    setError("")
    setCurrentStep(currentStep - 1)
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 25) return "bg-error-500"
    if (passwordStrength < 50) return "bg-warning-500"
    if (passwordStrength < 75) return "bg-warning-400"
    return "bg-success-500"
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength < 25) return "Weak"
    if (passwordStrength < 50) return "Fair"
    if (passwordStrength < 75) return "Good"
    return "Strong"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="container">
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate("/welcome")}
            className="inline-flex items-center gap-2 px-5 py-2 mb-8 font-semibold text-slate-800 bg-gradient-to-r from-blue-100 via-white to-blue-50 rounded-full shadow transition-transform duration-200 hover:scale-105 hover:from-primary-600 hover:to-primary-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-400 animate-fade-in"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back to Welcome
          </button>

          {/* Signup Card */}
          <div className="card p-8 lg:p-12 animate-slide-up">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl flex items-center justify-center shadow-lg">
                  <Camera className="w-10 h-10 text-white" />
                </div>
              </div>
              <h1 className="text-4xl font-bold text-slate-900 mb-4">Create Your Account</h1>
              <p className="text-xl text-slate-600 max-w-md mx-auto">
                Join Swornim and start your journey to extraordinary events
              </p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-12">
              {[1, 2, 3].map((step) => (
                <React.Fragment key={step}>
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                      step <= currentStep ? "bg-primary-600 text-white shadow-md" : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {step < currentStep ? <CheckCircle className="w-5 h-5" /> : step}
                  </div>
                  {step < 3 && (
                    <div
                      className={`w-16 h-2 mx-4 rounded-full transition-all duration-300 ${
                        step < currentStep ? "bg-primary-600" : "bg-slate-200"
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Success Alert */}
            {success && (
              <div className="p-4 bg-success-50 border border-success-200 rounded-xl mb-8 animate-fade-in">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-success-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-success-800 font-medium">{success}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Alert */}
            {error && (
              <div className="p-4 bg-error-50 border border-error-200 rounded-xl mb-8 animate-fade-in">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-error-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-error-800 font-medium">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Step 1: Role Selection */}
              {currentStep === 1 && (
                <div className="space-y-8 animate-slide-up">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Choose Your Role</h2>
                    <div className="grid gap-4">
                      {roles.map((role) => (
                        <label
                          key={role.id}
                          className={`card p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                            formData.role === role.id
                              ? "border-primary-600 bg-primary-50 shadow-md"
                              : "border-slate-200 hover:border-slate-300"
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
                          <div className="flex items-start space-x-4">
                            <div
                              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                formData.role === role.id ? "bg-primary-100" : "bg-slate-100"
                              }`}
                            >
                              <div className={`${formData.role === role.id ? "text-primary-600" : "text-slate-500"}`}>
                                {role.icon}
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="text-lg font-semibold text-slate-900 mb-2">{role.title}</div>
                              <p className="text-slate-600 leading-relaxed">{role.description}</p>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                  <button type="button" onClick={nextStep} className="btn-primary w-full" disabled={loading}>
                    Continue to Personal Info
                  </button>
                </div>
              )}

              {/* Step 2: Personal Information */}
              {currentStep === 2 && (
                <div className="space-y-8 animate-slide-up">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Personal Information</h2>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="form-label">First Name *</label>
                          <input
                            name="firstName"
                            type="text"
                            required
                            value={formData.firstName}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="John"
                            disabled={loading}
                          />
                        </div>
                        <div>
                          <label className="form-label">Last Name *</label>
                          <input
                            name="lastName"
                            type="text"
                            required
                            value={formData.lastName}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Doe"
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="form-label">Phone Number</label>
                        <input
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          className="form-input"
                          placeholder="+977-9800000000"
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button type="button" onClick={prevStep} className="btn-secondary flex-1" disabled={loading}>
                      Back
                    </button>
                    <button type="button" onClick={nextStep} className="btn-primary flex-1" disabled={loading}>
                      Continue to Account
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Account Details */}
              {currentStep === 3 && (
                <div className="space-y-8 animate-slide-up">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Account Details</h2>

                    <div className="space-y-6">
                      <div>
                        <label className="form-label">Email Address *</label>
                        <input
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="form-input"
                          placeholder="john@example.com"
                          disabled={loading}
                        />
                      </div>

                      <div>
                        <label className="form-label">Password *</label>
                        <div className="relative">
                          <input
                            name="password"
                            type={showPassword ? "text" : "password"}
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className="form-input pr-12"
                            placeholder="Create a strong password"
                            disabled={loading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors focus-ring rounded-lg p-1"
                            disabled={loading}
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>

                        {/* Password Strength Indicator */}
                        {formData.password && (
                          <div className="mt-3">
                            <div className="flex items-center space-x-3">
                              <div className="flex-1 bg-slate-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                                  style={{ width: `${passwordStrength}%` }}
                                />
                              </div>
                              <span
                                className={`text-sm font-medium ${
                                  passwordStrength < 25
                                    ? "text-error-600"
                                    : passwordStrength < 50
                                      ? "text-warning-600"
                                      : passwordStrength < 75
                                        ? "text-warning-500"
                                        : "text-success-600"
                                }`}
                              >
                                {getPasswordStrengthText()}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="form-label">Confirm Password *</label>
                        <div className="relative">
                          <input
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            required
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="form-input pr-12"
                            placeholder="Confirm your password"
                            disabled={loading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors focus-ring rounded-lg p-1"
                            disabled={loading}
                          >
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button type="button" onClick={prevStep} className="btn-secondary flex-1" disabled={loading}>
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary flex-1 flex items-center justify-center"
                    >
                      {loading ? <div className="loading-spinner w-5 h-5" /> : "Create Account"}
                    </button>
                  </div>
                </div>
              )}
            </form>

            {/* Sign In Link */}
            <div className="mt-12 text-center">
              <p className="text-slate-600">
                Already have an account?{" "}
                <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignupPage
