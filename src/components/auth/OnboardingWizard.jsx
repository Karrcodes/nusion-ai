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
            // Save preferences to local storage (simulating DB for now)
            if (user?.type === 'restaurant') {
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

                navigate('/dashboard/restaurant');
            } else {
                const prefs = {
                    restrictions: data.restrictions,
                    tasteProfile: {
                        spicy: data.spicyLevel,
                        sweet: data.sweetLevel,
                        umami: data.umamiLevel
                    },
                    photo: null
                };
                localStorage.setItem(`diner_preferences_${user.id}`, JSON.stringify(prefs));

                // If they entered a craving, we could pass it to dashboard state logic, 
                // but for now just redirect
                navigate('/dashboard/diner');
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
            case 3: // Magic / Menu Scan
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <span className="text-4xl mb-4 block">✨</span>
                            <h2 className="text-2xl font-bold text-text-primary">The Magic Step</h2>
                            <p className="text-text-secondary">Upload your menu. We'll populate your dashboard instantly.</p>
                        </div>

                        {analyzing ? (
                            <div className="p-8 border border-glass-border bg-bg-secondary rounded-xl text-center space-y-4">
                                <div className="w-full bg-glass-border rounded-full h-2 overflow-hidden relative">
                                    <div
                                        className="bg-accent-jp h-full transition-all duration-300 rounded-full"
                                        style={{ width: `${analysisProgress}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between text-xs text-text-secondary font-mono">
                                    <span>Reading Menu...</span>
                                    <span>{analysisProgress}%</span>
                                </div>
                                <p className="text-sm text-text-secondary animate-pulse">
                                    {analysisProgress < 40 ? 'Extracting text...' : analysisProgress < 70 ? 'Identifying ingredients...' : 'Structuring data...'}
                                </p>
                            </div>
                        ) : scannedData ? (
                            <div className="p-6 border border-green-500/30 bg-green-500/10 rounded-xl text-center space-y-2">
                                <div className="text-2xl">✅</div>
                                <h3 className="font-bold text-green-400">Scan Complete!</h3>
                                <p className="text-xs text-text-secondary">Found {scannedData.meals.length} meals & {scannedData.inventory.length} ingredients.</p>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-glass-border rounded-xl cursor-pointer hover:bg-glass-border/10 hover:border-accent-jp transition-all group">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <svg className="w-10 h-10 mb-3 text-text-secondary group-hover:text-accent-jp transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                                    <p className="mb-2 text-sm text-text-secondary"><span className="font-bold text-text-primary">Click to upload</span> or drag and drop</p>
                                    <p className="text-xs text-text-secondary">IMG, PDF (MAX. 10MB)</p>
                                </div>
                                <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleMenuUpload} />
                            </label>
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
                            Next: Taste Profile
                        </button>
                    </div>
                );
            case 2: // Taste
                return (
                    <div className="space-y-8">
                        <div className="text-center mb-8">
                            <span className="text-4xl mb-4 block">👅</span>
                            <h2 className="text-2xl font-bold text-text-primary">Your Palate</h2>
                            <p className="text-text-secondary">Help us understand what you love.</p>
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
                    {(user?.type === 'restaurant' ? [1, 2, 3] : [1, 2]).map(i => (
                        <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-text-primary' : 'w-2 bg-glass-border'}`}></div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default OnboardingWizard;
