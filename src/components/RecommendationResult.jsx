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
                backgroundColor: '#0f0f13', // Dark background for the image
                scale: 2,
                useCORS: true,
                allowTaint: true,
                logging: false
            });
            const link = document.createElement('a');
            link.download = 'Nusion-Ikoyi-Studio-Menu.png';
            link.href = canvas.toDataURL();
            link.click();
        }
    };

    if (result.error) {
        return (
            <div className="text-center py-20 animate-[fadeIn_0.5s]">
                <div className="inline-block p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
                    <h3 className="text-2xl text-red-400 mb-2 font-cinzel">System Overload</h3>
                    <p className="text-white/60 mb-6 max-w-md mx-auto font-light">{result.error}</p>
                    <button onClick={onReset} className="btn-gold">Reboot Studio</button>
                </div>
            </div>
        );
    }

    const { totalCost, narrative } = result;

    return (
        <div className="w-full animate-[fadeIn_1s] pb-32">

            {/* Main Glass Container */}
            <div ref={cardRef} className="relative w-full max-w-6xl mx-auto flex flex-col items-center">

                {/* Header Section */}
                <div className="text-center mb-16 relative">
                    <span className="text-[10px] tracking-[0.5em] uppercase text-[var(--color-gold)] font-cinzel block mb-4 opacity-80">
                        Nusion Studio
                    </span>
                    <h2 className="text-5xl md:text-7xl font-cinzel text-white mb-6 tracking-tight">
                        The Collection
                    </h2>
                    <p className="font-serif italic text-white/50 text-xl max-w-2xl mx-auto leading-relaxed">
                        "{narrative}"
                    </p>
                </div>

                {/* Immersive Grid Layout */}
                <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 px-4 mb-16">
                    {processedCourses.map((course, index) => (
                        <div
                            key={course.id}
                            className="group relative h-[500px] rounded-3xl overflow-hidden bg-white/5 border border-white/5 transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
                        >
                            {/* Full Background Image */}
                            <div className="absolute inset-0 w-full h-full">
                                {course.image ? (
                                    <img
                                        src={course.image}
                                        alt={course.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-black" />
                                )}
                                {/* Gradient Overlay - Always present for text readability */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-80" />
                            </div>

                            {/* Floating Content */}
                            <div className="absolute bottom-0 left-0 w-full p-8 translate-y-2 transition-transform duration-300 group-hover:translate-y-0">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[9px] uppercase tracking-[0.3em] text-[var(--color-gold)] font-cinzel">
                                        0{index + 1} // {index === 0 ? 'Start' : index === 1 ? 'Main' : 'Sweet'}
                                    </span>
                                    <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white tracking-widest">
                                        {currentConfig.currency}{course.cost}
                                    </span>
                                </div>

                                <h3 className="text-2xl font-serif font-bold text-white mb-3 leading-tight group-hover:text-[var(--color-gold)] transition-colors">
                                    {course.name}
                                </h3>

                                <p className="text-white/70 font-light text-sm line-clamp-3 mb-4 group-hover:line-clamp-none transition-all">
                                    {course.description}
                                </p>

                                <div className="flex flex-wrap gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                                    {course.flavorProfile.split(',').map((tag, i) => (
                                        <span key={i} className="text-[9px] uppercase tracking-wider text-white/40 border border-white/10 px-2 py-1 rounded-sm">
                                            {tag.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer / Total */}
                <div className="flex flex-col items-center mb-12">
                    <div className="flex items-baseline gap-4 font-cinzel text-white mb-8">
                        <span className="text-sm tracking-widest opacity-50">Total Estimation</span>
                        <span className="text-4xl text-[var(--color-gold)]">
                            {currentConfig.currency}{totalCost}
                        </span>
                    </div>

                    {/* Actions Bar */}
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                        <button
                            onClick={onReset}
                            className="text-[10px] uppercase tracking-[0.2em] text-white/30 hover:text-white transition-colors font-cinzel"
                        >
                            Reset
                        </button>

                        <div className="flex gap-4 p-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
                            <button
                                onClick={handleDownload}
                                className="px-8 py-3 rounded-full bg-transparent hover:bg-white/10 text-white text-xs font-bold tracking-[0.2em] uppercase transition-all"
                            >
                                Save Collection
                            </button>
                            <a
                                href="https://ikoyilondon.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-8 py-3 rounded-full bg-[var(--color-gold)] text-[var(--color-midnight)] text-xs font-bold tracking-[0.2em] uppercase hover:bg-white transition-colors"
                            >
                                Reserve Table
                            </a>
                        </div>
                    </div>
                </div>

                {/* Hidden Ref for High-Res Download (Off-screen but renderable) */}
                <div ref={downloadRef} className="fixed top-0 left-[-9999px] w-[1200px] p-20 bg-[#0f0f13] text-white z-[-50]">
                    <div className="text-center mb-16">
                        <h1 className="text-6xl font-cinzel text-[var(--color-gold)] mb-6">NUSION x IKOYI</h1>
                        <p className="font-serif italic text-2xl text-white/60">{narrative}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-8">
                        {processedCourses.map((course, i) => (
                            <div key={i} className="flex flex-col gap-4">
                                {course.image && (
                                    <img src={course.image} className="w-full aspect-[4/5] object-cover rounded-xl" />
                                )}
                                <h3 className="text-2xl font-cinzel text-white">{course.name}</h3>
                                <p className="text-white/60 font-serif">{course.description}</p>
                                <span className="text-[var(--color-gold)] text-xl">{currentConfig.currency}{course.cost}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-16 text-center pt-16 border-t border-white/10">
                        <span className="text-3xl font-cinzel text-[var(--color-gold)]">Total: {currentConfig.currency}{totalCost}</span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default RecommendationResult;
