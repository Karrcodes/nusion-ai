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
        name: 'Nusion AI',
        logoUrl: null, // If null, use default Nusion branding
        accentColor: '#10b981', // Default Emerald
        font: 'Modern Sans',
        uiStyle: 'soft'
    });

    const [liveMenu, setLiveMenu] = useState([]);

    useEffect(() => {
        // "Connect" to the Restaurant Dashboard by reading the shared profile state
        // In a real app, this would fetch from Supabase based on the URL slug (e.g. /ikoyi)
        try {
            const savedProfile = localStorage.getItem('restaurant_profile');
            if (savedProfile) {
                try {
                    const parsed = JSON.parse(savedProfile);
                    setBrand(prev => ({
                        ...prev,
                        name: parsed.name || 'Nusion AI',
                        logoUrl: parsed.logoUrl,
                        accentColor: parsed.accentColor || '#10b981',
                        font: parsed.font || 'Modern Sans',
                        uiStyle: parsed.uiStyle || 'soft'
                    }));
                } catch (e) {
                    console.warn("Corrupt profile data", e);
                }
            }

            // Load Live Menu
            const savedMenu = localStorage.getItem('restaurant_live_menu');
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
    }, []);

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

            const coursesWithImages = await Promise.all(
                recommendation.courses.map(async (course, index) => {
                    try {
                        await new Promise(r => setTimeout(r, index * 50)); // Stagger Reduced
                        const imageUrl = await generateDishImage(course.description);
                        setProgress(prev => Math.min(prev + 20, 95));
                        return { ...course, image: imageUrl };
                    } catch (err) {
                        console.error(`Failed to generate image for ${course.name}`, err);
                        return { ...course, image: null };
                    }
                })
            );

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
            className={`w-full h-full flex flex-col items-center relative transition-all duration-500 overflow-hidden ${fontClass}`}
            style={dynamicStyle}
        >
            {/* Ambient Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-accent-jp/5 rounded-full blur-[100px] animate-[pulse_8s_infinite]"></div>
                <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-accent-wa/5 rounded-full blur-[120px] animate-[pulse_12s_infinite_1s]"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[400px] h-[400px] bg-accent-fusion/5 rounded-full blur-[80px] animate-[pulse_10s_infinite_2s]"></div>
            </div>


            {/* Navigation Header */}
            <div className="absolute top-0 left-0 w-full px-8 py-6 flex justify-between items-start z-50 pointer-events-none">
                {/* Back Button */}
                <Link
                    to="/dashboard"
                    className={`pointer-events-auto text-text-secondary hover:text-text-primary uppercase text-xs tracking-widest font-bold flex items-center gap-2 bg-white/40 backdrop-blur-md px-6 py-3 border border-white/50 hover:bg-white hover:scale-105 transition-all shadow-sm ${btnRoundedClass}`}
                >
                    <span className="text-accent-jp mr-1">←</span> Back to Studio
                </Link>

                {/* Profile Button */}
                {user && (
                    <Link
                        to="/dashboard/diner?view=profile"
                        className={`pointer-events-auto group flex items-center gap-3 bg-white/50 backdrop-blur-sm pl-4 pr-1 py-1 border border-glass-border hover:bg-white transition-all shadow-sm hover:shadow ${btnRoundedClass}`}
                        title="Go to Profile"
                    >
                        <span className="text-xs font-mono uppercase text-text-secondary group-hover:text-text-primary transition-colors pr-2">
                            {user.name || 'Profile'}
                        </span>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${userPhoto ? 'border border-accent-wa/30 p-0 overflow-hidden' : 'bg-accent-wa/20 text-accent-wa font-bold'}`}>
                            {userPhoto ? (
                                <img src={userPhoto} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                user.name ? user.name.charAt(0).toUpperCase() : 'U'
                            )}
                        </div>
                    </Link>
                )}
            </div>

            <div className="container mx-auto px-6 flex flex-col items-center gap-12 max-w-6xl flex-grow pt-[120px] relative z-10">

                {/* Header Section */}
                <header className="text-center max-w-2xl flex flex-col items-center animate-[slideUp_0.5s_ease-out] relative">
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-accent-jp/10 rounded-full blur-3xl pointer-events-none"></div>

                    {brand.logoUrl ? (
                        <div
                            className="mb-6 z-10 hover:scale-105 transition-transform duration-500 drop-shadow-lg"
                            style={{
                                maskImage: `url(${brand.logoUrl})`,
                                WebkitMaskImage: `url(${brand.logoUrl})`,
                                backgroundColor: brand.accentColor,
                                width: '5rem',
                                height: '5rem'
                            }}
                        ></div>
                    ) : (
                        <div className="w-20 h-20 bg-accent-jp rounded-full mb-6 z-10 flex items-center justify-center text-4xl shadow-lg border-4 border-white">🍽️</div>
                    )}

                    <h1 className="text-4xl md:text-5xl font-display font-bold text-text-primary mb-3 drop-shadow-sm tracking-tight" style={{ color: brand.accentColor }}>{brand.name}</h1>
                    <p className="text-text-secondary text-base md:text-lg uppercase tracking-widest font-medium mb-6 animate-[fadeIn_0.5s_0.2s]">
                        Speculative Gastronomy Engine
                    </p>
                </header>

                {/* Main Interface Section */}
                <main className={`glass-panel border-white/60 p-8 md:p-14 w-full max-w-5xl relative overflow-hidden min-h-[500px] flex flex-col justify-center items-center transition-all duration-500 shadow-2xl ${roundedClass}`}>
                    {/* Decorative Top Border */}
                    <div
                        className="absolute top-0 left-0 w-full h-1"
                        style={{ background: `linear-gradient(to right, ${brand.accentColor}, ${brand.accentColor}88)` }}
                    ></div>

                    {loading ? (
                        <div className="flex flex-col items-center w-full max-w-md">
                            <div className="text-5xl mb-6 animate-bounce">
                                {loadingPhase === 'consulting' && '👨‍🍳'}
                                {loadingPhase === 'visualising' && '🎨'}
                                {loadingPhase === 'plating' && '🍽️'}
                            </div>

                            <h3 className="text-xl font-bold text-text-primary mb-2 tracking-wide uppercase">
                                {loadingPhase === 'consulting' && 'Consulting Chef...'}
                                {loadingPhase === 'visualising' && 'Designing Presentation...'}
                                {loadingPhase === 'plating' && 'Plating Dishes...'}
                            </h3>

                            <div className="w-full h-1 bg-black/5 rounded-full mt-4 overflow-hidden">
                                <div
                                    className="h-full transition-all duration-500 ease-out"
                                    style={{ width: `${progress}%`, backgroundColor: brand.accentColor }}
                                ></div>
                            </div>
                            <p className="text-xs text-text-secondary mt-2 font-bold opacity-60 uppercase tracking-widest">
                                {progress}% Complete
                            </p>
                        </div>
                    ) : result ? (
                        <RecommendationResult result={result} onReset={reset} />
                    ) : (
                        <div className="w-full max-w-3xl animate-[fadeIn_0.8s]">
                            <h2 className="text-3xl mb-2 text-center text-text-primary text-4xl">Design Your Menu</h2>
                            <p className="text-center text-text-secondary mb-8 text-lg">Tell us your constraints, and we'll craft the experience.</p>
                            <InputForm onCalculate={handleCalculate} accentColor={brand.accentColor} uiStyle={brand.uiStyle} />
                        </div>
                    )}
                </main>
                {/* Footer */}
                <footer className="w-full py-8 text-text-secondary opacity-50 flex justify-center text-sm items-center mt-12 gap-2">
                    <span className="tracking-widest uppercase text-xs">Powered by</span>
                    <Link
                        to="/"
                        className="flex items-center gap-1 cursor-pointer hover:opacity-100 transition-opacity"
                        title="Return to Home"
                    >
                        <img
                            src="/nusion-logo.png"
                            alt="Nusion"
                            className="h-4 w-auto opacity-70"
                            style={{ filter: 'brightness(0) saturate(100%) invert(23%) sepia(13%) saturate(928%) hue-rotate(338deg) brightness(96%) contrast(90%)' }}
                        />
                        <span className="font-bold text-xs tracking-tighter">AI</span>
                    </Link>
                </footer>
            </div>
        </div>
    );
}
export default IkoyiInterface;
