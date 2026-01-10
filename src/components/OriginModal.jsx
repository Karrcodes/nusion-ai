import { useEffect, useState, useRef } from 'react';

const OriginModal = ({ isOpen, onClose, course }) => {
    const [isVisible, setIsVisible] = useState(false);
    const scrollRef = useRef(null);
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            setTimeout(() => setIsVisible(false), 300);
        }
    }, [isOpen]);

    // Handle Scroll Parallax for Globe
    const handleScroll = () => {
        if (scrollRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
            const progress = scrollTop / (scrollHeight - clientHeight);
            setScrollProgress(progress);
        }
    };

    if (!isVisible && !isOpen) return null;

    // Derived Globe State based on course coordinates & scroll
    const targetX = course.origin?.coordinates?.x || 50;
    const targetY = course.origin?.coordinates?.y || 50;

    // Animate Globe: 
    // Entry: Starts zoomed out.
    // Scroll: Zooms in and rotates towards target.
    const globeScale = 1 + (scrollProgress * 2.5); // Zoom heavily on scroll
    const globeRotate = -15 + (scrollProgress * 15); // Slight tilt change

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center transition-all duration-500 ${isOpen ? 'bg-black/95 backdrop-blur-xl opacity-100' : 'bg-black/0 backdrop-blur-none opacity-0 pointer-events-none'
                }`}
            onClick={onClose}
        >
            <div
                className={`relative w-full max-w-5xl h-[85vh] bg-[#050505] border border-white/10 rounded-none md:rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(212,175,55,0.1)] transition-all duration-700 transform ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-10'
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Background Texture (Topographical Lines / Noise) */}
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

                {/* Close Button - Apple Style Minimal */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-50 w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white/50 hover:bg-white hover:text-black transition-all duration-300 group"
                >
                    <span className="text-xl leading-none mb-1">×</span>
                </button>

                <div className="relative z-10 w-full h-full flex flex-col md:flex-row">

                    {/* Left Panel: The Story - HIDDEN SCROLLBAR */}
                    <div className="w-full md:w-[45%] h-full relative z-20 pointer-events-none">
                        {/* We use pointer-events-none on container to let clicks pass through to map if needed, 
                            but enable pointer-events-auto on the scrollable area */}
                        <div
                            ref={scrollRef}
                            onScroll={handleScroll}
                            className="absolute inset-0 overflow-y-auto no-scrollbar pointer-events-auto p-10 md:p-16"
                        >
                            <div className="min-h-[120%] pb-20"> {/* Add padding for scroll space */}
                                <span className="text-[var(--color-gold)] font-cinzel text-[10px] tracking-[0.4em] mb-8 block animate-[fadeIn_0.8s_ease-out] border-b border-[var(--color-gold)]/30 pb-4 w-max">
                                    LOG NO. {course.id?.replace(/\D/g, '') || '01'}
                                </span>

                                <h2 className="text-4xl md:text-6xl font-serif text-white mb-6 leading-none animate-[slideUp_0.8s_cubic-bezier(0.16,1,0.3,1)]">
                                    {course.name}
                                </h2>

                                <div className="space-y-20 animate-[fadeIn_1s_delay-200ms]">

                                    {/* Section 1: Introduction */}
                                    <div>
                                        <p className="text-white/80 text-lg leading-relaxed font-light">
                                            {course.originStory}
                                        </p>
                                    </div>

                                    {/* Section 2: The Source (Triggers Map Zoom) */}
                                    <div className="border-l-2 border-[var(--color-gold)] pl-6 transition-all duration-500 hover:pl-8">
                                        <h4 className="text-white/40 text-[9px] uppercase tracking-[0.2em] mb-2 font-cinzel">The Source</h4>
                                        <p className="text-3xl text-white font-serif italic mb-1">
                                            {course.origin?.region || "Unknown"}
                                        </p>
                                        <p className="text-[var(--color-gold)] text-sm tracking-widest font-mono">
                                            LAT {course.origin?.coordinates?.x}° / LON {course.origin?.coordinates?.y}°
                                        </p>
                                    </div>

                                    {/* Section 3: The Ingredient */}
                                    <div>
                                        <h4 className="text-white/40 text-[9px] uppercase tracking-[0.2em] mb-4 font-cinzel">Key botanical</h4>
                                        <div className="w-full h-48 bg-white/5 rounded-lg overflow-hidden relative group">
                                            <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-30 group-hover:opacity-50 transition-opacity">
                                                🌿
                                            </div>
                                            <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black to-transparent">
                                                <p className="text-xl text-white font-serif">{course.origin?.ingredient}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 4: Sommelier */}
                                    <div className="bg-white/5 p-8 rounded-xl backdrop-blur-sm border border-white/5">
                                        <h4 className="text-[var(--color-gold)] text-[9px] uppercase tracking-[0.2em] mb-4 font-cinzel">Sommelier's Note</h4>
                                        <p className="text-white font-serif text-xl italic mb-2">"{course.pairing}"</p>
                                        <p className="text-white/40 text-xs">Best served in a chilled crystal tulip glass.</p>
                                    </div>

                                    <div className="h-32"></div> {/* Bottom Spacer */}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: The Globe (Apple Style) */}
                    <div className="w-full md:w-[55%] h-[40vh] md:h-full absolute md:relative top-0 right-0 z-0 overflow-hidden bg-gradient-to-b from-[#0a0a0c] to-[#050505]">
                        <div className="w-full h-full flex items-center justify-center perspective-[1000px]">

                            {/* THE GLOBE CONTAINER */}
                            <div
                                className="relative w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full shadow-[inset_-20px_-20px_50px_rgba(0,0,0,0.8),0_0_50px_rgba(0,0,0,0.5)] transition-transform duration-100 ease-linear" // Smooth ease-linear for scroll response, but using React state implies steps, CSS var might be smoother for real apple feel but this works.
                                style={{
                                    transform: `scale(${globeScale}) rotateX(${20}deg) rotateY(${globeRotate}deg)`,
                                    background: `radial-gradient(circle at 30% 30%, #2a2a2e, #000)`,
                                }}
                            >
                                {/* GLOBE TEXTURE (SVG Map) */}
                                <div
                                    className="absolute inset-0 opacity-40 mix-blend-overlay animate-[spinSlow_60s_linear_infinite]"
                                    style={{
                                        animationPlayState: scrollProgress > 0 ? 'paused' : 'running' // Pause spin when user interacts/scrolls
                                    }}
                                >
                                    <svg width="100%" height="100%" viewBox="0 0 200 100" preserveAspectRatio="none">
                                        {/* Simplified World Shapes (repeated for wrap effect) */}
                                        <path d="M20,30 Q40,10 60,30 T100,20 T140,40 T180,20 V80 H20 Z" fill="#fff" opacity="0.5" />
                                        <path d="M120,60 Q140,50 160,70 T200,60" fill="none" stroke="#fff" strokeWidth="2" opacity="0.3" />
                                        {/* Grid */}
                                        <path d="M0,20 H200 M0,50 H200 M0,80 H200" stroke="#fff" strokeWidth="0.5" opacity="0.2" />
                                        <path d="M50,0 V100 M100,0 V100 M150,0 V100" stroke="#fff" strokeWidth="0.5" opacity="0.2" />
                                    </svg>
                                </div>

                                {/* Atmosphere Glow */}
                                <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-[var(--color-gold)] to-transparent opacity-10 blur-xl"></div>

                                {/* Target Marker - Rotates with globe logic effectively */}
                                <div
                                    className="absolute w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white] z-20"
                                    style={{
                                        top: `${targetY}%`,
                                        left: `${targetX}%`,
                                        transform: `translateZ(50px)` // Pseud-3D placement
                                    }}
                                >
                                    {/* Ripple */}
                                    <div className="absolute -inset-4 border border-[var(--color-gold)] rounded-full animate-ping opacity-50"></div>
                                    <div className="absolute -inset-8 border border-[var(--color-gold)] rounded-full animate-[ping_3s_infinite] opacity-20"></div>
                                </div>
                            </div>

                            {/* HUD Data Overlay */}
                            <div className="absolute bottom-8 right-8 text-right space-y-1">
                                <div className="flex items-center justify-end gap-2 text-[var(--color-gold)]">
                                    <div className="w-2 h-2 bg-[var(--color-gold)] rounded-full animate-pulse"></div>
                                    <span className="text-[10px] font-mono tracking-widest">LIVE FEED</span>
                                </div>
                                <div className="text-[9px] text-white/30 font-mono">
                                    TRAJECTORY: {Math.round(scrollProgress * 100)}% <br />
                                    ROTATION: {Math.round(globeRotate)}°
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default OriginModal;
