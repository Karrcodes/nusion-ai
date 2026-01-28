import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { currentConfig } from '../../config/restaurantConfig';
import InputForm from '../InputForm';
import RecommendationResult from '../RecommendationResult';
import { getRecommendation } from '../../utils/recommendationLogic';
import { generateDishImage } from '../../utils/imageGenerator';
import { Globe3D } from '../Globe3D';

// Simple City Mapping
const CITY_COORDS = {
    'London': { lat: 51.5074, lng: -0.1278 },
    'New York': { lat: 40.7128, lng: -74.0060 },
    'Paris': { lat: 48.8566, lng: 2.3522 },
    'Tokyo': { lat: 35.6762, lng: 139.6503 },
    'Lagos': { lat: 6.5244, lng: 3.3792 },
    'Dubai': { lat: 25.2048, lng: 55.2708 },
    'Singapore': { lat: 1.3521, lng: 103.8198 },
    'Los Angeles': { lat: 34.0522, lng: -118.2437 },
    'San Francisco': { lat: 37.7749, lng: -122.4194 },
    'Berlin': { lat: 52.5200, lng: 13.4050 },
    'Copenhagen': { lat: 55.6761, lng: 12.5683 }
};

function StudioInterface({ user }) {
    const { brandSlug } = useParams();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [loadingPhase, setLoadingPhase] = useState('idle');
    const [progress, setProgress] = useState(0);

    // Check for historical result passed via navigation
    useEffect(() => {
        if (location.state?.historicalResult) {
            setResult(location.state.historicalResult);
        }
    }, [location.state]);

    // Load User Photo (Diner Profile)
    const [userPhoto, setUserPhoto] = useState(null);
    useEffect(() => {
        if (user?.id) {
            try {
                const stored = localStorage.getItem(`diner_preferences_${user.id}`);
                if (stored) {
                    setUserPhoto(JSON.parse(stored).photo);
                }
            } catch (e) { }
        }
    }, [user]);

    // --- DYNAMIC BRANDING LOGIC ---
    const [brand, setBrand] = useState({
        name: currentConfig.restaurantName,
        logoUrl: null,
        coverUrl: null,
        city: 'London', // Default
        accentColor: '#d4af37',
        font: 'Modern Sans',
        uiStyle: 'soft'
    });

    const [liveMenu, setLiveMenu] = useState([]);

    // --- DYNAMIC BRANDING LOGIC ---
    useEffect(() => {
        const loadBrandData = async () => {
            try {
                // 1. If we have a brandSlug, fetch directly from DB
                if (brandSlug && brandSlug !== 'ikoyi') {
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('status', 'approved'); // Fetch all approved brands

                    if (data && !error) {
                        // Find the brand that matches the slug
                        const matchedBrand = data.find(b =>
                            (b.name || '').toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') === brandSlug
                        );

                        if (matchedBrand) {
                            setBrand({
                                name: matchedBrand.name,
                                logoUrl: matchedBrand.logo_url,
                                coverUrl: matchedBrand.cover_url,
                                city: matchedBrand.location || 'London', // Use 'location' column if 'city' missing (schema usually uses location string)
                                accentColor: matchedBrand.accent_color || '#d4af37',
                                font: matchedBrand.font || 'Modern Sans',
                                uiStyle: matchedBrand.ui_style || 'soft'
                            });

                            const menuKey = `restaurant_menu_${matchedBrand.id}`;
                            const savedMenu = localStorage.getItem(menuKey);
                            if (savedMenu) setLiveMenu(JSON.parse(savedMenu));

                            return;
                        }
                    }
                }

                // 2. FALLBACK: Connect to local session 
                const userKey = user?.id ? `restaurant_profile_${user.id}` : 'restaurant_profile';
                const savedProfile = localStorage.getItem(userKey) || localStorage.getItem('restaurant_profile');

                if (savedProfile) {
                    const parsed = JSON.parse(savedProfile);
                    setBrand(prev => ({
                        ...prev,
                        name: parsed.name || (user?.id ? user.name : 'Nusion AI'),
                        logoUrl: parsed.logoUrl,
                        coverUrl: parsed.coverUrl,
                        city: parsed.location || 'London',
                        accentColor: parsed.accentColor || '#d4af37',
                        font: parsed.font || 'Modern Sans',
                        uiStyle: parsed.uiStyle || 'soft'
                    }));
                } else if (user?.name) {
                    setBrand(prev => ({ ...prev, name: user.name }));
                }

                // Load Menu Fallback
                const menuKey = user?.id ? `restaurant_menu_${user.id}` : 'restaurant_live_menu';
                const savedMenu = localStorage.getItem(menuKey) || localStorage.getItem('restaurant_live_menu');
                if (savedMenu) setLiveMenu(JSON.parse(savedMenu));

            } catch (e) {
                console.error("Failed to sync brand settings", e);
            }
        };

        loadBrandData();
    }, [user?.id, brandSlug]);

    const handleCalculate = async (userData) => {
        setLoading(true);
        setLoadingPhase('consulting');
        setProgress(10);
        setResult(null);

        try {
            const textProgress = setInterval(() => {
                setProgress(p => Math.min(p + 5, 40));
            }, 200);

            await new Promise(r => setTimeout(r, 600));

            const recommendation = getRecommendation(userData, liveMenu);
            clearInterval(textProgress);

            if (recommendation.error) {
                setResult({ error: recommendation.error });
                return;
            }

            setProgress(40);
            setLoadingPhase('visualising');

            // PARALLEL GENERATION (Faster)
            // We use Promise.all to generate all images simultaneously.

            const imagePromises = recommendation.courses.map(async (course) => {
                try {
                    const imageUrl = await generateDishImage(course.description);
                    // Update progress incrementally as each finishes
                    setProgress(prev => Math.min(prev + (60 / recommendation.courses.length), 95));
                    return { ...course, image: imageUrl };
                } catch (err) {
                    console.error(`❌ Failed to generate image for ${course.name}`, err);
                    return { ...course, image: null };
                }
            });

            const coursesWithImages = await Promise.all(imagePromises);
            console.log('🎨 Image generation complete. Courses with images:', coursesWithImages);

            setLoadingPhase('plating');
            setProgress(100);
            await new Promise(r => setTimeout(r, 400));

            const finalResult = { ...recommendation, courses: coursesWithImages, date: new Date().toISOString() };
            setResult(finalResult);

            if (user?.id) {
                try {
                    await supabase.from('generations').insert([{
                        user_id: user.id,
                        courses: coursesWithImages,
                        total_cost: recommendation.totalCost,
                        narrative: recommendation.narrative
                    }]);
                } catch (e) { }
            }

        } catch (error) {
            setResult({ error: "The Chef is currently overwhelmed. Please try again in a moment." });
        } finally {
            setLoading(false);
            setLoadingPhase('idle');
        }
    };

    const reset = () => {
        setResult(null);
        setProgress(0);
    };

    // Get Coords
    const brandLocation = brand.city || 'London'; // Default
    // Try to find exact match or partial match
    let coords = CITY_COORDS['London'];
    const cityKey = Object.keys(CITY_COORDS).find(c => brandLocation.toLowerCase().includes(c.toLowerCase()));
    if (cityKey) coords = CITY_COORDS[cityKey];


    return (
        <div className={`w-full min-h-screen flex flex-col items-center relative transition-all duration-500 overflow-hidden bg-[var(--color-midnight)]`}>

            {/* Background */}
            {brand.coverUrl && (
                <div
                    className="absolute inset-0 z-0 pointer-events-none bg-cover bg-center opacity-50 blur-xl scale-110"
                    style={{ backgroundImage: `url(${brand.coverUrl})` }}
                />
            )}
            <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_center,_transparent_0%,_#0f0f13_100%)] bg-black/20"></div>


            {/* Navigation Header */}
            <div className="absolute top-0 left-0 w-full px-8 py-6 flex justify-between items-start z-50 pointer-events-none">
                <Link to="/dashboard" className={`pointer-events-auto text-white/50 hover:text-white uppercase text-[10px] tracking-[0.2em] font-cinzel transition-all flex items-center gap-2`}>
                    <span className="text-[var(--color-gold)]">←</span> Studio
                </Link>

                {user && (
                    <Link to={user.type === 'restaurant' ? '/dashboard/restaurant?view=profile' : '/dashboard/diner?view=profile'} className={`pointer-events-auto group flex items-center gap-3 transition-all opacity-70 hover:opacity-100`} title="Go to Profile">
                        <span className="text-[10px] font-cinzel uppercase text-white tracking-widest group-hover:text-[var(--color-gold)] transition-colors pr-2">
                            {user.type === 'restaurant' ? brand.name : (user.name || 'LIST')}
                        </span>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all bg-[var(--color-charcoal)] border border-[var(--color-gold-dim)] overflow-hidden`}>
                            {userPhoto ? <img src={userPhoto} alt="Profile" className="w-full h-full object-cover rounded-full grayscale hover:grayscale-0 transition-all" /> : (
                                brand.logoUrl ? (
                                    <img
                                        src={brand.logoUrl}
                                        alt={brand.name}
                                        className="w-full h-full object-contain filter invert border-none mix-blend-screen"
                                    />
                                ) : (
                                    <span className="font-cinzel text-[var(--color-gold)]">
                                        {user.type === 'restaurant' ? brand.name.charAt(0).toUpperCase() : (user.name ? user.name.charAt(0).toUpperCase() : 'U')}
                                    </span>
                                )
                            )}
                        </div>
                    </Link>
                )}
            </div>



            <div className={`container mx-auto px-6 h-full flex-grow flex flex-col justify-center relative z-10 pt-[120px] ${result ? 'pb-[100px]' : 'pb-[150px]'} min-h-screen`}>

                {!loading && !result ? (
                    // --- SPLIT LAYOUT (Input Mode) ---
                    <div className="flex flex-col md:flex-row w-full max-w-7xl mx-auto items-center justify-between gap-12 md:gap-24 animate-[fadeIn_0.5s]">

                        {/* LEFT COLUMN: Branding & Description */}
                        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left mt-20 relative">
                            {brand.logoUrl ? (
                                <img
                                    src={brand.logoUrl}
                                    alt={brand.name}
                                    className="h-16 md:h-24 w-auto object-contain mb-6"
                                    style={{
                                        filter: 'grayscale(100%) contrast(5) invert(1)',
                                        mixBlendMode: 'screen',
                                        opacity: 0.9
                                    }}
                                />
                            ) : (
                                <h1 className="text-4xl md:text-6xl font-cinzel text-[var(--color-cream)] mb-6 tracking-[0.1em] drop-shadow-lg leading-tight">
                                    {brand.name === 'Nusion AI' ? 'THE STUDIO' : brand.name}
                                </h1>
                            )}
                            <div className="w-24 h-[1px] bg-[var(--color-gold)] mb-8 opacity-60"></div>

                            <p className="text-[var(--color-cream)]/80 text-xl font-serif italic tracking-wide mb-6">
                                Speculative Gastronomy
                            </p>

                            <p className="text-white/60 text-sm md:text-base leading-relaxed max-w-md font-light mb-12">
                                Welcome to the Generative Engine. Define your preferences, set your budget, and allow our AI to curate a bespoke tasting menu tailored precisely to your palate.
                            </p>

                            {/* Globe Widget */}
                            <div className="w-full max-w-[200px] aspect-square relative opacity-80 mix-blend-screen md:self-start">
                                <Globe3D lat={coords.lat} lng={coords.lng} size={200} />
                                <div className="absolute bottom-0 w-full text-center text-[9px] uppercase tracking-[0.3em] text-[var(--color-gold)] opacity-80">
                                    {brandLocation}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Input Form */}
                        {/* Widened to max-w-2xl, centered vertically via parent */}
                        <div className="flex-1 w-full max-w-xl bg-black/20 backdrop-blur-sm p-10 rounded-3xl border border-white/5 shadow-2xl flex flex-col justify-center">
                            <InputForm onCalculate={handleCalculate} />
                        </div>

                    </div>
                ) : (
                    // --- CENTERED LAYOUT (Loading / Result) ---
                    <main className={`w-full max-w-5xl mx-auto relative min-h-[500px] flex flex-col justify-center items-center transition-all duration-500`}>
                        {loading ? (
                            <div className="flex flex-col items-center w-full max-w-md animate-[fadeIn_0.5s]">
                                <div className="w-16 h-16 mb-8 relative">
                                    <div className="absolute inset-0 border-[1px] border-[var(--color-gold)] opacity-20 rounded-full"></div>
                                    <div className="absolute inset-0 border-t-[1px] border-[var(--color-gold)] rounded-full animate-spin"></div>
                                    <div className="absolute inset-4 border-[1px] border-[var(--color-gold)] opacity-10 rounded-full"></div>
                                </div>

                                <h3 className="text-2xl font-cinzel text-white mb-2 tracking-[0.2em] uppercase">
                                    {loadingPhase === 'consulting' && 'Analysing Palate'}
                                    {loadingPhase === 'visualising' && 'Curating Visuals'}
                                    {loadingPhase === 'plating' && 'Finalising Service'}
                                </h3>

                                <div className="w-64 h-[2px] bg-white/5 mt-8 mb-4 relative overflow-hidden rounded-full">
                                    <div
                                        className="h-full bg-[var(--color-gold)] shadow-[0_0_10px_var(--color-gold)] transition-all duration-700 ease-out"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>

                                <p className="text-[9px] text-[var(--color-gold)] font-mono tracking-[0.4em] opacity-80 animate-pulse">
                                    {loadingPhase === 'consulting' && 'AI_CHEF_INIT_SEQ_01'}
                                    {loadingPhase === 'visualising' && 'RENDERING_TEXTURES_HQ'}
                                    {loadingPhase === 'plating' && 'PLATING_COMPLETE'}
                                </p>
                            </div>
                        ) : (
                            <RecommendationResult result={result} onReset={reset} brandName={brand.name} />
                        )}
                    </main>
                )}

            </div>

            {/* Footer - Pushed to absolute bottom */}
            <footer className="absolute bottom-6 w-full text-center text-white/20 text-[10px] uppercase tracking-[0.3em] font-cinzel pointer-events-none">
                <span>Nusion AI &copy; 2026</span>
            </footer>
        </div>
    );
}
export default StudioInterface;
