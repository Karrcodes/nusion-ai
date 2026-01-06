import { useState } from 'react';
import { currentConfig } from '../config/restaurantConfig';

const InputForm = ({ onCalculate }) => {
    const [budget, setBudget] = useState(currentConfig.defaultBudget);
    const [spiceTolerance, setSpiceTolerance] = useState(3);
    const [allergies, setAllergies] = useState([]);

    // Logic for Discrete Budget
    const budgetOptions = [
        { label: '£', value: 40, desc: 'Casual' },
        { label: '££', value: 80, desc: 'Upscale' },
        { label: '£££', value: 150, desc: 'Fine Dining' },
        { label: '££££', value: 250, desc: 'Luxury' }
    ];

    const [selectedBudgetIdx, setSelectedBudgetIdx] = useState(1);

    const updateBudget = (idx) => {
        setSelectedBudgetIdx(idx);
        setBudget(budgetOptions[idx].value);
    };

    // Hardcoded known allergens for checkbox generation
    const allergenList = ["Peanuts", "Shellfish", "Dairy", "Gluten", "Nuts", "Eggs", "Fish", "Mustard"];

    const toggleAllergy = (allergen) => {
        setAllergies(prev =>
            prev.includes(allergen)
                ? prev.filter(a => a !== allergen)
                : [...prev, allergen]
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onCalculate({ budget: Number(budget), spiceTolerance, allergies });
    };

    return (
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-10 text-left max-w-lg mx-auto">
            {/* Budget Section (Premium Cards) */}
            <section className="animate-[slideUp_0.4s_ease-out]">
                <label className="block mb-4 text-xs uppercase tracking-widest text-text-secondary font-bold flex items-center gap-2">
                    <span className="w-1 h-3 bg-accent-jp rounded-full"></span>
                    Price Range Guidelines
                </label>
                <div className="grid grid-cols-4 gap-2 md:gap-4">
                    {budgetOptions.map((option, idx) => (
                        <button
                            type="button"
                            key={idx}
                            onClick={() => updateBudget(idx)}
                            className={`
                                relative group overflow-hidden rounded-xl border transition-all duration-300 flex flex-col items-center justify-center py-4
                                ${selectedBudgetIdx === idx
                                    ? 'bg-white/80 border-accent-jp shadow-[0_0_20px_rgba(235,81,96,0.15)] scale-105 z-10'
                                    : 'bg-white/30 border-glass-border hover:bg-white/50 hover:border-accent-jp/30'}
                            `}
                        >
                            <span className={`font-display text-lg md:text-xl font-bold mb-1 transition-colors ${selectedBudgetIdx === idx ? 'text-accent-jp' : 'text-text-primary'}`}>
                                {option.label}
                            </span>
                            <span className={`text-[10px] md:text-xs uppercase tracking-wider transition-colors ${selectedBudgetIdx === idx ? 'text-text-primary' : 'text-text-secondary'}`}>
                                {option.desc}
                            </span>
                            {selectedBudgetIdx === idx && (
                                <div className="absolute top-0 left-0 w-full h-[2px] bg-accent-jp"></div>
                            )}
                        </button>
                    ))}
                </div>
                <div className="text-center mt-3 flex items-center justify-center gap-2 text-xs text-text-secondary/70 font-mono">
                    <span>Target Per Person:</span>
                    <span className="font-bold text-text-primary">{currentConfig.currency}{budgetOptions[selectedBudgetIdx].value}</span>
                </div>
            </section>

            {/* Spice Tolerance Section (Premium Heat Scale) */}
            <section className="animate-[slideUp_0.5s_ease-out]">
                <label className="block mb-6 text-xs uppercase tracking-widest text-text-secondary font-bold flex items-center gap-2">
                    <span className="w-1 h-3 bg-accent-jp rounded-full"></span>
                    Spice Intensity
                </label>

                <div className="relative px-4 py-8 bg-white/20 rounded-2xl border border-glass-border">
                    {/* Track Line */}
                    <div className="absolute top-1/2 left-8 right-8 h-1 bg-gradient-to-r from-green-300/50 via-yellow-300/50 to-red-500/50 rounded-full -translate-y-1/2"></div>

                    <div className="relative flex justify-between items-center z-10">
                        {[1, 2, 3, 4, 5].map((level) => (
                            <div key={level} className="flex flex-col items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setSpiceTolerance(level)}
                                    className={`
                                        w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm
                                        ${level <= spiceTolerance
                                            ? 'bg-white text-accent-jp scale-110 shadow-[0_0_15px_rgba(235,81,96,0.2)] border-2 border-accent-jp'
                                            : 'bg-white/40 text-text-secondary/40 border border-white hover:bg-white hover:text-accent-jp/70'}
                                    `}
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill={level <= spiceTolerance ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M2.5 17a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z" transform="translate(4,4)" />
                                        <path d="M12.9 2.5C10.6 2.5 8 4.6 8 8.5c0 4 2 5.5 2 5.5s3.5-2.5 9-2.5c2 0 3 2.5 3 2.5s-.5-6-4.5-9-4.6-2.5-4.6-2.5Z" />
                                        <path d="M10 14a5 5 0 0 0 9 3" />
                                        <path d="M19.14 17.5c-4.43 2.45-8.5 2.5-12.14.5" />
                                        <path d="M13.26 2.5c-2.36 0-5.16 2.1-5.16 6.1s.7 4.1 1.7 5.1" />
                                    </svg>
                                </button>
                                <span className={`text-[10px] uppercase font-bold tracking-wider transition-colors ${level === spiceTolerance ? 'text-accent-jp' : 'text-text-secondary/50'}`}>
                                    {level === 1 && "Mild"}
                                    {level === 2 && "Med"}
                                    {level === 3 && "Hot"}
                                    {level === 4 && "Fiery"}
                                    {level === 5 && "Inferno"}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Allergies Section (Glass Chips) */}
            <section className="animate-[slideUp_0.6s_ease-out]">
                <label className="block mb-4 text-xs uppercase tracking-widest text-text-secondary font-bold flex items-center gap-2">
                    <span className="w-1 h-3 bg-accent-jp rounded-full"></span>
                    Dietary Restrictions
                </label>
                <div className="flex flex-wrap gap-3">
                    {allergenList.map(allergen => (
                        <button
                            type="button"
                            key={allergen}
                            onClick={() => toggleAllergy(allergen)}
                            className={`
                                px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 border backdrop-blur-sm
                                ${allergies.includes(allergen)
                                    ? 'bg-accent-wa/20 text-accent-jp border-accent-wa/50 shadow-inner'
                                    : 'bg-white/40 text-text-secondary border-transparent hover:border-black/5 hover:bg-white/60 hover:-translate-y-0.5'}
                            `}
                        >
                            {allergen}
                        </button>
                    ))}
                </div>
            </section>

            <button
                type="submit"
                className="btn-primary mt-8 w-full py-4 text-white shadow-xl hover:shadow-2xl relative overflow-hidden group rounded-xl"
            >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                <span className="relative z-10 text-base md:text-lg uppercase tracking-widest font-bold">Generate Menu</span>
            </button>
        </form>
    );
};

export default InputForm;
