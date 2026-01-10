/**
 * Restaurant Matcher Utility
 * Calculates compatibility scores between user preferences and restaurants
 */

/**
 * Calculate match score between user preferences and a restaurant
 * @param {Object} userPreferences - User's dietary DNA and preferences
 * @param {Object} restaurant - Restaurant profile from Supabase
 * @returns {number} Match score (0-100)
 */
export function calculateMatchScore(userPreferences, restaurant) {
    let score = 100;
    const penalties = [];

    // Dietary Restrictions (Critical - Heavy Penalty)
    if (userPreferences.vegan && !restaurant.supports_vegan) {
        score -= 40;
        penalties.push('vegan');
    }
    if (userPreferences.halal && !restaurant.supports_halal) {
        score -= 40;
        penalties.push('halal');
    }
    if (userPreferences.glutenFree && !restaurant.supports_gluten_free) {
        score -= 40;
        penalties.push('gluten-free');
    }

    // Budget Alignment (Moderate Penalty)
    if (userPreferences.budget && restaurant.price_range) {
        const budgetDiff = Math.abs(
            userPreferences.budget.length - restaurant.price_range.length
        );
        if (budgetDiff > 1) {
            score -= 15;
            penalties.push('budget');
        } else if (budgetDiff === 1) {
            score -= 5;
        }
    }

    // Location Proximity (Light Penalty)
    if (userPreferences.location && restaurant.city) {
        if (userPreferences.location !== restaurant.city) {
            score -= 10;
            penalties.push('location');
        }
    }

    // Spicy Preference (Light Penalty)
    if (userPreferences.spicy === false && restaurant.cuisine_type?.includes('Spicy')) {
        score -= 5;
    }

    // Allergies Check (Critical)
    if (userPreferences.allergiesList && userPreferences.allergiesList.length > 0) {
        // For now, assume restaurants can accommodate allergies
        // In future, check against restaurant's allergen info
    }

    return Math.max(0, Math.min(100, score));
}

/**
 * Categorize restaurants by match score
 * @param {Array} restaurants - Array of restaurants with match scores
 * @returns {Object} Categorized restaurants
 */
export function categorizeRestaurants(restaurants) {
    const perfectMatches = restaurants.filter(r => r.matchScore >= 90);
    const goodMatches = restaurants.filter(r => r.matchScore >= 70 && r.matchScore < 90);
    const exploratory = restaurants.filter(r => r.matchScore >= 50 && r.matchScore < 70);

    return {
        perfectMatches: perfectMatches.sort((a, b) => b.matchScore - a.matchScore),
        exploreNewFlavors: goodMatches.sort((a, b) => b.matchScore - a.matchScore),
        exploratory: exploratory.sort((a, b) => b.matchScore - a.matchScore)
    };
}

/**
 * Get match badge color based on score
 * @param {number} score - Match score (0-100)
 * @returns {Object} Color classes for badge
 */
export function getMatchBadgeColor(score) {
    if (score >= 90) {
        return {
            bg: 'bg-gradient-to-r from-green-500 to-emerald-600',
            text: 'text-white',
            ring: 'ring-green-500/20'
        };
    } else if (score >= 70) {
        return {
            bg: 'bg-gradient-to-r from-accent-wa to-accent-fusion',
            text: 'text-white',
            ring: 'ring-accent-wa/20'
        };
    } else {
        return {
            bg: 'bg-gradient-to-r from-accent-jp to-accent-fusion',
            text: 'text-white',
            ring: 'ring-accent-jp/20'
        };
    }
}
