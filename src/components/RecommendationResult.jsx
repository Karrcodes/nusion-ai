import { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { currentConfig } from '../config/restaurantConfig';

const RecommendationResult = ({ result, onReset }) => {
    const cardRef = useRef(null);
    const [activeHeritage, setActiveHeritage] = useState(null);
    const [processedCourses, setProcessedCourses] = useState(result.courses);

    // Convert images to Base64/Blob URL to ensure html2canvas can capture them
    useEffect(() => {
        const processImages = async () => {
            const newCourses = await Promise.all(result.courses.map(async (course) => {
                if (!course.image) return course;
                try {
                    // Use images.weserv.nl as a reliable CORS proxy
                    // This service adds CORS headers and optimizes the image
                    const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(course.image)}&output=jpg&n=-1`;

                    const response = await fetch(proxyUrl);
                    const blob = await response.blob();

                    if (blob.size === 0 || !blob.type.startsWith('image')) {
                        throw new Error("Invalid blob received");
                    }

                    return new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            if (typeof reader.result === 'string' && reader.result.startsWith('data:image')) {
                                resolve({ ...course, image: reader.result });
                            } else {
                                resolve(course);
                            }
                        };
                        reader.onerror = () => resolve(course);
                        reader.readAsDataURL(blob);
                    });
                } catch (e) {
                    console.error("Image processing failed:", e);
                    return course;
                }
            }));
            setProcessedCourses(newCourses);
        };

        if (result?.courses) {
            processImages();
        }
    }, [result.courses]);

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
        <div className="w-full text-left animate-[fadeIn_0.5s_ease-out]">
            {/* Downloadable Area (Visible) */}
            <div ref={cardRef} className="p-4 md:p-8 bg-[#fdfbf7]">
                <div className="flex flex-col md:flex-row justify-between items-baseline mb-6 md:mb-8 border-b border-glass-border pb-4 gap-2">
                    <h2 className="text-2xl md:text-3xl font-bold text-text-primary">
                        Your Curated Journey
                    </h2>
                    <div className="text-left md:text-right">
                        <span className="text-xs text-text-secondary block uppercase tracking-wider">Total Expectation</span>
                        <span className="text-xl md:text-2xl font-bold text-accent-jp">
                            {currentConfig.currency}{totalCost}
                        </span>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-10">
                    {processedCourses.map((course, index) => (
                        <div key={course.id} className="relative group">
                            <div className="bg-white/50 p-0 h-full flex flex-col rounded-2xl border border-glass-border hover:shadow-xl transition-all overflow-hidden relative">
                                {/* Image Section (Static, No Cloche) */}
                                <div className="h-48 w-full overflow-hidden relative bg-black/5">
                                    {course.image ? (
                                        <img
                                            src={course.image}
                                            alt={course.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">🍽️</div>
                                    )}

                                    {/* Heritage Button */}
                                    <button
                                        data-html2canvas-ignore="true"
                                        onClick={(e) => { e.stopPropagation(); setActiveHeritage(course.id === activeHeritage ? null : course.id); }}
                                        className="absolute top-3 right-3 z-30 w-8 h-8 rounded-full bg-white/80 backdrop-blur text-accent-jp flex items-center justify-center font-bold shadow-md hover:bg-accent-jp hover:text-white transition-colors"
                                        title="View Origin Story"
                                    >
                                        i
                                    </button>
                                </div>

                                {/* Heritage Overlay */}
                                <div className={`absolute inset-0 z-20 bg-[#fdfbf7]/95 p-6 flex flex-col justify-center items-center text-center transition-all duration-500 ease-in-out transform ${activeHeritage === course.id ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}`}>
                                    <h4 className="font-bold text-lg mb-2 text-accent-jp">Culinary Heritage</h4>
                                    <p className="text-sm text-text-primary leading-relaxed opacity-90 italic">
                                        "{course.originStory || "A modern interpretation of West African flavors."}"
                                    </p>
                                    <button
                                        onClick={() => setActiveHeritage(null)}
                                        className="mt-4 text-xs uppercase tracking-widest text-text-secondary hover:text-text-primary"
                                    >
                                        Close
                                    </button>
                                </div>

                                <div className="p-6 flex flex-col flex-grow relative z-10 bg-white/50">
                                    <span className="text-xs font-bold tracking-widest text-accent-fusion mb-2 uppercase">
                                        {index === 0 ? 'First Course' : index === 1 ? 'Main Course' : 'Dessert'}
                                    </span>
                                    <h3 className="text-xl font-bold mb-2 leading-tight text-text-primary">{course.name}</h3>
                                    <p className="text-sm text-text-secondary mb-4 opacity-90 line-clamp-3 flex-grow leading-relaxed">
                                        {course.description}
                                    </p>

                                    {/* Sommelier Pairing */}
                                    {course.pairing && (
                                        <div className="mb-4 flex items-center gap-2 text-xs text-accent-jp italic border-l-2 border-accent-jp pl-3">
                                            <span className="text-sm">🍷</span>
                                            <span>{course.pairing}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center text-xs text-text-secondary mt-auto pt-3 border-t border-black/5">
                                        <span className="px-2 py-1 rounded-md bg-accent-wa/10 text-accent-jp font-semibold inline-flex items-center">
                                            {course.flavorProfile}
                                        </span>
                                        <span className="font-mono font-bold opacity-70">{currentConfig.currency}{course.cost}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-white/30 p-8 rounded-2xl border border-glass-border mb-8">
                    <h4 className="text-xs font-bold uppercase text-accent-jp mb-3 tracking-wider">
                        Chef's Narrative
                    </h4>
                    <p className="text-text-primary italic leading-relaxed text-lg opacity-85">
                        "{narrative}"
                    </p>
                </div>
            </div>

            {/* Hidden Download Card (Fixed width 1000px for consistency) */}
            <div ref={downloadRef} className="fixed left-[-10000px] top-0 w-[1000px] p-12 bg-[#fdfbf7]">
                <div className="flex justify-between items-baseline mb-12 border-b border-glass-border pb-6">
                    <h2 className="text-4xl font-bold text-text-primary">
                        Your Curated Journey
                    </h2>
                    <div className="text-right">
                        <span className="text-xs text-text-secondary block uppercase tracking-wider mb-1">Total Expectation</span>
                        <span className="text-3xl font-bold text-accent-jp">
                            {currentConfig.currency}{totalCost}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-8 mb-12">
                    {processedCourses.map((course, index) => (
                        <div key={course.id} className="relative h-full">
                            <div className="bg-white/50 p-0 h-full flex flex-col rounded-2xl border border-glass-border overflow-hidden relative">
                                <div className="h-64 w-full overflow-hidden relative bg-black/5">
                                    {course.image ? (
                                        <img
                                            src={course.image}
                                            alt={course.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">🍽️</div>
                                    )}
                                </div>

                                <div className="p-8 flex flex-col flex-grow relative z-10 bg-white/50">
                                    <span className="text-xs font-bold tracking-widest text-accent-fusion mb-3 uppercase">
                                        {index === 0 ? 'First Course' : index === 1 ? 'Main Course' : 'Dessert'}
                                    </span>
                                    <h3 className="text-2xl font-bold mb-3 leading-tight text-text-primary">{course.name}</h3>
                                    <p className="text-base text-text-secondary mb-6 opacity-90 leading-relaxed">
                                        {course.description}
                                    </p>



                                    <div className="flex justify-end items-center text-sm text-text-secondary mt-auto pt-4 border-t border-black/5">
                                        <span className="font-mono font-bold opacity-70 text-lg">{currentConfig.currency}{course.cost}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-white/30 p-10 rounded-2xl border border-glass-border">
                    <h4 className="text-sm font-bold uppercase text-accent-jp mb-4 tracking-wider">
                        Chef's Narrative
                    </h4>
                    <p className="text-text-primary italic leading-relaxed text-xl opacity-85">
                        "{narrative}"
                    </p>
                </div>
            </div>


            <div className="flex flex-col md:flex-row gap-4 justify-center items-center mt-4">
                <button
                    onClick={onReset}
                    className="px-6 py-3 rounded-full border border-text-secondary/30 text-text-secondary font-medium hover:bg-white/40 hover:text-text-primary transition-all text-sm uppercase tracking-wider"
                >
                    Start New Recommendation
                </button>
                <button
                    onClick={handleDownload}
                    className="px-6 py-3 rounded-full bg-accent-fusion/10 text-accent-fusion hover:bg-accent-fusion/20 transition-all font-bold text-sm uppercase tracking-wider flex items-center gap-2"
                >
                    <span>Download Menu</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                </button>
                <a
                    href="https://ikoyilondon.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary px-6 py-3 text-sm uppercase tracking-wider flex items-center gap-2 no-underline text-white hover:text-white font-bold"
                >
                    Book a Table
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                </a>
            </div>
        </div>
    );
};

export default RecommendationResult;
