import { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { currentConfig } from '../config/restaurantConfig';

const RecommendationResult = ({ result, onReset }) => {
    const cardRef = useRef(null);
    const [activeHeritage, setActiveHeritage] = useState(null);
    // Use courses directly without processing - Pollinations URLs work fine
    const processedCourses = result.courses;

    const downloadRef = useRef(null);

    const handleDownload = async () => {
        if (downloadRef.current) {
            // Slight delay to ensure rendering
            await new Promise(resolve => setTimeout(resolve, 100));
            const canvas = await html2canvas(downloadRef.current, {
                backgroundColor: '#fdfbf7',
                scale: 2,
                useCORS: true,
                allowTaint: true
            });
            const link = document.createElement('a');
            link.download = 'Nusion-Ikoyi-Menu.png';
            link.href = canvas.toDataURL();
            link.click();
        }
    };

    if (result.error) {
        return (
            <div className="text-center py-8">
                <h3 className="text-2xl text-red-400 mb-4 font-bold">Kitchen Overload</h3>
                <p className="text-text-secondary mb-8 max-w-md mx-auto">{result.error}</p>
                <button onClick={onReset} className="btn-primary px-8">Try Adjusting Inputs</button>
            </div>
        );
    }

    const { totalCost, narrative } = result;

    return (
        <div className="w-full text-center animate-[fadeIn_1s] pb-20">
            {/* Physical Menu Card */}
            <div ref={cardRef} className="menu-card flex flex-col items-center">
                {/* Header */}
                <div className="mb-12 border-b border-[var(--color-gold)]/30 pb-8 w-full max-w-lg mx-auto">
                    <span className="text-[10px] tracking-[0.4em] uppercase text-[var(--color-gold)] font-cinzel block mb-2">
                        Immersive Dining
                    </span>
                    <h2 className="text-4xl md:text-5xl font-cinzel text-[var(--color-charcoal)] mb-4">
                        The Tasting Menu
                    </h2>
                    <p className="font-serif italic text-[var(--color-charcoal)]/60 text-lg">
                        Curated for You
                    </p>
                </div>

                {/* Narrative "Letter" */}
                <div className="mb-16 max-w-2xl text-center px-8 relative">
                    <span className="text-4xl text-[var(--color-gold)] font-serif absolute -top-4 -left-4 opacity-20">“</span>
                    <p className="font-serif text-[var(--color-charcoal)]/80 text-xl leading-relaxed italic">
                        {narrative}
                    </p>
                    <span className="text-4xl text-[var(--color-gold)] font-serif absolute -bottom-8 -right-4 opacity-20">”</span>
                </div>

                {/* Courses List */}
                <div className="w-full max-w-2xl flex flex-col gap-12 mb-12">
                    {processedCourses.map((course, index) => (
                        <div key={course.id} className="group relative flex flex-col items-center">
                            <span className="text-[9px] uppercase tracking-[0.3em] text-[var(--color-gold)] mb-2 font-cinzel">
                                {index === 0 ? 'First Course' : index === 1 ? 'Main Course' : 'Dessert'}
                            </span>
                            <h3 className="text-2xl md:text-3xl font-serif font-bold text-[var(--color-charcoal)] mb-2">
                                {course.name}
                            </h3>
                            <p className="text-[var(--color-charcoal)]/70 font-serif mb-6 max-w-md leading-relaxed">
                                {course.description}
                            </p>

                            {/* Course Image */}
                            {course.image && (
                                <div className="w-full max-w-md mb-6 rounded-2xl overflow-hidden shadow-lg">
                                    <img
                                        src={course.image}
                                        alt={course.name}
                                        className="w-full h-64 object-cover"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}

                            {/* Metadata Line */}
                            <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest text-[var(--color-charcoal)]/40 font-cinzel">
                                <span>{course.flavorProfile}</span>
                                <span className="w-1 h-1 bg-[var(--color-gold)] rounded-full"></span>
                                <span>{currentConfig.currency}{course.cost}</span>
                            </div>

                            {/* Optional: Hover Image Reveal? Keeping it simple for now, maybe add a subtle reveal later */}
                        </div>
                    ))}
                </div>

                {/* Footer Sum */}
                <div className="mt-8 pt-8 border-t border-[var(--color-charcoal)]/10 w-full max-w-xs">
                    <div className="flex justify-between items-end font-cinzel text-[var(--color-charcoal)]">
                        <span className="text-xs tracking-widest opacity-60">Total</span>
                        <span className="text-xl border-b border-[var(--color-gold)] pb-1">
                            {currentConfig.currency}{totalCost}
                        </span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col md:flex-row gap-6 justify-center items-center mt-16 animate-[fadeIn_1.4s]">
                <button
                    onClick={onReset}
                    className="text-[10px] uppercase tracking-[0.2em] text-white/50 hover:text-[var(--color-gold)] transition-colors font-cinzel"
                >
                    Discard & Start Over
                </button>
                <div className="flex gap-4">
                    <button
                        onClick={handleDownload}
                        className="btn-gold"
                    >
                        Save Menu
                    </button>
                    <a
                        href="https://ikoyilondon.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-gold bg-[var(--color-gold)] !text-[var(--color-midnight)] hover:!bg-white"
                    >
                        Reserve Table
                    </a>
                </div>
            </div>
        </div>
    );
};

export default RecommendationResult;
