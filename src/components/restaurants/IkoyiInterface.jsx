import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { currentConfig } from '../../config/restaurantConfig';
import InputForm from '../InputForm';
import RecommendationResult from '../RecommendationResult';
import { getRecommendation } from '../../utils/recommendationLogic';
import { generateDishImage } from '../../utils/imageGenerator';

function IkoyiInterface({ user }) {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [loadingPhase, setLoadingPhase] = useState('idle');
    const [progress, setProgress] = useState(0);

    const handleCalculate = async (userData) => {
        setLoading(true);
        setLoadingPhase('consulting');
        setProgress(10);
        setResult(null);

        try {
            const textProgress = setInterval(() => {
                setProgress(p => Math.min(p + 5, 40));
            }, 200);

            await new Promise(r => setTimeout(r, 1500));

            const recommendation = getRecommendation(userData);
            clearInterval(textProgress);
            setProgress(40);

            setLoadingPhase('visualising');

            const coursesWithImages = await Promise.all(
                recommendation.courses.map(async (course, index) => {
                    try {
                        await new Promise(r => setTimeout(r, index * 200));
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
            await new Promise(r => setTimeout(r, 800));

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
    };

    return (
        <div className="w-full h-full flex flex-col items-center">
            {/* Back Button for Navigation */}
            <Link
                to="/dashboard"
                className="absolute top-8 left-8 text-text-secondary hover:text-text-primary uppercase text-xs tracking-widest font-bold z-10 flex items-center gap-2"
            >
                ← Back to Brands
            </Link>

            <div className="container mx-auto px-6 flex flex-col items-center gap-12 max-w-6xl flex-grow pt-[50px]">

                {/* Header Section */}
                <header className="text-center max-w-2xl flex flex-col items-center animate-[fadeIn_0.5s]">
                    <div className="logo-gradient mx-auto"></div>
                    <p className="text-text-secondary text-2xl font-light leading-relaxed mb-6">
                        AI-Curated Dining Experience
                    </p>
                    <p className="text-base font-bold opacity-90 mb-4 px-4">
                        Nusion AI analyzes your preferences to design the perfect multi-course meal, tailored to your budget and palate.
                    </p>
                </header>

                {/* Main Interface Section */}
                <main className="glass-panel p-6 md:p-12 w-full max-w-6xl relative overflow-hidden min-h-[500px] flex flex-col justify-center items-center transition-all duration-500 shadow-2xl">
                    {/* Decorative Top Border */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-wa to-accent-jp"></div>

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
                                    className="h-full bg-accent-jp transition-all duration-500 ease-out"
                                    style={{ width: `${progress}%` }}
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
                            <InputForm onCalculate={handleCalculate} />
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
