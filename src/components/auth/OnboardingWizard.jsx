import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { cities } from '../../lib/cities';
import { resizeImage } from '../../utils/imageUtils';

const OnboardingWizard = ({ user }) => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [animating, setAnimating] = useState(false);

    // Form State
    const [data, setData] = useState({
        // Restaurant
        name: user?.name || '',
        cuisine: '',
        philosophy: '',
        city: '',
        currency: 'GBP', // Default

        // Diner
        restrictions: [], // vegan, halal, etc
        spicyLevel: 1, // 0-3
        sweetLevel: 1,
        umamiLevel: 1,
        craving: ''
    });

    const [scannedData, setScannedData] = useState(null); // { meals: [], inventory: [] }
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisProgress, setAnalysisProgress] = useState(0);

    const [showCitySuggestions, setShowCitySuggestions] = useState(false);
    const filteredCities = cities.filter(c => c.city.toLowerCase().includes(data.city.toLowerCase()));

    const handleMenuUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setAnalyzing(true);
        setAnalysisProgress(10);

        // Simulate progress
        const progressInterval = setInterval(() => {
            setAnalysisProgress(prev => Math.min(prev + 5, 90));
        }, 500);

        try {
            let base64Image = null;
            let mimeType = file.type;

            // Always resize/process to get Base64 (Gemini needs Base64)
            // Even if PDF, we might need to handle it diff, but logic below assumes image for resize
            // If it's a PDF, we need to read it as base64 without resize
            if (file.type === 'application/pdf') {
                base64Image = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result.split(',')[1]);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            } else {
                // Resize utils now returns base64 string
                base64Image = await resizeImage(file);
                mimeType = 'image/jpeg';
            }

            const response = await fetch('/api/analyze-menu', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image: base64Image,
                    mimeType: mimeType
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                // Show detailed backend error if available
                throw new Error(errorData.details || errorData.error || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            // Map AI Result
            const newMeals = result.meals?.map((m, i) => ({ ...m, id: i + 1, status: 'Active' })) || [];
            const newInventory = result.pantry?.map((p, i) => ({ ...p, id: i + 1 })) || [];

            const resultData = { meals: newMeals, inventory: newInventory };
            setScannedData(resultData);
            clearInterval(progressInterval);
            setAnalysisProgress(100);

            // Auto advance after short delay, passing data explicitly to avoid stale state closure issues
            setTimeout(() => handleComplete(resultData), 1500);

        } catch (error) {
            clearInterval(progressInterval);
            console.error("Analysis Error:", error);
            alert(`Scan Failed: ${error.message}`);
        } finally {
            setAnalyzing(false);
        }
    };

    const handleNext = () => {
        setAnimating(true);
        setTimeout(() => {
            setStep(prev => prev + 1);
            setAnimating(false);
        }, 300);
    };

    const handleBack = () => {
        setAnimating(true);
        setTimeout(() => {
            setStep(prev => prev - 1);
            setAnimating(false);
        }, 300);
    };

    const handleComplete = async (manualScannedData = null) => {
        setLoading(true);
        try {
            if (user?.type === 'restaurant') {
                // Save preferences to local storage (simulating DB for now)
                // Force update user type to 'restaurant' to ensure dashboard access
                const { error: updateError } = await supabase.auth.updateUser({
                    data: { type: 'restaurant' }
                });

                if (updateError) console.error("Error updating user type:", updateError);

                // Save preferences
                const profile = {
                    name: data.name,
                    cuisine: data.cuisine,
                    philosophy: data.philosophy,
                    location: data.city,
                    currency: data.currency,
                    // defaults
                    description: '',
                    logoUrl: null,
                    coverUrl: null,
                    hours: '',
                    priceTier: '$$',
                    contactEmail: '',
                    dietaryTags: ''
                };
                localStorage.setItem(`restaurant_preferences_${user.id}`, JSON.stringify(profile));

                // Save Inventory if scanned (use manual override if provided to bypass stale state)
                const finalScannedData = manualScannedData || scannedData;

                if (finalScannedData) {
                    localStorage.setItem(`restaurant_inventory_${user.id}`, JSON.stringify(finalScannedData.inventory));
                    localStorage.setItem(`restaurant_meals_${user.id}`, JSON.stringify(finalScannedData.meals));
                }

                // 3. Set Approval Status to Pending
                localStorage.setItem(`restaurant_approval_${user.id}`, 'pending');

                // 4. Send Confirmation Email (Real Integration)
                import('../../utils/adminTemplates').then(async ({ getAppReceivedEmail }) => {
                    const emailHtml = getAppReceivedEmail(data.name);

                    try {
                        await fetch('/api/send-email', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                to: user.email,
                                subject: 'Application Received - Nusion AI',
                                html: emailHtml
                            })
                        });
                        console.log(`[EMAIL SENT] To: ${user.email}`);
                    } catch (err) {
                        console.error("Failed to send email:", err);
                    }
                });

                alert("Application Received! Check your email for status updates.");
                navigate('/dashboard/restaurant');
            } else {
                const prefs = {
                    restrictions: data.restrictions,
                    tasteProfile: {
                        spicy: data.spicyLevel,
                        sweet: data.sweetLevel,
                        umami: data.umamiLevel
                    },
                    semanticProfile: data.semanticProfile, // Save the AI calibration
                    photo: null
                };
                localStorage.setItem(`diner_preferences_${user.id}`, JSON.stringify(prefs));

                // If they entered a craving, we could pass it to dashboard state logic, 
                // but for now just redirect
                navigate('/dashboard');
            }
        } catch (e) {
            console.error(e);
            alert('Error saving profile');
        } finally {
            setLoading(false);
        }
    };

    // --- STEPS RENDERERS ---

    const renderRestaurantStep = () => {
        switch (step) {
            case 1: // Identity
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <span className="text-4xl mb-4 block">👋</span>
                            <h2 className="text-2xl font-bold text-text-primary">Welcome, Chef.</h2>
                            <p className="text-text-secondary">Let's define your culinary identity.</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-mono text-text-secondary uppercase mb-1">Restaurant Name</label>
                                <input
                                    value={data.name}
                                    onChange={e => setData({ ...data, name: e.target.value })}
                                    className="w-full bg-bg-secondary border border-glass-border rounded p-3 text-text-primary focus:border-accent-jp outline-none"
                                    placeholder="e.g. Ikoyi"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-mono text-text-secondary uppercase mb-1">Cuisine Type</label>
                                <input
                                    value={data.cuisine}
                                    onChange={e => setData({ ...data, cuisine: e.target.value })}
                                    className="w-full bg-bg-secondary border border-glass-border rounded p-3 text-text-primary focus:border-accent-jp outline-none"
                                    placeholder="e.g. Modern West African"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-mono text-text-secondary uppercase mb-1">Philosophy (Optional)</label>
                                <input
                                    value={data.philosophy}
                                    onChange={e => setData({ ...data, philosophy: e.target.value })}
                                    className="w-full bg-bg-secondary border border-glass-border rounded p-3 text-text-primary focus:border-accent-jp outline-none"
                                    placeholder="e.g. Hyper-seasonal"
                                />
                            </div>
                        </div>
                        <button onClick={handleNext} disabled={!data.name} className="w-full py-3 bg-text-primary text-bg-primary rounded-lg font-bold hover:opacity-90 disabled:opacity-50 transition-all">
                            Next: Location
                        </button>
                    </div>
                );
            case 2: // Location
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <span className="text-4xl mb-4 block">🌍</span>
                            <h2 className="text-2xl font-bold text-text-primary">Where are you based?</h2>
                            <p className="text-text-secondary">Used for currency and local sourcing logic.</p>
                        </div>

                        <div className="space-y-4 relative">
                            <div>
                                <label className="block text-xs font-mono text-text-secondary uppercase mb-1">City</label>
                                <input
                                    value={data.city}
                                    onChange={e => {
                                        setData({ ...data, city: e.target.value });
                                        setShowCitySuggestions(true);
                                    }}
                                    onFocus={() => setShowCitySuggestions(true)}
                                    className="w-full bg-bg-secondary border border-glass-border rounded p-3 text-text-primary focus:border-accent-jp outline-none"
                                    placeholder="Start typing..."
                                />
                                {showCitySuggestions && data.city.length > 0 && (
                                    <div className="absolute top-full left-0 w-full bg-bg-secondary border border-glass-border rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto mt-1">
                                        {filteredCities.map((c, i) => (
                                            <div key={i}
                                                onClick={() => {
                                                    setData({ ...data, city: c.city, currency: c.symbol });
                                                    setShowCitySuggestions(false);
                                                }}
                                                className="px-4 py-3 hover:bg-glass-border/20 cursor-pointer text-sm flex justify-between"
                                            >
                                                <span>{c.city}, {c.country}</span>
                                                <span className="text-text-secondary font-mono">{c.symbol}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="p-4 bg-accent-wa/10 rounded-lg flex items-center justify-between">
                                <span className="text-sm text-text-secondary">Detected Currency:</span>
                                <span className="text-xl font-mono font-bold text-accent-wa">{data.currency}</span>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button onClick={handleBack} className="w-1/3 py-3 text-text-secondary hover:text-text-primary font-bold">Back</button>
                            <button onClick={handleNext} disabled={!data.city} className="flex-1 py-3 bg-text-primary text-bg-primary rounded-lg font-bold hover:opacity-90 disabled:opacity-50 transition-all">
                                Next: The Magic
                            </button>
                        </div>
                    </div>
                );
            case 3: // Menu Upload & Review
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <span className="text-4xl mb-4 block">📸</span>
                            <h2 className="text-2xl font-bold text-text-primary">Menu Scan</h2>
                            <p className="text-text-secondary">Upload your menu to digitize your inventory.</p>
                        </div>

                        {!analyzing && !scannedData ? (
                            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-glass-border rounded-xl cursor-pointer hover:bg-glass-border/30 transition-all">
                                <div className="text-4xl mb-2">📄</div>
                                <span className="text-sm font-bold text-text-primary">Click to Upload Menu (PDF/IMG)</span>
                                <span className="text-xs text-text-secondary mt-1 max-w-[200px] text-center">AI will extract ingredients & prices automatically.</span>
                                <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleMenuUpload} />
                            </label>
                        ) : analyzing ? (
                            <div className="flex flex-col items-center justify-center h-48">
                                <div className="w-16 h-16 border-4 border-accent-wa border-t-transparent rounded-full animate-spin mb-4"></div>
                                <h3 className="text-lg font-bold text-text-primary animate-pulse">Analysing Menu...</h3>
                                <div className="w-64 h-2 bg-glass-border rounded-full mt-4 overflow-hidden">
                                    <div className="h-full bg-accent-wa transition-all duration-300" style={{ width: `${analysisProgress}%` }}></div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="bg-green-500/10 border border-green-500/20 text-green-600 p-4 rounded-lg flex items-center gap-3">
                                    <span className="text-xl">✅</span>
                                    <div>
                                        <p className="font-bold text-sm">Scan Complete</p>
                                        <p className="text-xs opacity-80">{scannedData.meals.length} items identified.</p>
                                    </div>
                                </div>
                                <button onClick={handleComplete} className="w-full py-3 bg-text-primary text-bg-primary rounded-lg font-bold hover:opacity-90 transition-all">
                                    Submit Application for Review
                                </button>
                            </div>
                        )}

                        <div className="flex gap-4">
                            <button onClick={handleBack} className="w-1/3 py-3 text-text-secondary hover:text-text-primary font-bold">Back</button>
                            <button onClick={handleComplete} className="flex-1 py-3 bg-text-primary text-bg-primary rounded-lg font-bold hover:opacity-90 transition-all">
                                {scannedData ? 'Enter Dashboard' : 'Skip & Finish'}
                            </button>
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    // --- CALIBRATION STATE ---
    const [calibration, setCalibration] = useState({
        heatBenchmark: 1, // 0=Lemon&Herb, 1=Medium, 2=Hot, 3=Extra Hot
        favorites: '',
        analyzing: false,
        result: null // { semantic_profile, bridge_ingredient, narrative }
    });

    const handleCalibrate = async () => {
        if (!calibration.favorites) return;
        setCalibration(prev => ({ ...prev, analyzing: true }));
        try {
            const response = await fetch('/api/calibrate-palate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ favorites: calibration.favorites })
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error);

            setCalibration(prev => ({ ...prev, result: data, analyzing: false }));
            // Save to main data for persistence
            setData(prev => ({ ...prev, semanticProfile: data }));

            // Auto-tune the sliders based on result (Smart default)
            // If "Spicy" is in profile, bump spice, etc.
            // For now, simpler: Just show the result and let user confirm next.
        } catch (e) {
            console.error(e);
            alert("Calibration failed - Chef is busy! Please skip or try again.");
            setCalibration(prev => ({ ...prev, analyzing: false }));
        }
    };

    const renderCalibrationStep = () => {
        const benchmarks = [
            { label: 'Lemon & Herb', sub: "Nando's", intensity: 1, color: 'bg-green-400' },
            { label: 'Medium', sub: "Nando's / Korma", intensity: 2, color: 'bg-yellow-400' },
            { label: 'Hot', sub: "Madras / Firecracker", intensity: 3, color: 'bg-orange-500' },
            { label: 'Extra Hot', sub: "Vindaloo / Super", intensity: 4, color: 'bg-red-600' }
        ];

        return (
            <div className="space-y-8 animate-[fadeIn_0.5s]">
                <div className="text-center mb-6">
                    <span className="text-4xl mb-4 block">⚖️</span>
                    <h2 className="text-2xl font-bold text-text-primary">Palate Calibration</h2>
                    <p className="text-text-secondary">Let's translate your taste to the West African scale.</p>
                </div>

                {/* 1. RELATIONAL HEAT */}
                <div className="space-y-4">
                    <label className="block text-sm font-bold text-text-primary uppercase tracking-wide">
                        1. Heat Benchmark
                    </label>
                    <div className="bg-bg-secondary p-4 rounded-xl border border-glass-border">
                        <input
                            type="range"
                            min="0" max="3" step="1"
                            value={calibration.heatBenchmark}
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                setCalibration(prev => ({ ...prev, heatBenchmark: val }));
                                // Auto-update real data
                                // Map 0->0(None), 1->1(Mild), 2->2(Med), 3->3(High)
                                // Actually map: 0->0, 1->1, 2->2, 3->3 is 1:1, keeps it simple.
                                setData(d => ({ ...d, spicyLevel: val }));
                            }}
                            className="w-full h-2 bg-glass-border rounded-lg appearance-none cursor-pointer mb-6"
                        />
                        <div className="flex justify-between items-start">
                            {benchmarks.map((b, i) => (
                                <div key={i}
                                    className={`flex flex-col items-center w-1/4 transition-opacity duration-300 ${i === calibration.heatBenchmark ? 'opacity-100 scale-110' : 'opacity-40 grayscale'}`}
                                    onClick={() => {
                                        setCalibration(prev => ({ ...prev, heatBenchmark: i }));
                                        setData(d => ({ ...d, spicyLevel: i }));
                                    }}
                                >
                                    <div className={`w-4 h-4 rounded-full mb-2 ${b.color} shadow`}></div>
                                    <span className="text-xs font-bold text-center leading-tight">{b.label}</span>
                                    <span className="text-[10px] text-text-secondary mt-1">{b.sub}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 2. SEMANTIC BRIDGE */}
                <div className="space-y-4">
                    <label className="block text-sm font-bold text-text-primary uppercase tracking-wide">
                        2. Flavor Bridge
                    </label>
                    <p className="text-xs text-text-secondary mb-2">
                        What are your 3 absolute favorite dishes/ingredients from ANY cuisine?
                    </p>
                    <div className="relative">
                        <textarea
                            value={calibration.favorites}
                            onChange={(e) => setCalibration(prev => ({ ...prev, favorites: e.target.value }))}
                            placeholder="e.g. Truffle Pasta, Miso Soup, Pepperoni Pizza..."
                            className="w-full bg-bg-secondary border border-glass-border rounded-xl p-4 text-text-primary focus:border-accent-jp outline-none resize-none h-24 text-sm"
                        />
                        {!calibration.result && (
                            <button
                                onClick={handleCalibrate}
                                disabled={!calibration.favorites || calibration.analyzing}
                                className="absolute bottom-3 right-3 px-3 py-1 bg-accent-jp text-white text-xs font-bold rounded-lg hover:brightness-110 disabled:opacity-50 transition-all flex items-center gap-2"
                            >
                                {calibration.analyzing ? (
                                    <><span>🧠</span> Analyzing...</>
                                ) : (
                                    <><span>✨</span> Analyze</>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* 3. THE TRANSLATION (Result) */}
                {calibration.result && (
                    <div className="bg-gradient-to-br from-accent-wa/10 to-accent-jp/5 border border-accent-wa/20 rounded-xl p-5 animate-[slideUp_0.5s]">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-2xl">🧬</span>
                            <div>
                                <h3 className="font-bold text-text-primary text-sm">Semantic Profile Detected</h3>
                                <p className="text-xs text-text-secondary">
                                    {calibration.result.semantic_profile?.primary} • {calibration.result.semantic_profile?.secondary}
                                </p>
                            </div>
                        </div>
                        <div className="text-sm text-text-primary italic border-l-2 border-accent-jp pl-3 py-1 mb-2 opacity-90">
                            "{calibration.result.narrative}"
                        </div>
                        <div className="flex items-center gap-2 mt-3 bg-white/40 p-2 rounded-lg">
                            <span className="text-xs font-bold text-accent-wa uppercase tracking-wider">Recommended Bridge:</span>
                            <span className="text-sm font-bold">{calibration.result.bridge_ingredient}</span>
                        </div>
                    </div>
                )}

                <div className="flex gap-4 pt-4">
                    <button onClick={handleBack} className="w-1/3 py-3 text-text-secondary hover:text-text-primary font-bold">Back</button>
                    <button onClick={handleNext} className="flex-1 py-3 bg-text-primary text-bg-primary rounded-lg font-bold hover:opacity-90 transition-all">
                        {calibration.result ? "Use This Profile" : "Continue"}
                    </button>
                </div>
            </div>
        );
    };

    const renderDinerStep = () => {
        switch (step) {
            case 1: // Restrictions
                const toggle = (tag) => {
                    if (data.restrictions.includes(tag)) {
                        setData({ ...data, restrictions: data.restrictions.filter(t => t !== tag) });
                    } else {
                        setData({ ...data, restrictions: [...data.restrictions, tag] });
                    }
                };
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <span className="text-4xl mb-4 block">🥗</span>
                            <h2 className="text-2xl font-bold text-text-primary">Dietary Needs</h2>
                            <p className="text-text-secondary">We'll filter every generated menu to be safe for you.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {['Vegan', 'Vegetarian', 'Halal', 'Gluten-Free', 'Nut-Free', 'Dairy-Free'].map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => toggle(tag)}
                                    className={`p-3 rounded-lg border text-sm font-bold transition-all ${data.restrictions.includes(tag)
                                        ? 'bg-accent-wa/20 border-accent-wa text-accent-wa'
                                        : 'bg-bg-secondary border-glass-border text-text-secondary hover:border-text-secondary'
                                        }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>

                        <button onClick={handleNext} className="w-full py-3 bg-text-primary text-bg-primary rounded-lg font-bold hover:opacity-90 transition-all mt-4">
                            Next: Calibration
                        </button>
                    </div>
                );
            case 2: return renderCalibrationStep();
            case 3: // Taste (Old Step 2 became 3, mostly just confirmation/tweaking now)
                return (
                    <div className="space-y-8">
                        <div className="text-center mb-8">
                            <span className="text-4xl mb-4 block">🔧</span>
                            <h2 className="text-2xl font-bold text-text-primary">Fine Tuning</h2>
                            <p className="text-text-secondary">We've pre-set this based on your calibration.</p>
                        </div>

                        <div className="space-y-6">
                            {[
                                { label: 'Spiciness', key: 'spicyLevel', emoji: '🌶️', max: 3 },
                                { label: 'Sweetness', key: 'sweetLevel', emoji: '🍯', max: 3 },
                                { label: 'Umami', key: 'umamiLevel', emoji: '🍄', max: 3 }
                            ].map(item => (
                                <div key={item.key}>
                                    <div className="flex justify-between text-sm mb-2 text-text-secondary">
                                        <span>{item.emoji} {item.label}</span>
                                        <span>{data[item.key]}/3</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0" max="3" step="1"
                                        value={data[item.key]}
                                        onChange={e => setData({ ...data, [item.key]: parseInt(e.target.value) })}
                                        className="w-full h-2 bg-glass-border rounded-lg appearance-none cursor-pointer accent-accent-jp"
                                    />
                                    <div className="flex justify-between text-xs text-text-secondary opacity-50 mt-1">
                                        <span>None</span>
                                        <span>Mild</span>
                                        <span>Medium</span>
                                        <span>High</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-4">
                            <button onClick={handleBack} className="w-1/3 py-3 text-text-secondary hover:text-text-primary font-bold">Back</button>
                            <button onClick={handleComplete} className="flex-1 py-3 bg-text-primary text-bg-primary rounded-lg font-bold hover:opacity-90 transition-all">
                                Finish Setup
                            </button>
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-bg-primary p-4 animate-[fadeIn_0.5s]">
            <div className="glass-panel p-8 w-full max-w-md relative overflow-hidden">
                {/* Background Blobs */}
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-accent-wa/5 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-accent-jp/5 rounded-full blur-3xl"></div>

                <div className={`transition-opacity duration-300 relative z-10 ${animating ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}`}>
                    {user?.type === 'restaurant' ? renderRestaurantStep() : renderDinerStep()}
                </div>

                {/* Progress Dots */}
                <div className="flex justify-center gap-2 mt-8">
                    {(user?.type === 'restaurant' ? [1, 2, 3] : [1, 2, 3]).map(i => (
                        <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-text-primary' : 'w-2 bg-glass-border'}`}></div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default OnboardingWizard;
