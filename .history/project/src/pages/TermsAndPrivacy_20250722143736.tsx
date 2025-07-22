"use client"

import { useState } from "react"
import { Shield, FileText, Eye, Lock, Users, AlertCircle, CheckCircle, Clock } from "lucide-react"

const TermsAndPrivacy = () => {
  const [activeTab, setActiveTab] = useState("terms")

  const tabs = [
    { id: "terms", label: "Terms of Service", icon: FileText },
    { id: "privacy", label: "Privacy Policy", icon: Shield },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 chip chip-primary mb-6">
              <Shield className="w-4 h-4" />
              <span>Legal Information</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              Terms & <span className="text-gradient">Privacy</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Your trust and privacy are important to us. Please review our terms and privacy policy.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-12">
            <div className="card p-2 inline-flex space-x-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? "bg-primary-600 text-white shadow-md"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Content */}
          <div className="card p-8 lg:p-12">
            {activeTab === "terms" && (
              <div className="space-y-8">
                <div className="flex items-start space-x-4 p-6 bg-blue-50 rounded-xl border border-blue-200">
                  <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">Important Notice</h3>
                    <p className="text-blue-800">
                      By using our platform, you agree to these terms of service. Please read them carefully.
                    </p>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
                    <FileText className="w-6 h-6 mr-3 text-primary-600" />
                    Terms of Service
                  </h2>
                  <div className="prose prose-slate max-w-none">
                    <p className="text-slate-700 leading-relaxed mb-6">
                      Welcome to our Event Booking Platform. By accessing and using our services, you agree to be bound
                      by these Terms of Service and all applicable laws and regulations.
                    </p>

                    <h3 className="text-xl font-semibold text-slate-900 mb-3">1. Service Description</h3>
                    <p className="text-slate-700 leading-relaxed mb-6">
                      We provide a platform that connects clients with verified event service providers including
                      photographers, venues, makeup artists, and event coordinators. We strive to provide accurate
                      information and facilitate secure booking experiences.
                    </p>

                    <h3 className="text-xl font-semibold text-slate-900 mb-3">2. User Responsibilities</h3>
                    <ul className="space-y-2 text-slate-700 mb-6">
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
                        <span>Provide accurate and complete information when booking services</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
                        <span>Respect the terms and conditions of service providers</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
                        <span>Use the platform in accordance with applicable laws</span>
                      </li>
                    </ul>

                    <h3 className="text-xl font-semibold text-slate-900 mb-3">3. Platform Policies</h3>
                    <p className="text-slate-700 leading-relaxed mb-6">
                      We reserve the right to modify these terms at any time. Users will be notified of significant
                      changes. Continued use of the platform constitutes acceptance of updated terms.
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-success-50 rounded-xl border border-success-200">
                  <Clock className="w-5 h-5 text-success-600" />
                  <span className="text-success-800 font-medium">Last updated: January 2024</span>
                </div>
              </div>
            )}

            {activeTab === "privacy" && (
              <div className="space-y-8">
                <div className="flex items-start space-x-4 p-6 bg-purple-50 rounded-xl border border-purple-200">
                  <Lock className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-purple-900 mb-2">Your Privacy Matters</h3>
                    <p className="text-purple-800">
                      We are committed to protecting your personal information and being transparent about how we use
                      it.
                    </p>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
                    <Shield className="w-6 h-6 mr-3 text-primary-600" />
                    Privacy Policy
                  </h2>
                  <div className="prose prose-slate max-w-none">
                    <p className="text-slate-700 leading-relaxed mb-6">
                      Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect
                      your personal information when you use our event booking platform.
                    </p>

                    <h3 className="text-xl font-semibold text-slate-900 mb-3">Information We Collect</h3>
                    <div className="grid sm:grid-cols-2 gap-4 mb-6">
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <div className="flex items-center space-x-2 mb-2">
                          <Users className="w-5 h-5 text-slate-600" />
                          <span className="font-medium text-slate-900">Personal Data</span>
                        </div>
                        <p className="text-sm text-slate-600">Name, email, phone number, and event preferences</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <div className="flex items-center space-x-2 mb-2">
                          <Eye className="w-5 h-5 text-slate-600" />
                          <span className="font-medium text-slate-900">Usage Data</span>
                        </div>
                        <p className="text-sm text-slate-600">Platform interactions, search history, and preferences</p>
                      </div>
                    </div>

                    <h3 className="text-xl font-semibold text-slate-900 mb-3">How We Use Your Information</h3>
                    <ul className="space-y-2 text-slate-700 mb-6">
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
                        <span>To facilitate bookings and connect you with service providers</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
                        <span>To improve our platform and provide personalized recommendations</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
                        <span>To send important updates and promotional offers (with your consent)</span>
                      </li>
                    </ul>

                    <h3 className="text-xl font-semibold text-slate-900 mb-3">Data Protection</h3>
                    <p className="text-slate-700 leading-relaxed mb-6">
                      Your data is stored securely using industry-standard encryption. We never share your personal
                      information with third parties except as required to provide our services or as required by law.
                      You have the right to access, update, or delete your personal information at any time.
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-success-50 rounded-xl border border-success-200">
                  <Clock className="w-5 h-5 text-success-600" />
                  <span className="text-success-800 font-medium">Last updated: January 2024</span>
                </div>
              </div>
            )}
          </div>

          {/* Contact Section */}
          <div className="mt-12 text-center">
            <div className="card p-8 bg-gradient-secondary text-white">
              <h3 className="text-2xl font-bold mb-4">Questions About Our Policies?</h3>
              <p className="text-slate-100 mb-6 max-w-2xl mx-auto">
                If you have any questions about our Terms of Service or Privacy Policy, we're here to help clarify
                anything you need.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="mailto:legal@eventbooker.com" className="btn-secondary">
                  <FileText className="w-4 h-4 mr-2" />
                  Contact Legal Team
                </a>
                <a href="/contact" className="btn-secondary">
                  <Shield className="w-4 h-4 mr-2" />
                  General Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TermsAndPrivacy
