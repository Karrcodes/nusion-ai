import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const Dashboard = ({ user }) => {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeBackground, setActiveBackground] = useState(null);
    const [displayBackground, setDisplayBackground] = useState(null);

    useEffect(() => {
        const fetchBrands = async () => {
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('status', 'approved')
                .order('created_at', { ascending: false });

            if (data && data.length > 0) {
                setBrands(data);
            }
            setLoading(false);
        };
        fetchBrands();
    }, []);

    // Delayed fade-out for smoother card-to-card transitions
    useEffect(() => {
        let timeout;
        if (activeBackground) {
            // Immediate update when hovering a card
            setDisplayBackground(activeBackground);
        } else {
            // Delay fade-out when leaving a card (150ms)
            timeout = setTimeout(() => {
                setDisplayBackground(null);
            }, 150);
        }
        return () => clearTimeout(timeout);
    }, [activeBackground]);

    return (
        <div className="min-h-screen w-full flex flex-col items-center p-4 md:p-8 animate-[fadeIn_0.5s] relative overflow-hidden">

            {/* Dynamic Background Layer */}
            <div
                className={`fixed inset-0 z-0 transition-opacity duration-1500 ease-in-out pointer-events-none ${displayBackground ? 'opacity-70' : 'opacity-0'}`}
                style={{
                    maskImage: 'radial-gradient(circle at center, black 0%, transparent 70%)',
                    WebkitMaskImage: 'radial-gradient(circle at center, black 0%, transparent 70%)'
                }}
            >
                {/* Darker overlay to keep text readable - Reduced since overall opacity is lower */}
                <div className="absolute inset-0 bg-black/20 z-10"></div>

                {/* The Blurred Image */}
                <img
                    src={displayBackground || ''}
                    alt="Background Ambience"
                    className="w-full h-full object-cover blur-[100px] scale-110 transition-transform duration-[20s]"
                />
            </div>

            {/* Top Navigation */}
            <nav className="w-full max-w-7xl flex justify-between items-center mb-8 md:mb-12 relative z-50">
                <Link
                    to="/"
                    className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors group"
                >
                    <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
                    <span className="text-sm font-mono uppercase tracking-widest hidden md:inline">Back Home</span>
                </Link>

                <Link to="/" className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2 cursor-pointer" title="Return to Home">
                    <img src="/nusion-logo.png" alt="Nusion" className="h-8 md:h-10 w-auto opacity-90" style={{ filter: 'brightness(0) saturate(100%) invert(23%) sepia(13%) saturate(928%) hue-rotate(338deg) brightness(96%) contrast(90%)' }} />
                    <span className="font-display font-medium text-lg md:text-xl text-text-primary tracking-wide opacity-80 pt-1">AI</span>
                </Link>

                <div className="flex items-center gap-4">
                    {user && (
                        <Link
                            to={user.type === 'restaurant' ? '/dashboard/restaurant' : '/dashboard/diner?view=profile'}
                            className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all shadow-md ${(() => {
                                if (!user) return 'key';
                                try {
                                    const key = user.type === 'restaurant'
                                        ? `restaurant_profile_${user.id}`
                                        : `diner_preferences_${user.id}`;
                                    const stored = localStorage.getItem(key);
                                    if (stored) {
                                        const parsed = JSON.parse(stored);
                                        return parsed.photo || parsed.logoUrl ? 'border-2 border-accent-wa/50 p-0 overflow-hidden' : 'bg-accent-wa/20 text-accent-wa font-bold hover:bg-accent-wa hover:text-white border border-accent-wa/50';
                                    }
                                    return 'bg-accent-wa/20 text-accent-wa font-bold hover:bg-accent-wa hover:text-white border border-accent-wa/50';
                                } catch (e) { return 'bg-accent-wa/20 text-accent-wa font-bold hover:bg-accent-wa hover:text-white border border-accent-wa/50'; }
                            })()}`}
                            title="Go to My Palate"
                        >
                            {(() => {
                                if (!user) return 'key';
                                try {
                                    const key = user.type === 'restaurant'
                                        ? `restaurant_profile_${user.id}`
                                        : `diner_preferences_${user.id}`;
                                    const stored = localStorage.getItem(key);
                                    const parsed = stored ? JSON.parse(stored) : null;
                                    const photo = parsed ? (parsed.photo || parsed.logoUrl) : null;
                                    const name = parsed?.name || user.name || 'U';

                                    return photo ? (
                                        <img src={photo} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        name.charAt(0).toUpperCase()
                                    );
                                } catch (e) {
                                    return user.name ? user.name.charAt(0).toUpperCase() : 'U';
                                }
                            })()}
                        </Link>
                    )}
                </div>
            </nav >


            <header className="text-center mb-10 md:mb-16 animate-[fadeIn_1s] flex flex-col items-center mt-8">
                <p className="text-xs md:text-sm uppercase tracking-[0.3em] text-text-secondary opacity-70">
                    Select Your Muse
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                {/* Dynamic Brand Cards or Default Ikoyi */}
                {loading ? (
                    <div className="md:col-span-2 flex justify-center py-20">
                        <div className="w-12 h-12 border-2 border-text-secondary/20 border-t-text-primary rounded-full animate-spin"></div>
                    </div>
                ) : brands.length > 0 ? (
                    brands.map(brand => (
                        <Link
                            key={brand.id}
                            to={`/${(brand.name || 'brand').toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`}
                            onMouseEnter={() => setActiveBackground(brand.cover_url)}
                            onMouseLeave={() => setActiveBackground(null)}
                            className="group cursor-pointer relative h-64 md:h-[400px] rounded-3xl overflow-hidden shadow-xl transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl block border border-white/5 z-20"
                        >
                            <div className="absolute inset-0 bg-black/60 z-10 group-hover:bg-black/40 transition-colors duration-500"></div>
                            <img
                                src={brand.cover_url || "/ikoyi-interior.png"}
                                alt={brand.name}
                                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700"
                            />

                            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-10">
                                <div className="absolute top-10 left-10 right-10 h-1 bg-gradient-to-r from-accent-wa to-accent-jp opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                <div className="text-center transform transition-transform duration-500 group-hover:-translate-y-4 flex flex-col items-center mt-10">
                                    {brand.logo_url ? (
                                        <img src={brand.logo_url} alt="Logo" className="h-12 md:h-16 w-auto mb-4 object-contain brightness-0 invert" />
                                    ) : (
                                        <h3 className="text-2xl font-display font-bold text-white mb-2">{brand.name}</h3>
                                    )}
                                    <p className="text-white/70 uppercase tracking-widest text-xs">{brand.city || 'Global'} • {brand.name}</p>
                                </div>

                                <div className="absolute bottom-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 text-center">
                                    <span className="inline-block px-6 py-2 border border-white/30 rounded-full text-white text-sm uppercase tracking-wider backdrop-blur-md">
                                        Enter Studio
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    /* Fallback Ikoyi Card */
                    <Link
                        to="/ikoyi"
                        onMouseEnter={() => setActiveBackground("/ikoyi-interior.png")}
                        onMouseLeave={() => setActiveBackground(null)}
                        className="group cursor-pointer relative h-64 md:h-[400px] rounded-3xl overflow-hidden shadow-xl transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl block border border-white/5 z-20"
                    >
                        {/* ... existing fallback content ... */}
                        <div className="absolute inset-0 bg-black/60 z-10 group-hover:bg-black/40 transition-colors duration-500"></div>
                        <img
                            src="/ikoyi-interior.png"
                            alt="Ikoyi Background"
                            className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-10">
                            <div className="absolute top-10 left-10 right-10 h-1 bg-gradient-to-r from-accent-wa to-accent-jp opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                            <div className="text-center transform transition-transform duration-500 group-hover:-translate-y-4 flex flex-col items-center mt-10">
                                <img
                                    src="/logo.png"
                                    alt="IKOYI"
                                    className="h-12 md:h-16 w-auto mb-4 object-contain mix-blend-lighten opacity-90"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextElementSibling.style.display = 'block';
                                    }}
                                />
                                <h3 className="text-2xl font-display font-bold text-white mb-2 hidden">IKOYI</h3>
                                <p className="text-white/70 uppercase tracking-widest text-xs">London • Hyper-Seasonal Spice</p>
                            </div>

                            <div className="absolute bottom-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 text-center">
                                <span className="inline-block px-6 py-2 border border-white/30 rounded-full text-white text-sm uppercase tracking-wider backdrop-blur-md">
                                    Enter Studio
                                </span>
                            </div>
                        </div>
                    </Link>
                )}

                {/* Coming Soon Card */}
                <div className="relative h-64 md:h-[400px] rounded-3xl overflow-hidden border-2 border-dashed border-text-secondary/20 flex flex-col items-center justify-center bg-bg-secondary/30">
                    <h3 className="text-xl md:text-2xl font-display font-bold text-text-secondary mb-2">Coming Soon</h3>
                    <p className="text-xs uppercase tracking-widest text-text-secondary/50">New Brand</p>
                </div>
            </div>

            <footer className="mt-auto pt-12 pb-4 text-xs text-text-secondary/40 font-mono">
                Studio AikinKarr 2026 copyright
            </footer>
        </div >
    );
};

export default Dashboard;
