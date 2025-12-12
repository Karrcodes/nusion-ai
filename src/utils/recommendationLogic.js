import { menuItems } from '../data/menuData';

// Helper to shuffle array for randomness
const shuffle = (array) => [...array].sort(() => 0.5 - Math.random());

/**
 * Main Recommendation Engine
 * @param {Object} preferences - { spiceTolerance (1-5), allergies (Array<String>), budget (Number) }
 * @returns {Object} { courses: Array<Object>, totalCost: Number, narrative: String, error: String }
 */
export function getRecommendation(preferences) {
    const { spiceTolerance, allergies, budget } = preferences;

    // 1. FILTER: Safety first (Allergies)
    // Exclude any item that has ANY of the user's allergies
    const safeItems = menuItems.filter(item => {
        const hasAllergy = item.allergens.some(allergen => allergies.includes(allergen));
        return !hasAllergy;
    });

    // 2. FILTER: Spice Tolerance
    // Exclude items strictly hotter than tolerance.
    const edibleItems = safeItems.filter(item => item.spiceLevel <= spiceTolerance);

    // Group by Type
    const starters = shuffle(edibleItems.filter(i => i.type === 'Starter'));
    const mains = shuffle(edibleItems.filter(i => i.type === 'Main'));
    const desserts = shuffle(edibleItems.filter(i => i.type === 'Dessert'));

    if (!starters.length || !mains.length || !desserts.length) {
        return { error: "Constraints too strict. Unable to find a complete 3-course meal." };
    }

    // 3. SELECT: Combinatorial Search for "Best" Menu
    // "Best" = 
    // - Total Cost <= Budget
    // - Maximizes flavor variety (unique profiles)
    // - Maximizes cost (closest to budget without going over -> premium feel)

    let bestMenu = null;
    let bestScore = -1;

    // Simple brute force since N is very small (5x5x5 = 125 combinations max)
    for (const starter of starters) {
        for (const main of mains) {
            for (const dessert of desserts) {

                const total = starter.cost + main.cost + dessert.cost;

                if (total <= budget) {
                    // Calculate Score

                    // Flavor Variety Score: Count unique profiles (max 3)
                    const profiles = new Set([starter.flavorProfile, main.flavorProfile, dessert.flavorProfile]);
                    const varietyScore = profiles.size; // 1, 2, or 3

                    // Budget Utilization Score: Percentage of budget used (0-1)
                    const budgetScore = total / budget;

                    // Weighted Score (Variety is king, strict budget enforced)
                    const finalScore = (varietyScore * 10) + budgetScore;

                    if (finalScore > bestScore) {
                        bestScore = finalScore;
                        bestMenu = [starter, main, dessert];
                    }
                }
            }
        }
    }

    if (!bestMenu) {
        return { error: `Budget too low. Minimum cost for a meal is approx £${Math.min(...starters.map(s => s.cost)) + Math.min(...mains.map(m => m.cost)) + Math.min(...desserts.map(d => d.cost))}.` };
    }

    // 4. GENERATE NARRATIVE
    const [s, m, d] = bestMenu;
    const narrative = `Your journey begins with the ${s.flavorProfile} notes of the ${s.name}, setting a sophisticated tone. This transitions seamlessly into the ${m.flavorProfile} richness of the ${m.name}, providing a hearty, complex centerpiece. Finally, the palate is cleansed and delighted by the ${d.flavorProfile} finish of our signature ${d.name}. A perfectly balanced experience.`;

    return {
        courses: bestMenu,
        totalCost: s.cost + m.cost + d.cost,
        narrative
    };
}
