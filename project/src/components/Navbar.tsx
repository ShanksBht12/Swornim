import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Camera, Sparkles, Phone, Info, FileText, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { to: '/welcome', label: 'Home', icon: Home },
  { to: '/about', label: 'About', icon: Info },
  { to: '/contact', label: 'Contact', icon: Phone },
  { to: '/terms', label: 'Terms & Privacy', icon: FileText },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/90 backdrop-blur-lg shadow-lg border-b border-slate-200/50' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/welcome" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Sparkles className="w-2 h-2 text-white" />
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold tracking-tight select-none text-blue-700">Swornim</span>
              </div>
              <div className="text-xs text-slate-500 -mt-1">Premium Events</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  <span>{link.label}</span>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Desktop User Controls */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <img
                  src={user.profilePicture || '/default-avatar.png'}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover border border-blue-200"
                />
                <span className="font-medium text-gray-700">{user.firstName || user.username}</span>
                <button onClick={logout} className="ml-2 text-sm text-blue-600 hover:underline">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="mr-2">Sign In</Link>
                <Link to="/signup" className="btn-gradient">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white/80 backdrop-blur-lg shadow-lg px-4 pb-4 pt-2 flex flex-col gap-4 animate-fade-in-down">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className="text-lg font-semibold text-gray-700 hover:text-blue-700 transition"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex flex-col gap-2 mt-2">
            {user ? (
              <>
                <div className="flex items-center gap-2">
                  <img
                    src={user.profilePicture || '/default-avatar.png'}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover border border-blue-200"
                  />
                  <span className="font-medium text-gray-700">{user.firstName || user.username}</span>
                  <button onClick={logout} className="ml-2 text-sm text-blue-600 hover:underline">Logout</button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="mr-2">Sign In</Link>
                <Link to="/signup" className="btn-gradient">Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;