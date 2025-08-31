import React from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';

const Contact = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-16 px-4 sm:px-6 lg:px-8">
    <div className="container">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 chip chip-primary mb-6">
            <MessageCircle className="w-4 h-4" />
            <span>Get in Touch</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
            Contact <span className="text-gradient">Our Team</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Have questions or need support? We're here to help make your event planning journey smooth and memorable.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="card p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Get in Touch</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Email Us</h3>
                    <p className="text-slate-600 mb-2">Send us an email anytime</p>
                    <a href="mailto:support@eventbooker.com" className="text-primary-600 hover:text-primary-700 font-medium transition-colors">
                      support@eventbooker.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-success-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-success-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Call Us</h3>
                    <p className="text-slate-600 mb-2">Mon-Fri from 8am to 5pm</p>
                    <a href="tel:+12345678901" className="text-success-600 hover:text-success-700 font-medium transition-colors">
                      +1 234 567 8901
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-warning-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-warning-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Visit Us</h3>
                    <p className="text-slate-600 mb-2">Come say hello at our office</p>
                    <p className="text-slate-700 font-medium">
                      123 Event Lane<br />
                      City, Country
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="card p-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600 mb-1">24/7</div>
                  <div className="text-sm text-slate-600">Support Available</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success-600 mb-1">2hrs</div>
                  <div className="text-sm text-slate-600">Average Response</div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="card p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Send us a Message</h2>
            <form className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">First Name</label>
                  <input type="text" className="form-input" placeholder="John" />
                </div>
                <div>
                  <label className="form-label">Last Name</label>
                  <input type="text" className="form-input" placeholder="Doe" />
                </div>
              </div>
              
              <div>
                <label className="form-label">Email</label>
                <input type="email" className="form-input" placeholder="john@example.com" />
              </div>
              
              <div>
                <label className="form-label">Subject</label>
                <input type="text" className="form-input" placeholder="How can we help?" />
              </div>
              
              <div>
                <label className="form-label">Message</label>
                <textarea 
                  rows={4} 
                  className="form-input resize-none" 
                  placeholder="Tell us more about your event or question..."
                ></textarea>
              </div>
              
              <button type="submit" className="btn-primary w-full group">
                <Send className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                Send Message
              </button>
            </form>
          </div>
        </div>

        {/* Additional Help Section */}
        <div className="mt-16 text-center">
          <div className="card p-8 bg-gradient-primary text-white">
            <h3 className="text-2xl font-bold mb-4">Need Immediate Help?</h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              For urgent inquiries or immediate assistance with your event planning, 
              don't hesitate to reach out directly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="tel:+12345678901" className="btn-secondary">
                <Phone className="w-4 h-4 mr-2" />
                Call Now
              </a>
              <a href="mailto:support@eventbooker.com" className="btn-secondary">
                <Mail className="w-4 h-4 mr-2" />
                Email Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default Contact;
