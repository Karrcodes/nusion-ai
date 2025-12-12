
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import Home from './components/Home';
import Dashboard from './components/Dashboard'; // "Brand Selection"
import IkoyiInterface from './components/restaurants/IkoyiInterface';
import AuthSelection from './components/AuthSelection';
import AuthForms from './components/auth/AuthForms';
import RestaurantDashboard from './components/RestaurantDashboard';
import DinerDashboard from './components/DinerDashboard';
import Welcome from './components/auth/Welcome';
import './index.css';

function App() {
  // Views: 'home' | 'auth_selection' | 'auth_forms' | 'restaurant_dashboard' | 'diner_dashboard' | 'dashboard' | 'ikoyi'
  const [currentView, setCurrentView] = useState('home');
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [selectedAuthType, setSelectedAuthType] = useState(null); // 'diner' or 'restaurant'

  // --- SUPABASE SESSION MANAGEMENT ---
  useEffect(() => {
    // 1. Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
      setIsLoading(false);
    });

    // 2. Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSession = (session) => {
    console.log("Handle Session:", session ? "User found" : "No user");
    if (session?.user) {
      // Normalize user object for our app
      const userMeta = session.user.user_metadata || {};
      const appUser = {
        id: session.user.id,
        email: session.user.email,
        name: userMeta.name || 'User',
        type: userMeta.type || 'diner', // Default to diner if missing
        ...userMeta
      };

      setCurrentUser(appUser);

      // Route to dashboard if we are currently on home or auth screens
      // This prevents redirecting if user is deep in another view (though we might want to anyway)
      // For now, let's auto-route if on 'home' or 'auth' flow
      setCurrentView(prev => {
        console.log("Auto-route check. Prev:", prev);

        // Check for welcome path (handles Supabase redirects)
        if (window.location.pathname === '/welcome') {
          return 'welcome';
        }

        // Only auto-route to dashboard if user was in the middle of auth flow
        if (['auth_selection', 'auth_forms'].includes(prev)) {
          console.log("Redirecting to dashboard from auth flow");
          return appUser.type === 'restaurant' ? 'restaurant_dashboard' : 'diner_dashboard';
        }
        return prev;
      });

    } else {
      setCurrentUser(null);
      // If logged out, kick to home
      setCurrentView('home');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentView('home');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent-wa border-t-transparent rounded-full animate-spin"></div>
          <p className="text-text-secondary font-mono text-sm animate-pulse">Initializing Nusion...</p>
        </div>
      </div>
    );
  }

  console.log("App Render. CurrentView:", currentView, "IsLoading:", isLoading);

  return (
    <div className="min-h-screen bg-bg-primary font-main text-text-primary transition-all duration-500">

      {currentView === 'home' && (
        <Home
          user={currentUser}
          onDashboard={() => {
            // Direct link for the User Icon
            if (currentUser && currentUser.type === 'restaurant') {
              setCurrentView('restaurant_dashboard');
            } else {
              setCurrentView('diner_dashboard');
            }
          }}
          onStart={() => {
            // "Browse Restaurants" -> If logged in as diner, go to dashboard or browsing.
            // If not logged in, go to Auth selection.
            if (currentUser && currentUser.type === 'diner') {
              setCurrentView('dashboard');
            } else if (currentUser && currentUser.type === 'restaurant') {
              setCurrentView('restaurant_dashboard');
            } else {
              setAuthMode('signup');
              setCurrentView('auth_selection');
            }
          }}
          onLogin={() => {
            setAuthMode('login');
            setCurrentView('auth_selection');
          }}
          onSignup={() => {
            setAuthMode('signup');
            setCurrentView('auth_selection');
          }}
          onPartnerSignup={() => {
            setAuthMode('signup');
            setSelectedAuthType('restaurant');
            setCurrentView('auth_forms');
          }}
        />
      )}

      {currentView === 'auth_selection' && (
        <AuthSelection
          onSelect={(type) => {
            setSelectedAuthType(type);
            setCurrentView('auth_forms');
          }}
          onBack={() => setCurrentView('home')}
        />
      )}

      {currentView === 'welcome' && (
        <Welcome
          user={currentUser}
          onContinue={() => {
            // Clear query params to prevent reappearing on refresh
            window.history.replaceState({}, document.title, "/");
            setCurrentView(currentUser?.type === 'restaurant' ? 'restaurant_dashboard' : 'diner_dashboard');
          }}
        />
      )}

      {currentView === 'auth_forms' && (
        <AuthForms
          type={selectedAuthType}
          mode={authMode}
          onBack={() => setCurrentView('auth_selection')}
        />
      )}

      {currentView === 'restaurant_dashboard' && (
        <RestaurantDashboard user={currentUser} onBack={handleLogout} onHome={() => setCurrentView('home')} />
      )}

      {currentView === 'diner_dashboard' && (
        <DinerDashboard
          user={currentUser}
          onBack={handleLogout}
          onBrowse={() => setCurrentView('dashboard')}
          onHome={() => setCurrentView('home')}
        />
      )}

      {currentView === 'dashboard' && ( // Brand Selector
        <Dashboard
          user={currentUser}
          onSelect={(brand) => setCurrentView(brand)}
          onHome={() => setCurrentView('home')}
          onProfile={() => setCurrentView('diner_dashboard')}
        />
      )}

      {currentView === 'ikoyi' && (
        <div className="animate-[fadeSlideIn_0.5s_ease-out] w-full min-h-screen pt-[50px] pb-[50px]">
          <IkoyiInterface
            onBack={() => setCurrentView('dashboard')}
            onHome={() => setCurrentView('home')}
          />
        </div>
      )}
    </div>
  );
}

export default App;
