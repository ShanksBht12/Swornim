import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import RoleBasedDashboard from './components/RoleBasedDashboard';
import ClientDashboard from './pages/client/ClientDashboard';
import ServiceProviderDashboard from './pages/service_provider_form/dashboard/service_provider_dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import WelcomeScreen from './pages/WelcomeScreen';
import { AuthProvider, useAuth } from './context/AuthContext';
import AboutUs from './pages/AboutUs';
import Contact from './pages/Contact';
import TermsAndPrivacy from './pages/TermsAndPrivacy';
import Navbar from './components/Navbar';
import EmailVerificationPage from './pages/auth/EmailVerificationPage';
import CompleteProfilePhotographer from './pages/service_provider_form/profile_forms/CompleteProfilePhotographer';
import CompleteProfileVenue from './pages/service_provider_form/profile_forms/CompleteProfileVenue';
import CompleteProfileMakeupArtist from './pages/service_provider_form/profile_forms/CompleteProfileMakeupArtist';
import CompleteProfileDecorator from './pages/service_provider_form/profile_forms/CompleteProfileDecorator';
import CompleteProfileCaterer from './pages/service_provider_form/profile_forms/CompleteProfileCaterer';
import CompleteProfileEventOrganizer from './pages/service_provider_form/profile_forms/CompleteProfileEventOrganizer';
import RequireCompleteProfile from './components/RequireCompleteProfile';
import { ServiceProviderProfileProvider } from './context/ServiceProviderProfileContext';
import PhotographerDetail from './pages/serviceprovider/photographer/PhotographerDetail';
import CatererDetail from './pages/serviceprovider/caterer/CatererDetail';
import VenueDetail from './pages/serviceprovider/venue/VenueDetail';
import DecoratorDetail from './pages/serviceprovider/decorator/DecoratorDetail';
import MakeupArtistDetail from './pages/serviceprovider/makeupartist/MakeupArtistDetail';
import { Toaster } from 'react-hot-toast';
import EventDetail from './pages/client/event/EventDetail';
import PaymentSuccessHandler from './pages/client/event/PaymentSuccessHandler';
import TicketDetail from './pages/client/event/TicketDetail';

function AppRoutes() {
  const { user, loading } = useAuth();

  console.log('Rendering AppRoutes, user:', user);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <ServiceProviderProfileProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/welcome" element={<><Navbar /><WelcomeScreen /></>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/about" element={<><Navbar /><AboutUs /></>} />
        <Route path="/contact" element={<><Navbar /><Contact /></>} />
        <Route path="/terms" element={<><Navbar /><TermsAndPrivacy /></>} />
        <Route path="/verify-email" element={<EmailVerificationPage />} />
        
        {/* Photographer detail page route */}
        <Route path="/photographers/:id" element={<PhotographerDetail />} />
        <Route path="/serviceprovider/caterer/:id" element={<CatererDetail />} />
        <Route path="/serviceprovider/venue/:id" element={<VenueDetail />} />
        <Route path="/serviceprovider/decorator/:id" element={<DecoratorDetail />} />
        <Route path="/serviceprovider/makeupartist/:id" element={<MakeupArtistDetail />} />
        
        {/* Event routes */}
        <Route path="/events/:id" element={<EventDetail />} />
        {/* Payment success handler for event ticket bookings */}
        <Route path="/events/ticket/payment-success" element={<PaymentSuccessHandler />} />
        {/* FIXED: Add the missing ticket detail route */}
        <Route path="/events/ticket/:bookingId" element={<TicketDetail />} />
        
        {/* Always available profile completion routes */}
        <Route path="/complete-profile/photographer" element={<CompleteProfilePhotographer />} />
        <Route path="/complete-profile/venue" element={<CompleteProfileVenue />} />
        <Route path="/complete-profile/makeup-artist" element={<CompleteProfileMakeupArtist />} />
        <Route path="/complete-profile/decorator" element={<CompleteProfileDecorator />} />
        <Route path="/complete-profile/caterer" element={<CompleteProfileCaterer />} />
        <Route path="/complete-profile/event-organizer" element={<CompleteProfileEventOrganizer />} />
        
        {/* Authenticated routes */}
        {user && (
          <>
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <RoleBasedDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/client-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['client']}>
                  <ClientDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/service-provider-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['photographer', 'makeupArtist', 'decorator', 'venue', 'caterer', 'event_organizer', 'eventOrganizer']}>
                  <ServiceProviderDashboard />
                </ProtectedRoute>
              } 
            />
          </>
        )}
        <Route path="*" element={<Navigate to="/welcome" replace />} />
      </Routes>
    </ServiceProviderProfileProvider>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <AppRoutes />
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                fontSize: '1.1rem',
                borderRadius: '1rem',
                padding: '1.5rem 2rem',
                background: 'linear-gradient(90deg, #4f46e5, #a21caf)',
                color: '#fff',
                boxShadow: '0 8px 32px rgba(80,0,200,0.15)',
              },
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            }}
          />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;