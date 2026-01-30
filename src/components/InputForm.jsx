import { useState, useEffect } from 'react';
import { currentConfig } from '../config/restaurantConfig';

const InputForm = ({ onCalculate, onValuesChange }) => {
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

    // Pantry State
    const [selectedIngredients, setSelectedIngredients] = useState([]);
    const PANTRY_ITEMS = ["Wagyu A5", "Bluefin Toro", "White Truffle", "Caviar", "Gold Leaf", "Saffron", "Foie Gras", "Lobster"];

    // Emit changes whenever state updates
    useEffect(() => {
        if (onValuesChange) {
            onValuesChange({
                budget: Number(budget),
                spiceTolerance,
                allergies,
                budgetLabel: budgetOptions[selectedBudgetIdx].desc
            });
        }
    }, [budget, spiceTolerance, allergies, selectedBudgetIdx, onValuesChange]);

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
        onCalculate({
            budget: Number(budget),
            spiceTolerance,
            allergies,
            ingredients: selectedIngredients
        });
    };

    return (
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-10 text-left max-w-lg mx-auto">
            {/* Budget Section (Editorial Text) */}
            <section className="animate-[fadeIn_0.9s] text-center">
                <label className="block mb-6 text-[10px] uppercase tracking-[0.2em] text-[var(--color-gold)] font-cinzel opacity-80">
                    EXPECTED INVESTMENT
                </label>
                <div className="flex justify-center items-center gap-8 md:gap-16 border-b border-white/10 pb-8">
                    {budgetOptions.map((option, idx) => (
                        <button
                            type="button"
                            key={idx}
                            onClick={() => updateBudget(idx)}
                            className={`
                                group relative flex flex-col items-center
                                ${selectedBudgetIdx === idx ? 'opacity-100' : 'opacity-30 hover:opacity-60'}
                            `}
                        >
                            <div className={`flex flex-col items-center transition-transform duration-500 ${selectedBudgetIdx === idx ? 'scale-110' : ''}`}>
                                <span className={`font-cinzel text-xl md:text-2xl mb-2 ${selectedBudgetIdx === idx ? 'text-[var(--color-cream)]' : 'text-white'}`}>
                                    {option.label}
                                </span>
                                <span className="text-[10px] uppercase tracking-widest font-sans font-light">
                                    {option.desc}
                                </span>
                            </div>
                            {selectedBudgetIdx === idx && (
                                <div className="absolute -bottom-9 w-2 h-2 bg-[var(--color-gold)] rounded-full shadow-[0_0_8px_var(--color-gold)]"></div>
                            )}
                        </button>
                    ))}
                </div>
            </section>

            {/* Spice Tolerance Section (Minimal Slider) */}
            <section className="animate-[fadeIn_1.0s] text-center w-full max-w-md mx-auto">
                <label className="block mb-8 text-[10px] uppercase tracking-[0.2em] text-[var(--color-gold)] font-cinzel opacity-80">
                    INTENSITY
                </label>

                <div className="relative h-12 flex items-center justify-center">
                    {/* Track */}
                    <div className="absolute left-0 right-0 h-[1px] bg-white/20"></div>

                    {/* Points */}
                    <div className="relative flex justify-between w-full z-10">
                        {[1, 2, 3, 4, 5].map((level) => (
                            <button
                                key={level}
                                type="button"
                                onClick={() => setSpiceTolerance(level)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/5 transition-all duration-300 relative
                                    ${level === spiceTolerance ? 'scale-125' : ''}
                                `}
                            >
                                <div className={`w-2 h-2 rounded-full transition-all duration-300 
                                    ${level <= spiceTolerance ? 'bg-[var(--color-gold)] shadow-[0_0_8px_var(--color-gold)]' : 'bg-white/20'}
                                `}></div>

                                {level === spiceTolerance && (
                                    <span className="absolute -top-8 text-[10px] font-cinzel text-[var(--color-cream)] tracking-widest whitespace-nowrap animate-[fadeIn_0.3s]">
                                        {level === 1 && "MILD"}
                                        {level === 2 && "MED"}
                                        {level === 3 && "HOT"}
                                        {level === 4 && "FIERY"}
                                        {level === 5 && "SCORCH"}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Allergies Section (Minimal Text) */}
            <section className="animate-[fadeIn_1.1s] text-center">
                <label className="block mb-6 text-[10px] uppercase tracking-[0.2em] text-[var(--color-gold)] font-cinzel opacity-80">
                    RESTRICTIONS
                </label>
                <div className="flex flex-wrap gap-x-8 gap-y-4 justify-center max-w-lg mx-auto">
                    {allergenList.map(allergen => (
                        <button
                            type="button"
                            key={allergen}
                            onClick={() => toggleAllergy(allergen)}
                            className={`
                                text-sm font-serif transition-all duration-300 relative
                                ${allergies.includes(allergen)
                                    ? 'text-[var(--color-cream)] opacity-100 line-through decoration-[var(--color-gold)] decoration-2'
                                    : 'text-[var(--color-cream)] opacity-40 hover:opacity-80'}
                            `}
                        >
                            {allergen}
                        </button>
                    ))}
                </div>
            </section>

            {/* Pantry Section (Drag & Drop) */}
            <section className="animate-[fadeIn_1.2s] text-center w-full max-w-lg mx-auto">
                <label className="block mb-6 text-[10px] uppercase tracking-[0.2em] text-[var(--color-gold)] font-cinzel opacity-80">
                    THE PANTRY
                </label>

                {/* Selection Zone (The Pass) */}
                <div
                    className={`
                        w-full min-h-[80px] mb-8 border border-dashed rounded-xl transition-all duration-300 flex flex-wrap gap-2 p-4 justify-center items-center
                        ${selectedIngredients.length === 0 ? 'border-white/20 bg-white/5' : 'border-[var(--color-gold)]/50 bg-[var(--color-gold)]/5'}
                    `}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                        e.preventDefault();
                        const item = e.dataTransfer.getData("text");
                        if (item && !selectedIngredients.includes(item)) {
                            setSelectedIngredients(prev => [...prev, item]);
                        }
                    }}
                >
                    {selectedIngredients.length === 0 ? (
                        <span className="text-white/40 text-sm font-serif italic">Drag ingredients here to include them...</span>
                    ) : (
                        selectedIngredients.map(item => (
                            <button
                                key={item}
                                type="button"
                                onClick={() => setSelectedIngredients(prev => prev.filter(i => i !== item))}
                                className="px-3 py-1 rounded-full bg-[var(--color-gold)]/20 border border-[var(--color-gold)]/40 text-[var(--color-gold)] text-xs font-cinzel hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-300 transition-colors"
                            >
                                {item} ×
                            </button>
                        ))
                    )}
                </div>

                {/* Ingredients Grid */}
                <div className="flex flex-wrap justify-center gap-3">
                    {PANTRY_ITEMS.filter(i => !selectedIngredients.includes(i)).map((item) => (
                        <div
                            key={item}
                            draggable
                            onDragStart={(e) => e.dataTransfer.setData("text", item)}
                            className="px-3 py-2 bg-white/5 border border-white/10 rounded pointer-events-auto cursor-grab active:cursor-grabbing hover:bg-white/10 hover:border-white/30 transition-all text-xs text-white/80 font-sans tracking-wide"
                        >
                            {item}
                        </div>
                    ))}
                </div>
            </section>

            <div className="flex justify-center mt-8 animate-[fadeIn_1.3s]">
                <button
                    type="submit"
                    className="btn-gold group rounded-full"
                >
                    <span className="relative z-10 transition-colors group-hover:text-[var(--color-midnight)]">Curate Experience</span>
                </button>
            </div>
        </form>
    );
};

export default InputForm;
