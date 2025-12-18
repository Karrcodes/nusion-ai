import { menuItems } from '../data/menuData';

// Helper to shuffle array for randomness
const shuffle = (array) => [...array].sort(() => 0.5 - Math.random());

/**
 * Main Recommendation Engine
 * @param {Object} preferences - { spiceTolerance (1-5), allergies (Array<String>), budget (Number) }
 * @param {Array} customMenu - Optional: specific restaurant menu items to generate from
 * @returns {Object} { courses: Array<Object>, totalCost: Number, narrative: String, error: String }
 */
export function getRecommendation(preferences, customMenu = null) {
    const { spiceTolerance, allergies, budget } = preferences;

    // Use custom menu if provided, otherwise fallback to default
    let sourceMenu = customMenu && customMenu.length > 0 ? customMenu : menuItems;

    // 0. NORMALIZE: Ensure items have a 'type'
    // If 'type' is missing, infer it based on context
    const avgPrice = sourceMenu.reduce((sum, i) => sum + (i.cost || 0), 0) / (sourceMenu.length || 1);

    sourceMenu = sourceMenu.map(item => {
        if (item.type) return item;

        let inferredType = 'Main';
        const nameLower = (item.name || '').toLowerCase();

        if (nameLower.includes('soup') || nameLower.includes('salad') || nameLower.includes('starter') || (item.cost < avgPrice * 0.6)) {
            inferredType = 'Starter';
        } else if (nameLower.includes('cake') || nameLower.includes('ice cream') || nameLower.includes('sweet') || nameLower.includes('dessert') || nameLower.includes('chocolate')) {
            inferredType = 'Dessert';
        }

        return { ...item, type: inferredType };
    });

    // 1. FILTER: Safety & Spice
    const edibleItems = sourceMenu.filter(item => {
        const hasAllergy = (item.allergens || []).some(allergen => allergies.includes(allergen));
        return !hasAllergy && (item.spiceLevel <= spiceTolerance);
    });

    if (edibleItems.length === 0) {
        return { error: "No menu items available that match your dietary settings." };
    }

    // 2. STRATEGY A: Strict 3-Course (Starter -> Main -> Dessert)
    const starters = shuffle(edibleItems.filter(i => i.type === 'Starter'));
    const mains = shuffle(edibleItems.filter(i => i.type === 'Main'));
    const desserts = shuffle(edibleItems.filter(i => i.type === 'Dessert'));

    let bestMenu = null;
    let bestScore = -1;

    // Try Standard 3-Course
    if (starters.length && mains.length && desserts.length) {
        for (const starter of starters) {
            for (const main of mains) {
                for (const dessert of desserts) {
                    const total = (starter.cost || 0) + (main.cost || 0) + (dessert.cost || 0);
                    if (total <= budget) {
                        const score = (new Set([starter.flavorProfile, main.flavorProfile, dessert.flavorProfile]).size * 10) + (total / budget);
                        if (score > bestScore) {
                            bestScore = score;
                            bestMenu = [starter, main, dessert];
                        }
                    }
                }
            }
        }
    }

    // 3. STRATEGY B: Flexible "Chef's Tasting" (Any 3 distinct items)
    if (!bestMenu) {
        // Pool all items, try to find any 3 unique items that fit budget
        const pool = shuffle([...edibleItems]);
        if (pool.length >= 3) {
            for (let i = 0; i < pool.length; i++) {
                for (let j = i + 1; j < pool.length; j++) {
                    for (let k = j + 1; k < pool.length; k++) {
                        const menu = [pool[i], pool[j], pool[k]];
                        const total = menu.reduce((sum, it) => sum + (it.cost || 0), 0);
                        if (total <= budget) {
                            bestMenu = menu; // Just take the first valid combo for speed in fallback
                            break;
                        }
                    }
                    if (bestMenu) break;
                }
                if (bestMenu) break;
            }
        }
    }

    // 4. STRATEGY C: Power Duo (Any 2 items)
    if (!bestMenu) {
        const pool = shuffle([...edibleItems]);
        if (pool.length >= 2) {
            for (let i = 0; i < pool.length; i++) {
                for (let j = i + 1; j < pool.length; j++) {
                    const menu = [pool[i], pool[j]];
                    const total = menu.reduce((sum, it) => sum + (it.cost || 0), 0);
                    if (total <= budget) {
                        bestMenu = menu;
                        break;
                    }
                }
                if (bestMenu) break;
            }
        }
    }

    // 5. STRATEGY D: The Soloist (Single Item Fallback)
    if (!bestMenu) {
        const pool = shuffle([...edibleItems]);
        for (const item of pool) {
            if ((item.cost || 0) <= budget) {
                bestMenu = [item];
                break;
            }
        }
    }

    if (!bestMenu) {
        return { error: `Budget (£${budget}) is too low for the available menu items.` };
    }

    // 4. GENERATE NARRATIVE
    const names = bestMenu.map(i => i.name).join(', then ');
    const narrative = `A curated selection featuring ${names}. Tailored to your palate and budget.`;

    return {
        courses: bestMenu,
        totalCost: bestMenu.reduce((sum, i) => sum + (i.cost || 0), 0),
        narrative
    };
}
