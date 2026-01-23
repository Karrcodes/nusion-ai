import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { currentConfig } from '../../config/restaurantConfig';
import InputForm from '../InputForm';
import RecommendationResult from '../RecommendationResult';
import { getRecommendation } from '../../utils/recommendationLogic';
import { generateDishImage } from '../../utils/imageGenerator';

function IkoyiInterface({ user }) {
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
        logoUrl: null, // If null, use default Nusion branding
        accentColor: '#d4af37', // Default Gold
        font: 'Modern Sans',
        uiStyle: 'soft'
    });

    const [liveMenu, setLiveMenu] = useState([]);

    useEffect(() => {
        // "Connect" to the Restaurant Dashboard by reading the shared profile state
        try {
            // Priority: User-specific profile > Global profile > Config default
            const userKey = user?.id ? `restaurant_profile_${user.id}` : 'restaurant_profile';
            const savedProfile = localStorage.getItem(userKey) || localStorage.getItem('restaurant_profile');

            if (savedProfile) {
                try {
                    const parsed = JSON.parse(savedProfile);
                    setBrand(prev => ({
                        ...prev,
                        name: parsed.name || (user?.id ? user.name : 'Nusion AI'),
                        logoUrl: parsed.logoUrl,
                        accentColor: parsed.accentColor || '#d4af37',
                        font: parsed.font || 'Modern Sans',
                        uiStyle: parsed.uiStyle || 'soft'
                    }));
                } catch (e) {
                    console.warn("Corrupt profile data", e);
                }
            } else if (user?.name) {
                // Fallback to user metadata name if no profile saved yet
                setBrand(prev => ({ ...prev, name: user.name }));
            }

            // Load Live Menu
            const menuKey = user?.id ? `restaurant_menu_${user.id}` : 'restaurant_live_menu';
            const savedMenu = localStorage.getItem(menuKey) || localStorage.getItem('restaurant_live_menu');
            if (savedMenu) {
                try {
                    setLiveMenu(JSON.parse(savedMenu));
                } catch (e) {
                    console.warn("Corrupt menu data", e);
                }
            }
        } catch (e) {
            console.error("Failed to sync brand settings", e);
        }
    }, [user?.id]); // Watch for user ID to re-sync if session changes

    // Derived Styles
    const fontClass = {
        'Modern Sans': 'font-sans',
        'Elegant Serif': 'font-serif',
        'Tech Mono': 'font-mono'
    }[brand.font] || 'font-sans';

    const roundedClass = brand.uiStyle === 'sharp' ? 'rounded-none' : 'rounded-3xl';
    const btnRoundedClass = brand.uiStyle === 'sharp' ? 'rounded-none' : 'rounded-full';

    // Inject CSS Custom Properties for children to use
    const dynamicStyle = {
        '--brand-accent': brand.accentColor,
        fontFamily: brand.font === 'Tech Mono' ? 'monospace' : brand.font === 'Elegant Serif' ? 'serif' : 'sans-serif' // Fallback
    };

    const handleCalculate = async (userData) => {
        setLoading(true);
        setLoadingPhase('consulting');
        setProgress(10);
        setResult(null);

        try {
            const textProgress = setInterval(() => {
                setProgress(p => Math.min(p + 5, 40));
            }, 200);

            await new Promise(r => setTimeout(r, 600)); // Consulting Reduced

            const recommendation = getRecommendation(userData, liveMenu);
            clearInterval(textProgress);

            // Handle Generation Errors (Budget too low, Menu Empty, etc.)
            if (recommendation.error) {
                setResult({ error: recommendation.error });
                return;
            }

            setProgress(40);

            setLoadingPhase('visualising');
            console.log('🎨 Starting image generation for', recommendation.courses.length, 'courses');

            // SEQUENTIAL GENERATION LOOPS (Strict Rate Limit Protection)
            // We use a simple for-loop instead of Promise.all to ensure one finishes before the next starts.

            const coursesWithImages = [];

            for (let i = 0; i < recommendation.courses.length; i++) {
                const course = recommendation.courses[i];
                console.log(`🖼️ Generating image ${i + 1}/${recommendation.courses.length} for:`, course.name);

                try {
                    // Stagger: Wait 2.5s before making the request (except potentially the first one, but consistency is safer)
                    // if (i > 0) {
                    //      await new Promise(r => setTimeout(r, 2500)); 
                    // }

                    // TEMP: Disable AI Generation for Testing Speed
                    // const imageUrl = await generateDishImage(course.description);
                    const imageUrl = "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800"; // Placeholder

                    console.log(`✅ Image generated for ${course.name}:`, imageUrl);
                    coursesWithImages.push({ ...course, image: imageUrl });

                    // Update progress (Faster)
                    setProgress(prev => Math.min(prev + (60 / recommendation.courses.length), 95));
                } catch (err) {
                    console.error(`❌ Failed to generate image for ${course.name}`, err);
                    coursesWithImages.push({ ...course, image: null });
                }
            }

            console.log('🎨 Image generation complete. Courses with images:', coursesWithImages);

            setLoadingPhase('plating');
            setProgress(100);
            await new Promise(r => setTimeout(r, 400)); // Plating Reduced

            const finalResult = { ...recommendation, courses: coursesWithImages, date: new Date().toISOString() };
            setResult(finalResult);

            // Persist to Supabase
            if (user?.id) {
                try {
                    const { error } = await supabase
                        .from('generations')
                        .insert([
                            {
                                user_id: user.id,
                                courses: coursesWithImages,
                                total_cost: recommendation.totalCost,
                                narrative: recommendation.narrative
                            }
                        ]);

                    if (error) throw error;
                    console.log("Generation saved to Supabase");
                } catch (e) {
                    console.error("Failed to save history to Supabase", e);
                    // Fallback or alert? For now silent fail/log is acceptable as per MVP.
                }
            }

        } catch (error) {
            console.error("Error calling API:", error);
            setResult({ error: "The Chef is currently overwhelmed. Please try again in a moment." });
        } finally {
            setLoading(false);
            setLoadingPhase('idle');
        }
    };

    const reset = () => {
        setResult(null);
        setProgress(0);
        // Clear location state history so back doesn't get weird? 
        // Actually, internal state reset is fine.
    };

    return (
        <div
            className={`w-full min-h-screen flex flex-col items-center relative transition-all duration-500 overflow-hidden bg-[var(--color-midnight)]`}
        >
            {/* Minimal Background Gradient */}
            <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_center,_transparent_0%,_#0f0f13_90%)]"></div>


            {/* Navigation Header */}
            <div className="absolute top-0 left-0 w-full px-8 py-6 flex justify-between items-start z-50 pointer-events-none">
                {/* Back Button */}
                <Link
                    to="/dashboard"
                    className={`pointer-events-auto text-white/50 hover:text-white uppercase text-[10px] tracking-[0.2em] font-cinzel transition-all flex items-center gap-2`}
                >
                    <span className="text-[var(--color-gold)]">←</span> Studio
                </Link>

                {/* Profile Button */}
                {user && (
                    <Link
                        to={user.type === 'restaurant' ? '/dashboard/restaurant?view=profile' : '/dashboard/diner?view=profile'}
                        className={`pointer-events-auto group flex items-center gap-3 transition-all opacity-70 hover:opacity-100`}
                        title="Go to Profile"
                    >
                        <span className="text-[10px] font-cinzel uppercase text-white tracking-widest group-hover:text-[var(--color-gold)] transition-colors pr-2">
                            {user.type === 'restaurant' ? brand.name : (user.name || 'LIST')}
                        </span>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all bg-[var(--color-charcoal)] border border-[var(--color-gold-dim)]`}>
                            {userPhoto ? (
                                <img src={userPhoto} alt="Profile" className="w-full h-full object-cover rounded-full grayscale hover:grayscale-0 transition-all" />
                            ) : (
                                <span className="font-cinzel text-[var(--color-gold)]">
                                    {user.type === 'restaurant' ? brand.name.charAt(0).toUpperCase() : (user.name ? user.name.charAt(0).toUpperCase() : 'U')}
                                </span>
                            )}
                        </div>
                    </Link>
                )}
            </div>

            <div className="container mx-auto px-6 flex flex-col items-center gap-12 max-w-6xl flex-grow pt-[120px] relative z-10">

                {/* Header Section */}
                <header className="text-center max-w-2xl flex flex-col items-center animate-[fadeIn_0.8s] mt-12 mb-16">
                    <h1 className="text-5xl md:text-7xl font-cinzel text-[var(--color-cream)] mb-4 tracking-[0.1em] drop-shadow-lg">
                        {brand.name === 'Nusion AI' ? 'THE STUDIO' : brand.name}
                    </h1>
                    <div className="w-16 h-[1px] bg-[var(--color-gold)] mb-6 opacity-60"></div>
                    <p className="text-[var(--color-cream)]/60 text-lg font-serif italic tracking-wide">
                        Speculative Gastronomy
                    </p>
                </header>

                {/* Main Interface Section */}
                <main className={`w-full max-w-5xl relative min-h-[500px] flex flex-col justify-center items-center transition-all duration-500`}>

                    {loading ? (
                        <div className="flex flex-col items-center w-full max-w-md animate-[fadeIn_0.5s]">
                            {/* Sleek Minimal Loader - No Emojis */}
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
                    ) : result ? (
                        <RecommendationResult result={result} onReset={reset} brandName={brand.name} />
                    ) : (
                        <div className="w-full max-w-4xl animate-[fadeIn_1.2s]">
                            <InputForm onCalculate={handleCalculate} />
                        </div>
                    )}
                </main>
                {/* Footer */}
                <footer className="w-full py-8 text-white/20 flex justify-center text-[10px] uppercase tracking-[0.3em] font-cinzel mt-20">
                    <span>Nusion AI &copy; 2024</span>
                </footer>
            </div>
        </div>
    );
}
export default IkoyiInterface;
