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
import AdminLogin from './components/AdminLogin';
import ErrorBoundary from './components/ErrorBoundary';
import { ImpersonationProvider } from './contexts/ImpersonationContext';
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
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      await handleSession(session);
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

  const handleSession = async (session) => {
    if (session?.user) {
      // --- HEAL & SYNC USER TYPE ---
      // We must ensure the DB profile matches the Auth Metadata, and exists!
      let type = session.user.user_metadata?.type;

      try {
        // 1. If metadata type is missing (Google Auth), default to 'diner'.
        if (!type) {
          // console.log("Healing Google Auth User: Setting default diner type...");
          type = 'diner';
          await supabase.auth.updateUser({ data: { type: 'diner' } });

          // SEND WELCOME EMAIL (Only for new/unhealed users)
          try {
            // Determine name for email
            const emailName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0];

            // Call Serverless Function (requires Vercel hosting)
            fetch('/api/send-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to: session.user.email,
                subject: 'Welcome to Nusion!',
                html: `
                            <div style="font-family: sans-serif; padding: 20px; background: #0f1623; color: #fff;">
                                <h1 style="color: #92e6e6;">Welcome to Nusion, ${emailName}!</h1>
                                <p>We're thrilled to have you onboard.</p>
                                <p>Nusion is your personalized dining companion, powered by advanced AI.</p>
                                <br/>
                                <a href="${window.location.origin}/dashboard" style="display: inline-block; padding: 12px 24px; background: #fff; color: #000; text-decoration: none; border-radius: 4px; font-weight: bold;">Go to Dashboard</a>
                            </div>
                        `
              })
            }).catch(e => console.warn("Email API unreachable (Localhost?):", e));
          } catch (emailErr) {
            console.warn("Welcome email skipped:", emailErr);
          }
        }

        // 2. ALWAYS Sync/Ensure Profile Exists
        // We use upsert to guarantee the record exists and has the correct type.
        // This handles cases where metadata exists but profile is missing, OR type mismatch.
        const name = session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0];

        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: session.user.id,
            email: session.user.email,
            name: name,
            type: type, // Enforce the type from metadata (or healed default)
            status: 'active', // Ensure active status
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' }); // Merge/Update

        if (profileError) {
          console.error("Profile Sync Error:", profileError);
        }

      } catch (err) {
        console.error("Auto-healing/Sync failed:", err);
      }

      const appUser = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.user_metadata?.name,
        type: type || 'diner'
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
    }
  };

  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center bg-bg-primary text-text-primary">Loading Nusion AI...</div>;
  }

  return (
    <ErrorBoundary>
      <ImpersonationProvider>
        <div className="min-h-screen bg-bg-primary font-main text-text-primary transition-all duration-500 relative">
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
                  navigate('/auth/forms', { state: { from: '/' } });
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

            <Route path="/:brandSlug" element={
              <ProtectedRoute user={currentUser}>
                <div className="animate-[fadeSlideIn_0.5s_ease-out] w-full min-h-screen bg-[var(--color-midnight)]">
                  <IkoyiInterface user={currentUser} />
                </div>
              </ProtectedRoute>
            } />

            {/* Admin Portal */}
            <Route path="/admin" element={<AdminLogin />} />

            {/* Owner Portal (God Mode) */}
            <Route path="/portal/owner" element={
              <AdminGuard>
                <OwnerPortal />
              </AdminGuard>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </ImpersonationProvider>
    </ErrorBoundary>
  );
}

export default App;
