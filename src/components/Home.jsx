import React from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const Home = ({ user, onStart, onLogin, onSignup, onPartnerSignup }) => {
    // Get user identity from local storage if available
    const userProfile = React.useMemo(() => {
        if (!user) return { name: '', photo: null };
        try {
            const key = user.type === 'restaurant'
                ? `restaurant_profile_${user.id}`
                : `diner_preferences_${user.id}`;
            const stored = localStorage.getItem(key);
            if (stored) {
                const parsed = JSON.parse(stored);
                return {
                    name: parsed.name || user.name || '',
                    photo: parsed.photo || parsed.logoUrl || null
                };
            }
        } catch (e) {
            console.error("Error loading user profile", e);
        }
        return { name: user.name || '', photo: null };
    }, [user]);

    // Fetch Approved Brands
    React.useEffect(() => {
        const fetchBrands = async () => {
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('status', 'approved')
                .order('created_at', { ascending: false });

            if (data && data.length > 0) {
                setBrands(data);
            }
        };
        fetchBrands();
    }, []);

    const dashboardPath = user?.type === 'restaurant' ? '/dashboard/restaurant' : '/dashboard/diner';

    // --- Dynamic Brands Logic ---
    const [brands, setBrands] = React.useState([]);
    // Ensure we import supabase (if not already imported at top, we might need to add it, but let's assume standard import or pass in. 
    // Actually, Home.jsx didn't import supabase. Let's fix that in a separate chunk or reliable way or use passed props if available.
    // Checking imports... Home.jsx only has React and Link. We need to add Supabase import.


    return (
        <div className="min-h-screen w-full flex flex-col relative overflow-hidden bg-bg-primary">
            {/* Background Ambience */}
            <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-accent-wa/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
            <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-accent-jp/10 rounded-full blur-[100px] pointer-events-none"></div>

            {/* Navigation */}
            <nav className="w-full p-4 md:p-8 flex justify-between items-center z-50">
                <div className="flex items-center gap-2">
                    <img
                        src="/nusion-logo.png"
                        alt="Nusion AI"
                        className="h-8 md:h-12 w-auto opacity-90"
                        style={{ filter: 'brightness(0) saturate(100%) invert(23%) sepia(13%) saturate(928%) hue-rotate(338deg) brightness(96%) contrast(90%)' }}
                    />
                    <span className="font-display font-medium text-xl md:text-2xl text-text-primary tracking-wide opacity-80 pt-1">AI</span>
                </div>
                <div className="flex items-center gap-4 md:gap-6">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <Link
                                to={dashboardPath}
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md group ${userProfile.photo ? 'border-2 border-accent-wa/50 p-0 overflow-hidden' : 'bg-accent-wa/20 text-accent-wa font-bold hover:bg-accent-wa hover:text-white border border-accent-wa/50'}`}
                                title="Go to Dashboard"
                            >
                                {userProfile.photo ? (
                                    <img src={userProfile.photo} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'U'
                                )}
                            </Link>
                        </div>
                    ) : (
                        <>
                            <button
                                onClick={onLogin}
                                className="text-xs md:text-sm font-mono text-text-secondary hover:text-text-primary transition-colors"
                            >
                                LOG IN
                            </button>
                            <button
                                onClick={onSignup}
                                className="px-4 py-1.5 md:px-5 md:py-2 rounded-full border border-text-primary/20 text-xs md:text-sm font-mono text-text-primary hover:bg-text-primary hover:text-bg-primary transition-all"
                            >
                                SIGN UP
                            </button>
                        </>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col items-center justify-center px-4 md:px-20 z-10 pt-10 md:pt-0">
                <div className="max-w-5xl w-full text-center flex flex-col items-center">

                    {/* Badge */}
                    <div className="mb-6 md:mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent-wa/20 bg-glass-bg backdrop-blur-sm animate-[fadeIn_0.5s_ease-out]">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-xs font-mono text-text-secondary uppercase tracking-wider">Engine v4.8.0 Online</span>
                    </div>

                    {/* Main Title */}
                    <h1 className="text-4xl md:text-8xl font-display font-medium text-text-primary leading-tight md:leading-[0.9] mb-6 md:mb-8 tracking-tight animate-[slideUp_0.8s_ease-out]">
                        Real-Time <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-wa via-accent-jp to-accent-fusion italic font-serif">Meal Generation.</span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-base md:text-xl text-text-secondary max-w-2xl leading-relaxed mb-8 md:mb-12 animate-[slideUp_1s_ease-out_0.2s] px-4">
                        The first dual-platform for generative gastronomy. <br className="hidden md:block" />
                        <span className="font-bold text-accent-jp">Restaurants</span> upload real-time inventory. <span className="font-bold text-accent-wa">Diners</span> generate & book custom meals.
                    </p>

                    {/* CTA Button */}
                    <Link
                        to="/dashboard"
                        className="group relative px-6 py-3 md:px-8 md:py-4 bg-text-primary text-bg-primary rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-xl animate-[slideUp_1.2s_ease-out_0.4s] inline-block"
                    >
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-accent-wa to-accent-jp opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <span className="relative z-10 font-bold text-base md:text-lg tracking-wide flex items-center gap-2">
                            BROWSE RESTAURANTS
                            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                        </span>
                    </Link>
                </div>

                {/* --- HOW IT WORKS (New Section) --- */}
                <div className="w-full max-w-6xl mt-20 md:mt-32 mb-16 animate-[fadeIn_1.5s_ease-out_0.6s]">
                    <div className="flex flex-col items-center mb-12 md:mb-16">
                        <span className="text-accent-jp font-mono text-sm uppercase tracking-widest mb-2">The Process</span>
                        <h2 className="text-3xl md:text-5xl font-display font-bold text-text-primary">How Nusion Works</h2>
                    </div>

                    {/* Process Steps */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-[2px] bg-gradient-to-r from-accent-jp/20 via-accent-wa/20 to-accent-fusion/20 z-0"></div>

                        {/* Step 1 */}
                        <div className="relative z-10 flex flex-col items-center text-center group">
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-bg-primary border border-glass-border flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500">
                                <span className="text-2xl md:text-3xl">📥</span>
                            </div>
                            <h3 className="text-xl font-bold text-text-primary mb-2">1. Ingest</h3>
                            <p className="text-sm text-text-secondary leading-relaxed px-4">
                                Restaurants upload their <strong>Real-Time Inventory</strong>. No more static menus—just pure ingredients and culinary DNA available for generation.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="relative z-10 flex flex-col items-center text-center group">
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-bg-primary border border-accent-wa/30 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500 bg-gradient-to-br from-bg-primary to-accent-wa/10">
                                <span className="text-2xl md:text-3xl">⚙️</span>
                            </div>
                            <h3 className="text-xl font-bold text-text-primary mb-2">2. Match</h3>
                            <p className="text-sm text-text-secondary leading-relaxed px-4">
                                The Engine matches <strong>Diner Needs</strong> (dietary, mood, taste) with current <strong>Restaurant Stock</strong> to generate feasible, unique dishes.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="relative z-10 flex flex-col items-center text-center group">
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-bg-primary border border-glass-border flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500">
                                <span className="text-2xl md:text-3xl">🍽️</span>
                            </div>
                            <h3 className="text-xl font-bold text-text-primary mb-2">3. Experience</h3>
                            <p className="text-sm text-text-secondary leading-relaxed px-4">
                                Diners generate their perfect menu and <strong>Book Instantly</strong>. The kitchen receives the exact specs to prepare the generated meal.
                            </p>
                        </div>
                    </div>
                </div>

                {/* --- FEATURED BRANDS (New Section) --- */}
                <div id="brands" className="w-full max-w-6xl mt-16 md:mt-24 mb-16 animate-[fadeIn_1.5s_ease-out_0.6s]">
                    <div className="flex flex-col items-center mb-12">
                        <span className="text-accent-wa font-mono text-sm uppercase tracking-widest mb-2">Our Partners</span>
                        <h2 className="text-3xl md:text-4xl font-display font-bold text-text-primary">Featured Kitchens</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Dynamic Brand Cards or Default Ikoyi */}
                        {brands.length > 0 ? (
                            brands.map(brand => (
                                <Link
                                    key={brand.id}
                                    to={`/${(brand.name || 'brand').toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`}
                                    onClick={(e) => {
                                        if (!user) {
                                            e.preventDefault();
                                            onLogin();
                                        }
                                    }}
                                    className="group relative h-64 rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 block"
                                    style={{
                                        '--brand-accent': brand.accent_color || '#d4af37',
                                        fontFamily: brand.font === 'Tech Mono' ? 'monospace' : brand.font === 'Elegant Serif' ? 'serif' : 'inherit'
                                    }}
                                >
                                    <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors z-10"></div>
                                    <img
                                        src={brand.cover_url || "/ikoyi-interior.png"}
                                        alt={brand.name}
                                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center">
                                        {brand.logo_url ? (
                                            <img src={brand.logo_url} alt="Logo" className="h-16 w-auto mb-3 object-contain brightness-0 invert" />
                                        ) : (
                                            <h3 className="text-3xl font-display font-bold text-white mb-2">{brand.name}</h3>
                                        )}
                                        <p className="text-white/80 text-xs uppercase tracking-widest" style={{ color: brand.accent_color || 'white' }}>{brand.city || 'Global'}</p>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            /* Fallback: Static Ikoyi Card if no brands loaded yet */
                            <Link
                                to="/ikoyi"
                                onClick={(e) => {
                                    if (!user) {
                                        e.preventDefault();
                                        onLogin();
                                    }
                                }}
                                className="group relative h-64 rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 block"
                            >
                                <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors z-10"></div>
                                <img src="/ikoyi-interior.png" alt="Ikoyi" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center">
                                    <img src="/logo.png" alt="Logo" className="h-16 w-auto brightness-0 invert mb-3" />
                                    <p className="text-white/80 text-xs uppercase tracking-widest">London</p>
                                </div>
                            </Link>
                        )}

                        {/* Placeholder Card (Always Last) */}
                        <div
                            onClick={onPartnerSignup}
                            className="relative h-64 rounded-2xl overflow-hidden border border-dashed border-text-secondary/20 flex flex-col items-center justify-center bg-bg-secondary/30 group hover:bg-bg-secondary/50 transition-colors cursor-pointer"
                        >
                            <span className="text-4xl mb-4 opacity-50 group-hover:scale-110 transition-transform">✦</span>
                            <span className="text-text-secondary font-mono text-sm uppercase tracking-widest group-hover:text-text-primary transition-colors">Join the Network</span>
                        </div>
                    </div>
                </div>


                {/* Feature Grid (Split Value Prop) */}
                <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 animate-[fadeIn_1.5s_ease-out_0.6s]">

                    {/* For Restaurants */}
                    <div className="glass-panel p-8 md:p-10 flex flex-col items-start hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden group">
                        <div className="w-12 h-12 rounded-full bg-accent-jp/20 flex items-center justify-center mb-6 text-accent-jp">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                        </div>
                        <h3 className="text-2xl font-display font-bold text-text-primary mb-3">For Restaurants</h3>
                        <p className="text-text-secondary leading-relaxed mb-4">
                            <strong>Solve the Inventory Paradox.</strong> Allow customers to order off-menu dishes that perfectly utilize your <em>current</em> stock. Reduce waste while offering a premium, hyper-personalized experience that static menus can't match.
                        </p>
                        <ul className="text-sm text-text-secondary/80 space-y-2 mt-auto">
                            <li className="flex items-center gap-2">✓ Dynamic Real-Time Inventory Usage</li>
                            <li className="flex items-center gap-2">✓ Upsell Surplus Ingredients</li>
                        </ul>
                    </div>

                    {/* For Diners */}
                    <div className="glass-panel p-8 md:p-10 flex flex-col items-start hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden group">
                        <div className="w-12 h-12 rounded-full bg-accent-wa/20 flex items-center justify-center mb-6 text-accent-wa">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>
                        <h3 className="text-2xl font-display font-bold text-text-primary mb-3">For Diners</h3>
                        <p className="text-text-secondary leading-relaxed mb-4">
                            <strong>Eat Exactly What You Want.</strong> Don't settle for a static menu. Input your cravings, allergies, and mood, and let the restaurant's kitchen generate a unique menu just for you, available to book and eat tonight.
                        </p>
                        <ul className="text-sm text-text-secondary/80 space-y-2 mt-auto">
                            <li className="flex items-center gap-2">✓ Generate Custom Menus</li>
                            <li className="flex items-center gap-2">✓ Instant Booking & Pre-Order</li>
                        </ul>
                    </div>

                </div>

                {/* --- ABOUT SECTION (New) --- */}
                <div className="w-full max-w-4xl mt-24 md:mt-32 mb-20 text-center relative px-4">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-transparent to-accent-wa"></div>

                    <h2 className="text-3xl md:text-4xl font-display font-bold text-text-primary mt-20 mb-6">Speculative Design Engine</h2>

                    <div className="glass-panel p-8 md:p-14 text-left relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-wa/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                        <p className="text-lg text-text-primary leading-relaxed mb-6">
                            <strong className="text-accent-jp">Nusion</strong> is a project by <strong>Studio Aikin Karr</strong>, born from a question:
                            <em>"Why hasn't West African culture found the same global export formula as Japanese or Italian cuisine?"</em>
                        </p>

                        <p className="text-base text-text-secondary leading-relaxed mb-6">
                            The answer lies in design. Nusion is an experiment in <strong>Vernacular Evolution</strong>—taking traditional,
                            local knowledge (ingredients, history, flavors) and pushing them into the future through the lens of modern,
                            functional aesthetics.
                        </p>

                        <p className="text-base text-text-secondary leading-relaxed">
                            It asks: <em>What if a classic Hausa or Akan flavor was constrained by the functional rules of Japanese minimalism?</em>
                            This isn't just about food; it's about productizing culture in a way that is universally digestible yet authentically rooted.
                        </p>

                        <div className="mt-8 pt-8 border-t border-glass-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <span className="text-xs font-mono text-text-secondary uppercase">A Studio Aikin Karr Project</span>
                            <a href="https://aikinkarr.substack.com/p/nusion" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-accent-wa hover:underline flex items-center gap-1">
                                Read the Manifesto <span>→</span>
                            </a>
                        </div>
                    </div>
                </div>

            </main>

            <footer className="w-full p-8 text-center text-xs text-text-secondary/40 font-mono border-t border-glass-border">
                Studio AikinKarr 2026 • NusionAI Generative Gastronomy • v4.8.0
            </footer>
        </div>
    );
};

export default Home;
