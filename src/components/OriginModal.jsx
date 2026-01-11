import { useEffect, useState, useRef } from 'react';
import createGlobe from 'cobe';

const OriginModal = ({ isOpen, onClose, course }) => {
    const [isVisible, setIsVisible] = useState(false);
    const canvasRef = useRef();
    const scrollRef = useRef(null); // Now points to the main container
    const [scrollProgress, setScrollProgress] = useState(0);

    // Derived Coordinates
    const targetX = course.origin?.coordinates?.x || 50;
    const targetY = course.origin?.coordinates?.y || 50;
    const basePhi = (targetX / 100) * Math.PI * 2;
    const baseTheta = (targetY / 100) * Math.PI;

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            document.body.style.overflow = 'hidden';
            document.body.style.touchAction = 'none';
        } else {
            document.body.style.overflow = 'auto';
            document.body.style.touchAction = 'auto';
            const tm = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(tm);
        }
    }, [isOpen]);

    useEffect(() => {
        return () => {
            document.body.style.overflow = 'auto';
            document.body.style.touchAction = 'auto';
        };
    }, []);

    // Scroll Progress for Rotation Logic
    const progressRef = useRef(0);
    useEffect(() => {
        progressRef.current = scrollProgress;
    }, [scrollProgress]);

    // Initialize Globe
    // FIXED: Removed width/height resizing from loop (caused crash). Using CSS for zoom.
    useEffect(() => {
        let globe;
        let onResize;
        let initTimer;

        if (isVisible) {
            // 100ms Delay to allow transition to settle and canvas to mount
            initTimer = setTimeout(() => {
                if (!canvasRef.current) return;

                let width = 0;

                // Dynamic Resize Handler
                onResize = () => {
                    if (canvasRef.current) {
                        width = canvasRef.current.offsetWidth || 600;
                    }
                };
                window.addEventListener('resize', onResize);
                onResize(); // Initial measurement

                if (width === 0) width = 600;

                globe = createGlobe(canvasRef.current, {
                    devicePixelRatio: 2,
                    width: width * 2,
                    height: width * 2,
                    phi: 0,
                    theta: 1.35, // FIXED: 1.35 = ~Equator. 0.3 was North Pole (Ocean).
                    dark: 1,
                    diffuse: 1.2,
                    mapSamples: 20000,
                    mapBrightness: 6,
                    baseColor: [0.3, 0.3, 0.3],     // Standard Dark Grey Base
                    markerColor: [1, 0.5, 0.5],     // distinct marker color
                    glowColor: [1, 1, 1],           // Bright Glow
                    opacity: 1,
                    markers: [
                        { location: [baseTheta * (180 / Math.PI) - 90, basePhi * (180 / Math.PI)], size: 0.1 }
                    ],
                    onRender: (state) => {
                        const currentProgress = progressRef.current || 0;

                        // Rotations
                        const targetPhi = (basePhi + 0.5) - (currentProgress * 2);
                        const targetTheta = 0.3 + (currentProgress * 0.5); // Still animating towards pole is fine, but start at equator

                        // Lerp
                        state.phi += (targetPhi - state.phi) * 0.08;
                        state.theta += (targetTheta - state.theta) * 0.08;

                        // Auto-spin (slow)
                        state.phi += 0.003;
                    }
                });
            }, 100);
        }

        return () => {
            if (globe) globe.destroy();
            if (initTimer) clearTimeout(initTimer);
            if (onResize) window.removeEventListener('resize', onResize);
        };
    }, [isVisible, basePhi, baseTheta]);

    // Handle Scroll on Main Container
    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        if (scrollHeight - clientHeight > 0) {
            const progress = scrollTop / (scrollHeight - clientHeight);
            setScrollProgress(progress);
        }
    };

    // Calculate Zoom & Parallax
    // Zoom: 1 -> 1.5x (Subtler)
    const zoomScale = 1 + (scrollProgress * 1.5);
    // Parallax: Globe moves UP slower than content. Content moves naturally. 
    // We add a slight translation to the globe to make it feel detached.
    // Actually, "Sticky" keeps it fixed. "Scrolls slower" means it DOES move up, but lags behind.
    // If we keep it sticky, it moves 0. If we unsticky it, it moves 1:1.
    // To make it move "slower", we can use sticky + translateY(down).
    // Or just use fixed positioning with top offset?
    // User wants: "Globe scrolls slower".
    // Implementation: Sticky top-0 + translateY(progress * 100px). As you scroll down, globe slides down slightly (counteracting scrolldown), effectively moving slower relative to viewport? 
    // Sticky means it doesn't move up at all.
    // Let's implement a parallax offset: Sticky + translateY(-progress * 20%).
    const parallaxOffset = scrollProgress * 150; // Moves down 150px as you scroll 100%

    // Text Parallax: Text Content moves slightly faster/slower? 
    // Usually text is the reference. Let's just make the globe sticky and add the slight downward drift.
    // IMPLEMENTATION NOTE: 
    // "Smoothness" in parallax comes from 1:1 sync with scroll. CSS transitions cause lag/floatiness.
    // We remove the transition on the parallax transform to make it "lock" to the finger/mouse.

    if (!isVisible && !isOpen) return null;

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center transition-all duration-500 ${isOpen ? 'bg-black/95 backdrop-blur-xl opacity-100' : 'bg-black/0 backdrop-blur-none opacity-0 pointer-events-none'
                }`}
            onClick={onClose}
        >
            <div
                className={`relative w-full max-w-5xl h-[85vh] bg-[#050505] border border-white/10 rounded-none md:rounded-3xl shadow-[0_0_100px_rgba(212,175,55,0.1)] transition-all duration-700 transform ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-10'
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Scrollable Container Wrapper */}
                <div
                    className="absolute inset-0 overflow-y-auto no-scrollbar scroll-smooth"
                    onScroll={handleScroll}
                >
                    {/* Background Noise with Radial Gradient */}
                    <div className="fixed inset-0 opacity-[0.05] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
                    <div className="fixed inset-0 bg-[radial-gradient(circle_at_right,_#1a1a1a_0%,_#000_100%)] opacity-50 z-0"></div>

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="fixed top-6 right-6 z-[60] w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white/50 hover:bg-white hover:text-black transition-all duration-300 group"
                    >
                        <span className="text-xl leading-none mb-1">×</span>
                    </button>

                    <div className="relative z-10 w-full min-h-full flex flex-col md:flex-row">

                        {/* Left Panel: Content (Flows naturally) */}
                        {/* GRADIENT FIX: Widened to 60% and used via-black/40 for a much softer, longer fade. */}
                        <div className="w-full md:w-[60%] relative z-20 pointer-events-none pt-10 md:pt-16 pb-20 pl-10 md:pl-16 pr-10 md:pr-0 bg-gradient-to-r from-black via-black/40 to-transparent">
                            <div className="pointer-events-auto max-w-xl">
                                <span className="text-[var(--color-gold)] font-cinzel text-[10px] tracking-[0.4em] mb-8 block animate-[fadeIn_0.8s_ease-out] border-b border-[var(--color-gold)]/30 pb-4 w-max">
                                    LOG NO. {course.id?.replace(/\D/g, '') || '01'}
                                </span>

                                <h2 className="text-4xl md:text-6xl font-serif text-white mb-6 leading-none animate-[slideUp_0.8s_cubic-bezier(0.16,1,0.3,1)]">
                                    {course.name}
                                </h2>

                                <div className="space-y-20 animate-[fadeIn_1s_delay-200ms]">
                                    {/* Story */}
                                    <div>
                                        <p className="text-white/80 text-lg leading-relaxed font-light">
                                            {course.originStory}
                                        </p>
                                    </div>
                                    {/* The Source */}
                                    <div className="border-l-2 border-[var(--color-gold)] pl-6 transition-all duration-500 hover:pl-8">
                                        <h4 className="text-white/40 text-[9px] uppercase tracking-[0.2em] mb-2 font-cinzel">The Source</h4>
                                        <p className="text-3xl text-white font-serif italic mb-1">
                                            {course.origin?.region || "Unknown"}
                                        </p>
                                        <div className="flex items-center gap-4 mt-2">
                                            <p className="text-[var(--color-gold)] text-xs tracking-widest font-mono">
                                                LAT {course.origin?.coordinates?.x}°
                                            </p>
                                            <p className="text-[var(--color-gold)] text-xs tracking-widest font-mono">
                                                LON {course.origin?.coordinates?.y}°
                                            </p>
                                        </div>
                                    </div>

                                    {/* Ingredient */}
                                    <div>
                                        <h4 className="text-white/40 text-[9px] uppercase tracking-[0.2em] mb-4 font-cinzel">Key botanical</h4>
                                        <div className="w-full h-48 bg-white/5 rounded-lg overflow-hidden relative group border border-white/5">
                                            <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-30 group-hover:opacity-50 transition-opacity grayscale hover:grayscale-0 duration-700">
                                                🌿
                                            </div>
                                            <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black to-transparent">
                                                <p className="text-xl text-white font-serif">{course.origin?.ingredient}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sommelier */}
                                    <div className="bg-white/5 p-8 rounded-xl backdrop-blur-sm border border-white/5 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-20 h-20 bg-[var(--color-gold)] opacity-5 blur-[50px]"></div>
                                        <h4 className="text-[var(--color-gold)] text-[9px] uppercase tracking-[0.2em] mb-4 font-cinzel">Sommelier's Note</h4>
                                        <p className="text-white font-serif text-xl italic mb-2">"{course.pairing}"</p>
                                        <p className="text-white/40 text-xs">Best served in a chilled crystal tulip glass.</p>
                                    </div>
                                    <div className="h-32"></div>
                                </div>
                            </div>
                        </div>

                        {/* Right Panel: COBE Globe (Sticky) */}
                        {/* 
                            Flexbox Note: self-start ensures sticky works inside flex container.
                            Sticky top-0 keeps it in view.
                            translate-y uses parallaxOffset to drift it down slowly.
                            -ml-40 (increased) pulls the globe deeper UNDER the widened gradient.
                        */}
                        <div className="w-full md:w-[60%] h-[40vh] md:h-auto md:sticky md:top-0 md:self-start z-0 flex items-center justify-center overflow-hidden md:-ml-40">
                            <div
                                className="relative w-full h-[600px] flex items-center justify-center md:top-0"
                                style={{ transform: `translateY(${parallaxOffset}px)` }} // Instant update (No Transition)
                            >
                                {/* CSS TRANSFORM ZOOM */}
                                <div style={{
                                    transform: `scale(${zoomScale})`,
                                    transition: 'transform 0.5s ease-out', // Keep zoom smooth (it's an effect, not a scroll response)
                                    width: 600,
                                    height: 600,
                                    maxWidth: '100%'
                                }}>
                                    <canvas
                                        ref={canvasRef}
                                        style={{ width: '100%', height: '100%', aspectRatio: '1' }}
                                        className="opacity-100 transition-opacity duration-1000 ease-in"
                                    />
                                </div>

                                {/* Overlay for Text Contrast when overlapping */}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent pointer-events-none md:hidden"></div>
                            </div>

                            {/* Status Overlay */}
                            <div className="absolute bottom-10 right-10 text-right pointer-events-none">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                                    <div className="w-1.5 h-1.5 bg-[var(--color-gold)] rounded-full animate-pulse"></div>
                                    <span className="text-[9px] font-mono tracking-widest text-[var(--color-gold)]">LIVE SATELLITE</span>
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
