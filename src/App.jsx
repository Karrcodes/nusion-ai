import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { supabase } from './lib/supabaseClient';
import Home from './components/Home';
import AuthSelection from './components/AuthSelection';
import AuthForms from './components/auth/AuthForms';
import Dashboard from './components/Dashboard';
import IkoyiInterface from './components/restaurants/IkoyiInterface';
import DinerDashboard from './components/DinerDashboard';
import RestaurantDashboard from './components/RestaurantDashboard';
import Welcome from './components/auth/Welcome';
import OnboardingWizard from './components/auth/OnboardingWizard';
import { Link } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AdminGuard from './components/auth/AdminGuard';
import OwnerPortal from './components/admin/OwnerPortal';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedAuthType, setSelectedAuthType] = useState(null); // 'diner' | 'restaurant'
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // --- SCROLL TO TOP ON VIEW CHANGE ---
  useEffect(() => {
    // Disable default browser scroll restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // Use timeout to ensure this runs after layout measurements
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, 10);

    return () => clearTimeout(timer);
  }, [location.pathname]); // Trigger on path change including subpages


  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    return () => subscription.unsubscribe();
  }, []); // Run once on mount

  const handleSession = (session) => {
    if (session?.user) {
      const appUser = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.user_metadata?.name,
        type: session.user.user_metadata?.type || 'diner'
      };
      setCurrentUser(appUser);

      // Auto-routing logic
      const currentPath = window.location.pathname;

      // Check for welcome flag (query param check for legacy support + path check)
      const params = new URLSearchParams(window.location.search);
      if (params.get('welcome') === 'true' || currentPath === '/welcome') {
        navigate('/welcome');
        return;
      }



    } else {
      setCurrentUser(null);
      // ProtectedRoute component will handle redirects now, so we can remove strict session checking here
      // But we can keep a "bounce" for better UX if needed, though simpler is better.
    }
  };

  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center bg-bg-primary text-text-primary">Loading Nusion AI...</div>;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-bg-primary font-main text-text-primary transition-all duration-500 relative">
        {/* GLOBAL GOD MODE BUTTON (Visible everywhere except Portal, for Admin) */}
        {currentUser && ['owner@nusion.ai', 'abduluk98@gmail.com'].includes(currentUser.email) && location.pathname !== '/portal/owner' && (
          <Link
            to="/portal/owner"
            className="fixed bottom-4 right-4 z-[9999] px-4 py-2 bg-gradient-to-r from-red-600 to-purple-800 text-white font-mono text-xs font-bold uppercase tracking-widest rounded-full shadow-2xl hover:scale-110 transition-transform border border-white/20"
          >
            GOD MODE
          </Link>
        )}

        <Routes>
          <Route path="/" element={
            <Home
              user={currentUser}
              onStart={() => {
                if (currentUser) {
                  navigate('/dashboard');
                } else {
                  setAuthMode('signup');
                  navigate('/auth');
                }
              }}
              onLogin={() => {
                setAuthMode('login');
                navigate('/auth');
              }}
              onSignup={() => {
                setAuthMode('signup');
                navigate('/auth');
              }}
              onPartnerSignup={() => {
                setAuthMode('signup');
                setSelectedAuthType('restaurant');
                navigate('/auth/forms');
              }}
            />
          } />

          <Route path="/auth" element={
            <AuthSelection
              mode={authMode}
              onSwitchMode={setAuthMode}
              onSelect={(type) => {
                setSelectedAuthType(type);
                navigate('/auth/forms');
              }}
            />
          } />

          <Route path="/auth/forms" element={
            <AuthForms
              type={selectedAuthType}
              mode={authMode}
            />
          } />

          <Route path="/welcome" element={
            <ProtectedRoute user={currentUser}>
              <Welcome
                user={currentUser}
                onContinue={() => {
                  navigate('/onboarding', { replace: true });
                }}
              />
            </ProtectedRoute>
          } />

          <Route path="/onboarding" element={
            <ProtectedRoute user={currentUser}>
              <OnboardingWizard user={currentUser} />
            </ProtectedRoute>
          } />

          <Route path="/dashboard/restaurant" element={
            <ProtectedRoute user={currentUser} requiredType="restaurant">
              <RestaurantDashboard user={currentUser} />
            </ProtectedRoute>
          } />

          <Route path="/dashboard/diner" element={
            <ProtectedRoute user={currentUser} requiredType="diner">
              <DinerDashboard user={currentUser} />
            </ProtectedRoute>
          } />

          <Route path="/dashboard" element={
            <Dashboard user={currentUser} />
          } />

          <Route path="/ikoyi" element={
            <ProtectedRoute user={currentUser}>
              <div className="animate-[fadeSlideIn_0.5s_ease-out] w-full min-h-screen pt-[50px] pb-[50px]">
                <IkoyiInterface user={currentUser} />
              </div>
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="/portal/owner" element={
            <AdminGuard>
              <OwnerPortal />
            </AdminGuard>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </ErrorBoundary>
  );
}

export default App;
