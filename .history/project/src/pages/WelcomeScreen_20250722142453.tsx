import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  Camera, Calendar, MapPin, Palette, Users, ArrowRight, Star, CheckCircle, 
  Menu, X, Sparkles, Phone, Info, FileText, Home, Play, Shield, 
  Zap, Award, TrendingUp, Heart
} from 'lucide-react';

const navLinks = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/about', label: 'About', icon: Info },
  { to: '/contact', label: 'Contact', icon: Phone },
  { to: '/terms', label: 'Terms & Privacy', icon: FileText },
];

const WelcomeScreen = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Camera className="w-8 h-8 text-blue-600" />,
      title: "Professional Photography",
      description: "Connect with certified photographers and videographers for stunning captures",
      color: "from-blue-500 to-indigo-600"
    },
    {
      icon: <MapPin className="w-8 h-8 text-emerald-600" />,
      title: "Premium Venues",
      description: "Discover and book breathtaking venues for your memorable events",
      color: "from-emerald-500 to-teal-600"
    },
    {
      icon: <Palette className="w-8 h-8 text-purple-600" />,
      title: "Beauty & Makeup",
      description: "Professional makeup artists and stylists for your special occasions",
      color: "from-purple-500 to-pink-600"
    },
    {
      icon: <Calendar className="w-8 h-8 text-orange-600" />,
      title: "Event Management",
      description: "Seamlessly plan, coordinate, and manage your entire event journey",
      color: "from-orange-500 to-red-600"
    }
  ];

  const stats = [
    { number: "2,500+", label: "Happy Clients", icon: <Heart className="w-5 h-5" /> },
    { number: "800+", label: "Professional Vendors", icon: <Award className="w-5 h-5" /> },
    { number: "5,000+", label: "Successful Events", icon: <TrendingUp className="w-5 h-5" /> },
    { number: "75+", label: "Cities Covered", icon: <MapPin className="w-5 h-5" /> }
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Bride",
      content: "Swornim made our wedding planning effortless. The photographers were amazing!",
      rating: 5,
      image: "https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=2"
    },
    {
      name: "Raj Patel",
      role: "Event Organizer",
      content: "Best platform for finding reliable vendors. Highly recommended!",
      rating: 5,
      image: "https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=2"
    },
    {
      name: "Maya Singh",
      role: "Corporate Client",
      content: "Professional service and excellent coordination. Five stars!",
      rating: 5,
      image: "https://images.pexels.com/photos/1040882/pexels-photo-1040882.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=2"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-medium">
                  <Sparkles className="w-4 h-4" />
                  <span>Nepal's #1 Event Platform</span>
                </div>
                
                <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                  Your Perfect Event
                  <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Starts Here
                  </span>
                </h1>
                
                <p className="text-xl text-slate-600 max-w-lg leading-relaxed">
                  Connect with Nepal's finest photographers, venues, and event professionals. 
                  Transform your special moments into unforgettable memories with Swornim.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => navigate('/auth')}
                  className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center space-x-2 text-lg font-semibold">
                    <span>Start Planning</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
                
                <button className="flex items-center justify-center space-x-2 px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 group">
                  <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="text-lg font-semibold">Watch Demo</span>
                </button>
              </div>

              <div className="flex items-center space-x-6 pt-4">
                <div className="flex -space-x-2">
                  {testimonials.map((testimonial, i) => (
                    <img
                      key={i}
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-10 h-10 rounded-full border-2 border-white shadow-md"
                    />
                  ))}
                </div>
                <div>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-sm font-medium ml-2">4.9/5</span>
                  </div>
                  <p className="text-sm text-slate-500">Trusted by 2,500+ clients</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <img
                    src="https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2"
                    alt="Wedding Photography"
                    className="rounded-2xl shadow-xl object-cover w-full h-48 hover:scale-105 transition-transform duration-300"
                  />
                  <img
                    src="https://images.pexels.com/photos/587741/pexels-photo-587741.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&dpr=2"
                    alt="Event Venue"
                    className="rounded-2xl shadow-xl object-cover w-full h-32 hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="space-y-4 pt-8">
                  <img
                    src="https://images.pexels.com/photos/2959192/pexels-photo-2959192.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&dpr=2"
                    alt="Makeup Artist"
                    className="rounded-2xl shadow-xl object-cover w-full h-32 hover:scale-105 transition-transform duration-300"
                  />
                  <img
                    src="https://images.pexels.com/photos/1666021/pexels-photo-1666021.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2"
                    alt="Event Management"
                    className="rounded-2xl shadow-xl object-cover w-full h-48 hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
              
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-6 shadow-xl border border-slate-100">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900">5,000+</div>
                    <div className="text-sm text-slate-500">Events Completed</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Everything You Need</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              From photography to venues, we connect you with verified professionals 
              to make your event extraordinary.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-slate-100">
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`} />
                <div className="relative z-10">
                  <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 text-center">{feature.title}</h3>
                  <p className="text-slate-600 text-center leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-colors duration-300">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl lg:text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-blue-100 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">What Our Clients Say</h2>
            <p className="text-xl text-slate-600">Don't just take our word for it</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center space-x-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-600 mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center space-x-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <div className="font-semibold text-slate-900">{testimonial.name}</div>
                    <div className="text-sm text-slate-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10" />
            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Join thousands of satisfied clients who trust Swornim for their special events.
                Start planning your perfect event today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/signup"
                  className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors duration-300 shadow-lg"
                >
                  Create Account
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Camera className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold">Swornim</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Nepal's premier event management platform connecting clients with verified professionals.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-6">Services</h4>
              <ul className="space-y-3 text-slate-400">
                <li className="hover:text-white transition-colors cursor-pointer">Photography</li>
                <li className="hover:text-white transition-colors cursor-pointer">Videography</li>
                <li className="hover:text-white transition-colors cursor-pointer">Venues</li>
                <li className="hover:text-white transition-colors cursor-pointer">Makeup & Beauty</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-6">Company</h4>
              <ul className="space-y-3 text-slate-400">
                <li className="hover:text-white transition-colors cursor-pointer">About Us</li>
                <li className="hover:text-white transition-colors cursor-pointer">Contact</li>
                <li className="hover:text-white transition-colors cursor-pointer">Careers</li>
                <li className="hover:text-white transition-colors cursor-pointer">Support</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-6">Legal</h4>
              <ul className="space-y-3 text-slate-400">
                <li className="hover:text-white transition-colors cursor-pointer">Privacy Policy</li>
                <li className="hover:text-white transition-colors cursor-pointer">Terms of Service</li>
                <li className="hover:text-white transition-colors cursor-pointer">Cookie Policy</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-slate-400">
                © 2024 Swornim. All rights reserved.
              </p>
              <div className="flex items-center space-x-6 mt-4 md:mt-0">
                <span className="text-slate-400">Follow us:</span>
                <div className="flex space-x-4">
                  <Users className="w-5 h-5 text-slate-400 hover:text-white cursor-pointer transition-colors" />
                  <Camera className="w-5 h-5 text-slate-400 hover:text-white cursor-pointer transition-colors" />
                  <Shield className="w-5 h-5 text-slate-400 hover:text-white cursor-pointer transition-colors" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WelcomeScreen;