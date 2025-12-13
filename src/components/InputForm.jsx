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
            {/* Budget Section (Discrete) */}
            <section>
                <label className="block mb-4 text-xs uppercase tracking-wider text-text-secondary font-bold">
                    Price Range Guidelines
                </label>
                <div className="flex justify-between items-center bg-white/30 rounded-full p-1 border border-glass-border">
                    {budgetOptions.map((option, idx) => (
                        <button
                            type="button"
                            key={idx}
                            onClick={() => updateBudget(idx)}
                            className={`flex-1 py-3 rounded-full text-sm font-bold transition-all duration-300 font-display ${selectedBudgetIdx === idx ? 'bg-white text-accent-jp shadow-md scale-105' : 'text-text-secondary hover:text-text-primary'}`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
                <div className="text-center mt-2 text-xs text-text-secondary font-medium opacity-70">
                    Target: ~{currentConfig.currency}{budgetOptions[selectedBudgetIdx].value} per person
                </div>
            </section>

            {/* Spice Tolerance Section (Chilis) */}
            <section>
                <label className="block mb-4 text-xs uppercase tracking-wider text-text-secondary font-bold">
                    Spice Tolerance
                </label>
                <div className="flex justify-center gap-2 md:gap-4">
                    {[1, 2, 3, 4, 5].map((level) => (
                        <button
                            type="button"
                            key={level}
                            onClick={() => setSpiceTolerance(level)}
                            className={`transition-all duration-200 transform hover:scale-125 focus:outline-none ${level <= spiceTolerance ? 'text-accent-jp scale-110' : 'text-gray-300 hover:text-accent-jp/50'}`}
                            title={`Level ${level}`}
                        >
                            <svg
                                width="32"
                                height="32"
                                viewBox="0 0 24 24"
                                fill={level <= spiceTolerance ? "currentColor" : "none"}
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M2.5 17a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z" transform="translate(4,4)" />
                                <path d="M12.9 2.5C10.6 2.5 8 4.6 8 8.5c0 4 2 5.5 2 5.5s3.5-2.5 9-2.5c2 0 3 2.5 3 2.5s-.5-6-4.5-9-4.6-2.5-4.6-2.5Z" />
                                <path d="M10 14a5 5 0 0 0 9 3" />
                                <path d="M19.14 17.5c-4.43 2.45-8.5 2.5-12.14.5" />
                                <path d="M13.26 2.5c-2.36 0-5.16 2.1-5.16 6.1s.7 4.1 1.7 5.1" />
                            </svg>
                        </button>
                    ))}
                </div>
                <div className="text-center mt-2 text-xs text-text-secondary font-medium">
                    {spiceTolerance === 1 && "Mild"}
                    {spiceTolerance === 2 && "Medium"}
                    {spiceTolerance === 3 && "Hot"}
                    {spiceTolerance === 4 && "Fiery"}
                    {spiceTolerance === 5 && "Inferno"}
                </div>
            </section>

            {/* Allergies Section */}
            <section>
                <label className="block mb-3 text-xs uppercase tracking-wider text-text-secondary font-bold">
                    Dietary Restrictions
                </label>
                <div className="flex flex-wrap gap-2 justify-center">
                    {allergenList.map(allergen => (
                        <button
                            type="button"
                            key={allergen}
                            onClick={() => toggleAllergy(allergen)}
                            className={`
                                px-4 py-2 rounded-full text-sm font-semibold transition-all border
                                ${allergies.includes(allergen)
                                    ? 'bg-accent-wa/20 text-accent-jp border-accent-wa/50'
                                    : 'bg-white/40 text-text-secondary border-transparent hover:border-black/10 hover:bg-white/60'}
                            `}
                        >
                            {allergen}
                        </button>
                    ))}
                </div>
            </section>

            <button type="submit" className="btn-primary mt-4 w-full text-white shadow-xl hover:shadow-2xl">
                Generate Menu
            </button>
        </form>
    );
};

export default InputForm;
