import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const DinerDashboard = ({ user }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Initialize view based on query param
    const [view, setView] = useState(() => {
        const params = new URLSearchParams(location.search);
        return params.get('view') === 'profile' ? 'profile' : 'dashboard';
    });

    // Update view if URL changes (e.g. back button)
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const urlView = params.get('view') === 'profile' ? 'profile' : 'dashboard';
        if (urlView !== view) {
            // Optional: we could sync them, but for now let's just respect initial load or manual navigation
            // If we want two-way sync, we'd use setView(urlView) here, but valid to keep internal state dominant for now unless necessary.
            // Actually, simplest is just to respect initial load.
        }
    }, [location.search]);

    // Update URL when view changes to allow bookmarking/sharing (Optional but good UX)
    // For now, let's just stick to internal state unless user specifically asked for deep linking. 
    // The query param is mainly for the entry point from Dashboard.jsx.

    // Load preferences from localStorage (keyed by User ID)
    const [preferences, setPreferences] = useState(() => {
        const storageKey = `diner_preferences_${user?.id}`;
        const saved = localStorage.getItem(storageKey);
        // If we have saved prefs, use them. Otherwise default.
        return saved ? JSON.parse(saved) : {
            vegan: false,
            spicy: true,
            halal: true,
            glutenFree: false,
            // New Profile Fields
            location: '',
            budget: '$$',
            allergies: '',
        };
    });

    // Persist preferences on change
    useEffect(() => {
        if (user?.id) {
            localStorage.setItem(`diner_preferences_${user.id}`, JSON.stringify(preferences));
        }
    }, [preferences, user]);

    const togglePref = (key) => setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    const handleChange = (key, value) => setPreferences(prev => ({ ...prev, [key]: value }));

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    return (
        <div className="min-h-screen w-full bg-bg-primary">
            <nav className="px-4 py-4 md:px-8 md:py-6 flex justify-between items-center border-b border-glass-border bg-white/50 backdrop-blur-md sticky top-0 z-50">
                <Link to="/" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" title="Back to Home">
                    <img src="/nusion-logo.png" alt="Logo" className="h-8 w-auto opacity-80" style={{ filter: 'brightness(0) saturate(100%) invert(23%) sepia(13%) saturate(928%) hue-rotate(338deg) brightness(96%) contrast(90%)' }} />
                    <span className="font-display font-medium text-lg md:text-xl text-text-primary tracking-wide opacity-80 pt-1">AI</span>
                </Link>
                <div className="flex items-center gap-3 md:gap-6">
                    <button
                        onClick={() => setView('dashboard')}
                        className={`text-xs md:text-sm font-medium transition-colors ${view === 'dashboard' ? 'text-text-primary font-bold' : 'text-text-secondary hover:text-text-primary'}`}
                    >
                        My Palate
                    </button>
                    <button
                        onClick={() => setView('profile')}
                        className={`text-xs md:text-sm font-medium transition-colors ${view === 'profile' ? 'text-text-primary font-bold' : 'text-text-secondary hover:text-text-primary'}`}
                    >
                        Profile
                    </button>
                    <div className="w-px h-6 bg-glass-border"></div>
                    <button
                        onClick={() => setView('profile')}
                        className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all shadow-sm hover:ring-2 hover:ring-accent-wa/50 ${preferences.photo ? 'border-2 border-accent-wa/50 p-0 overflow-hidden' : 'bg-accent-wa/20 text-accent-wa font-bold'}`}
                    >
                        {preferences.photo ? (
                            <img src={preferences.photo} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            user?.name ? user.name.charAt(0).toUpperCase() : 'G'
                        )}
                    </button>
                </div>
            </nav>

            <main className="p-4 md:p-12 max-w-6xl mx-auto animate-[fadeIn_0.5s]">

                {view === 'dashboard' ? (
                    <>
                        <header className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                            <div>
                                <h1 className="text-3xl font-display font-bold text-text-primary mb-2">My Palate</h1>
                                <p className="text-text-secondary">Manage your dining DNA and view generative history.</p>
                            </div>
                            <Link
                                to="/dashboard"
                                className="px-6 py-3 bg-text-primary text-bg-primary rounded-full font-bold hover:opacity-90 transition-opacity shadow-lg hover:shadow-xl"
                            >
                                + Generate New Meal
                            </Link>
                        </header>

                        {/* --- DIETARY PREFERENCES (Quick View) --- */}
                        <section className="mb-16">
                            <h2 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
                                <span className="text-xl">🧬</span> Dietary DNA
                            </h2>
                            <div className="glass-panel p-6 flex flex-wrap gap-4">
                                {Object.entries(preferences).filter(([k, v]) => typeof v === 'boolean').map(([key, value]) => (
                                    <button
                                        key={key}
                                        onClick={() => togglePref(key)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${value
                                            ? 'bg-accent-wa text-white border-accent-wa'
                                            : 'bg-transparent text-text-secondary border-glass-border hover:border-text-secondary'
                                            }`}
                                    >
                                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* --- SAVED GENERATIONS --- */}
                        <section>
                            <h2 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
                                <span className="text-xl">🕰️</span> Generative History
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {/* Card 1 */}
                                <div className="glass-panel overflow-hidden group cursor-pointer hover:-translate-y-1 transition-transform duration-300">
                                    <div className="h-48 bg-stone-200 w-full relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-red-50"></div>
                                        <div className="absolute inset-0 flex items-center justify-center text-text-secondary/30 font-mono text-sm">[Render #492]</div>
                                        <div className="absolute top-4 right-4 bg-white/80 backdrop-blur px-2 py-1 rounded text-xs font-bold text-text-primary shadow-sm">Booked</div>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-xl font-display font-bold text-text-primary mb-1">Spiced Jollof Deconstruction</h3>
                                        <p className="text-xs text-text-secondary uppercase tracking-widest mb-4">Ikoyi London • 14 Dec</p>
                                        <button className="w-full py-2 rounded border border-glass-border text-text-secondary text-sm hover:bg-text-primary hover:text-bg-primary transition-colors">View Receipt</button>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </>
                ) : (
                    /* --- PROFILE VIEW --- */
                    <div className="max-w-3xl mx-auto">
                        <header className="mb-12">
                            <h1 className="text-3xl font-display font-bold text-text-primary mb-2">Engine Settings</h1>
                            <p className="text-text-secondary">Input your biometrics and optimization parameters for the Nusion Engine.</p>
                        </header>

                        <div className="glass-panel p-8 space-y-8">

                            {/* Personal Info */}
                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                {/* Profile Photo Upload */}
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-24 h-24 rounded-full bg-bg-secondary border-2 border-dashed border-accent-wa flex items-center justify-center relative overflow-hidden group cursor-pointer hover:border-solid hover:shadow-lg transition-all">
                                        {preferences.photo ? (
                                            <img src={preferences.photo} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-2xl text-accent-wa">📷</span>
                                        )}
                                        <input
                                            type="file"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => handleChange('photo', reader.result);
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                    </div>
                                    <span className="text-xs text-text-secondary uppercase">Upload Photo</span>
                                </div>

                                <div className="flex-1 grid md:grid-cols-2 gap-6 w-full">
                                    <div className="space-y-2">
                                        <label className="text-xs font-mono text-text-secondary uppercase">Full Name</label>
                                        <input
                                            type="text"
                                            value={preferences.name || user?.name || ''}
                                            onChange={(e) => handleChange('name', e.target.value)}
                                            placeholder="Enter your name"
                                            className="glass-input bg-white/50 focus:bg-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-mono text-text-secondary uppercase">Email</label>
                                        <input type="text" value={user?.email || ''} readOnly className="glass-input opacity-60 cursor-not-allowed" />
                                    </div>
                                </div>
                            </div>

                            <div className="w-full h-px bg-glass-border"></div>

                            {/* Optimization Metrics */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-mono text-text-secondary uppercase">Primary Location</label>
                                    <select
                                        value={preferences.location || ''}
                                        onChange={(e) => handleChange('location', e.target.value)}
                                        className="glass-input bg-white/50 focus:bg-white appearance-none"
                                    >
                                        <option value="" disabled>Select Location</option>
                                        <option value="London">London, UK</option>
                                        <option value="New York">New York, USA</option>
                                        <option value="Lagos">Lagos, Nigeria</option>
                                        <option value="Tokyo">Tokyo, Japan</option>
                                        <option value="Paris">Paris, France</option>
                                        <option value="Accra">Accra, Ghana</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-mono text-text-secondary uppercase">Budget Range</label>
                                    <select
                                        value={preferences.budget}
                                        onChange={(e) => handleChange('budget', e.target.value)}
                                        className="glass-input bg-white/50 focus:bg-white appearance-none"
                                    >
                                        <option value="$">$ (Cheap Eats)</option>
                                        <option value="$$">$$ (Casual)</option>
                                        <option value="$$$">$$$ (Upscale)</option>
                                        <option value="$$$$">$$$$ (Fine Dining)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-mono text-text-secondary uppercase">Specific Allergies & Aversions</label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {['Peanuts', 'Shellfish', 'Dairy', 'Gluten', 'Soy', 'Eggs', 'Tree Nuts', 'Fish'].map(allergen => {
                                        const isActive = (preferences.allergiesList || []).includes(allergen);
                                        return (
                                            <button
                                                key={allergen}
                                                onClick={() => {
                                                    const current = preferences.allergiesList || [];
                                                    const updated = isActive
                                                        ? current.filter(a => a !== allergen)
                                                        : [...current, allergen];
                                                    handleChange('allergiesList', updated);
                                                }}
                                                className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${isActive
                                                    ? 'bg-red-500 text-white border-red-500' // Alert color for allergies
                                                    : 'bg-transparent text-text-secondary border-glass-border hover:border-text-secondary'
                                                    }`}
                                            >
                                                {allergen}
                                            </button>
                                        )
                                    })}
                                </div>
                                <textarea
                                    rows="2"
                                    value={preferences.allergies || ''}
                                    onChange={(e) => handleChange('allergies', e.target.value)}
                                    placeholder="Any other restrictions? (e.g. Cilantro, Mushrooms...)"
                                    className="glass-input bg-white/50 focus:bg-white"
                                ></textarea>
                            </div>

                            {/* Save Indicator */}
                            <div className="flex justify-end items-center gap-2 pt-4">
                                <span className="text-xs text-green-600 font-mono animate-pulse">● System Saving...</span>
                            </div>

                        </div>
                    </div>
                )}

                <div className="mt-20 border-t border-glass-border pt-8 text-center">
                    <button onClick={handleLogout} className="text-text-secondary hover:text-text-primary text-sm">
                        Sign Out
                    </button>
                </div>
            </main>
        </div>
    );
};

export default DinerDashboard;
