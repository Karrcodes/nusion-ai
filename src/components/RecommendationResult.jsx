import { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { currentConfig } from '../config/restaurantConfig';
import OriginModal from './OriginModal';
import { Globe3D } from './Globe3D';

const RecommendationResult = ({ result, onReset }) => {
    const cardRef = useRef(null);
    const [selectedCourse, setSelectedCourse] = useState(null);
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

    const totalCost = result.totalCost || result.total_cost || 0;
    const { narrative } = result;

    return (
        <div className="w-full animate-[fadeIn_1s] pb-12">

            <OriginModal
                isOpen={!!selectedCourse}
                onClose={() => setSelectedCourse(null)}
                course={selectedCourse || {}}
            />

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
                            onClick={() => setSelectedCourse(course)}
                            className="group relative h-[520px] transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] cursor-pointer will-change-transform"
                        >
                            {/* Moving Gradient Border (Outside Frame) */}
                            <div className="moving-border-outer opacity-0 group-hover:opacity-100 transition-opacity duration-500 will-change-transform">
                                <div className="moving-border-inner animate-spin-border"></div>
                            </div>

                            {/* Inner Content Wrapper (Clipped) */}
                            <div className="absolute inset-0 rounded-3xl overflow-hidden bg-black border border-black z-10 will-change-transform">
                                {/* Full Background Image Section */}
                                <div className="absolute inset-0 w-full h-full">
                                    {course.image ? (
                                        <img
                                            src={course.image}
                                            alt={course.name}
                                            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-black" />
                                    )}
                                    {/* Primary Gradient Overlay (Static) */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-100 z-[1]" />

                                    {/* Technical Vignette & Scan-line Overlay */}
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-[2] pointer-events-none will-change-[opacity]">
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]"></div>
                                        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_2px,3px_100%] opacity-20"></div>
                                        {/* Backdrop Blur: Constant filter, transitioned via parent opacity */}
                                        <div className="absolute inset-0 backdrop-blur-[16px]"></div>
                                    </div>
                                </div>

                                {/* TOP CONTENT: Always Aligned */}
                                <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-30">
                                    <span className="text-[9px] uppercase tracking-[0.3em] text-[var(--color-gold)] font-cinzel drop-shadow-md">
                                        0{index + 1} // {index === 0 ? 'Start' : index === 1 ? 'Main' : 'Sweet'}
                                    </span>
                                    <span className="px-3 py-1.5 rounded-full bg-black/80 border border-white/20 text-xs font-bold text-white tracking-widest shadow-lg min-w-[44px] text-center">
                                        {currentConfig.currency}{course.cost}
                                    </span>
                                </div>

                                {/* Hover Hint: Technical Globe Origin Trace */}
                                <div className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-700 z-20 pointer-events-none w-full h-full flex items-center justify-center">
                                    <div className="relative w-64 h-64 flex flex-col items-center justify-center">
                                        {/* Glow Backdrop */}
                                        <div className="absolute inset-0 bg-[var(--color-gold)]/10 blur-[80px] rounded-full"></div>

                                        {/* Origin Label */}
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
                                            <span className="text-[8px] font-mono text-[var(--color-gold)] tracking-[0.4em] uppercase opacity-80">Origin Trace</span>
                                            <div className="w-8 h-[1px] bg-[var(--color-gold)]/40"></div>
                                        </div>

                                        {/* 3D Globe - Responsively scaled */}
                                        <div className="w-40 h-40 mt-6">
                                            <Globe3D
                                                lat={course.origin?.coordinates?.lat || 0}
                                                lng={course.origin?.coordinates?.lng || 0}
                                                velocityRef={{ current: 0 }}
                                                size={160}
                                            />
                                        </div>

                                        {/* Coordinates Text: Minimalist mono display */}
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-0 group-hover:opacity-100 transition-all duration-700 delay-300">
                                            <div className="w-8 h-[1px] bg-[var(--color-gold)]/40 mb-2"></div>
                                            <span className="text-[7px] font-mono text-white/90 tracking-tighter whitespace-nowrap uppercase">
                                                {course.origin?.name || 'Unknown Region'}
                                            </span>
                                            <span className="text-[7px] font-mono text-[var(--color-gold)] tracking-tighter whitespace-nowrap uppercase mt-1">
                                                {course.origin?.coordinates?.lat?.toFixed(2) || '0.00'}N / {course.origin?.coordinates?.lng?.toFixed(2) || '0.00'}E
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* BOTTOM CONTENT: Narrative - Strict Fixed Heights for Alignment */}
                                <div className="absolute bottom-0 left-0 w-full p-8 translate-y-4 transition-transform duration-300 group-hover:translate-y-0 bg-gradient-to-t from-black via-black/80 to-transparent pt-20 z-20">
                                    {/* Title: Fixed height for exact 2 lines */}
                                    <div className="h-[4.5rem] flex items-end mb-2">
                                        <h3 className="text-2xl font-serif font-bold text-white leading-tight group-hover:text-[var(--color-gold)] transition-colors line-clamp-2 drop-shadow-lg w-full">
                                            {course.name}
                                        </h3>
                                    </div>

                                    {/* Description: Fixed height for exact 3 lines */}
                                    <div className="h-[4.5em] mb-4 overflow-hidden">
                                        <p className="text-white/80 font-light text-sm leading-relaxed line-clamp-3 group-hover:text-white transition-colors drop-shadow-md">
                                            {course.description}
                                        </p>
                                    </div>

                                    {/* Tags: Fixed height container */}
                                    <div className="h-[2rem] flex items-center overflow-hidden">
                                        <div className="flex flex-wrap gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 transform translate-y-2 group-hover:translate-y-0">
                                            {course.flavorProfile.split(',').map((tag, i) => (
                                                <span key={i} className="text-[9px] uppercase tracking-wider text-white/70 border border-white/20 px-2 py-1 rounded-sm bg-black/40 backdrop-blur-md">
                                                    {tag.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer / Total */}
                <div className="flex flex-col items-center mb-12">
                    <div className="flex items-baseline gap-4 font-cinzel text-white mb-8 border-b border-white/10 pb-4">
                        <span className="text-sm tracking-widest opacity-80">Total Estimation</span>
                        <span className="text-4xl text-[var(--color-gold)] drop-shadow-[0_0_15px_rgba(229,192,123,0.3)]">
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
