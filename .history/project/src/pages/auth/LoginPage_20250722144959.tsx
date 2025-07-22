"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Camera, Eye, EyeOff, ArrowLeft, Mail, Lock, AlertCircle, Sparkles } from "lucide-react"
import { useAuth } from "../../context/AuthContext"

const LoginPage = () => {
  const navigate = useNavigate()
  const { login, loading } = useAuth()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields.")
      return
    }
    try {
      await login(formData.email, formData.password)
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.")
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (error) setError("")
  }

  const quickLoginOptions = [
    { email: "client@swornim.com", password: "password123", label: "Client", color: "chip-primary" },
    { email: "photographer@swornim.com", password: "password123", label: "Photographer", color: "chip-success" },
    { email: "venue@swornim.com", password: "password123", label: "Venue", color: "chip-warning" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="container">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side: Login form */}
            <div className="w-full max-w-md mx-auto lg:mx-0">
              <button onClick={() => navigate("/welcome")} className="btn-text mb-8 animate-fade-in">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Welcome
              </button>

              <div className="card p-8 lg:p-10 animate-slide-up">
                <div className="text-center mb-8">
                  <Link to="/welcome" className="inline-flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center shadow-lg">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-slate-900">Swornim</span>
                  </Link>
                  <h1 className="text-3xl font-bold text-slate-900 mb-3">Welcome Back!</h1>
                  <p className="text-slate-600 text-lg">Sign in to unlock your perfect event experience.</p>
                </div>

                {error && (
                  <div className="p-4 bg-error-50 border border-error-200 rounded-xl mb-6 animate-fade-in">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-error-600 mt-0.5 flex-shrink-0" />
                      <p className="text-error-800 font-medium text-sm">{error}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="form-label">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="form-input pl-12"
                        placeholder="Enter your email"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="form-input pl-12 pr-12"
                        placeholder="Enter your password"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors focus-ring rounded-lg p-1"
                        disabled={loading}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 text-slate-600">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500 focus:ring-2"
                        disabled={loading}
                      />
                      <span className="text-sm">Remember me</span>
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <button type="submit" disabled={loading} className="btn-primary w-full">
                    {loading ? <div className="loading-spinner w-5 h-5" /> : "Sign In"}
                  </button>
                </form>

                <div className="mt-8">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-slate-500">Quick Demo Access</span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <p className="text-sm text-slate-600 mb-4 text-center">Try our platform with demo accounts:</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {quickLoginOptions.map((option) => (
                        <button
                          key={option.label}
                          onClick={() => setFormData({ email: option.email, password: option.password })}
                          className={`chip ${option.color} hover:scale-105 transition-transform cursor-pointer`}
                          disabled={loading}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <p className="text-slate-600">
                    Don't have an account?{" "}
                    <Link
                      to="/signup"
                      className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                    >
                      Sign up for free
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            {/* Right side: Hero Content */}
            <div className="hidden lg:block">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1527529482837-4698179dc6ce?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
                  alt="Event celebration"
                  className="w-full h-[600px] object-cover rounded-3xl shadow-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary-900/60 to-primary-600/30 rounded-3xl"></div>

                <div className="absolute bottom-12 left-12 text-white max-w-md">
                  <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-medium">Trusted by 2,500+ clients</span>
                  </div>
                  <h2 className="text-4xl font-bold leading-tight mb-4">Your Vision, Our Expertise</h2>
                  <p className="text-lg text-blue-100 leading-relaxed">
                    Connect with Nepal's finest event professionals and transform your special moments into
                    unforgettable memories.
                  </p>
                </div>

                {/* Floating Stats */}
                <div className="absolute top-12 right-12 bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-1">5,000+</div>
                    <div className="text-sm text-blue-100">Events Completed</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
