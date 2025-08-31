import { Link } from "react-router-dom"
import { CheckCircle, Mail, ArrowRight, Shield, Clock } from "lucide-react"

const EmailVerificationPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="container">
        <div className="max-w-2xl mx-auto">
          <div className="card p-8 lg:p-12 text-center animate-fade-in">
            {/* Success Icon */}
            <div className="flex justify-center mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-success-500 to-success-600 rounded-2xl flex items-center justify-center shadow-lg">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
            </div>

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-slate-900 mb-4">Check Your Email</h1>
              <p className="text-xl text-slate-600 max-w-md mx-auto leading-relaxed">
                We've sent a verification link to your email address. Please check your inbox and click the link to
                activate your account.
              </p>
            </div>

            {/* Instructions */}
            <div className="space-y-6 mb-12">
              <div className="flex items-start space-x-4 p-6 bg-blue-50 rounded-xl border border-blue-200 text-left">
                <Mail className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Check Your Inbox</h3>
                  <p className="text-blue-800 text-sm">
                    Look for an email from Swornim with the subject "Verify Your Email Address"
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-6 bg-purple-50 rounded-xl border border-purple-200 text-left">
                <Shield className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-purple-900 mb-2">Secure Verification</h3>
                  <p className="text-purple-800 text-sm">
                    Click the verification link to confirm your email and secure your account
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-6 bg-orange-50 rounded-xl border border-orange-200 text-left">
                <Clock className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-orange-900 mb-2">Link Expires Soon</h3>
                  <p className="text-orange-800 text-sm">
                    The verification link will expire in 24 hours for security reasons
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Link to="/login" className="btn-primary w-full group">
                <span>Continue to Login</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>

              <button className="btn-text w-full">Didn't receive the email? Resend verification</button>
            </div>

            {/* Help Section */}
            <div className="mt-12 p-6 bg-slate-50 rounded-xl">
              <h3 className="font-semibold text-slate-900 mb-2">Need Help?</h3>
              <p className="text-slate-600 text-sm mb-4">
                If you don't see the email in your inbox, check your spam folder or contact our support team.
              </p>
              <Link
                to="/contact"
                className="text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmailVerificationPage
