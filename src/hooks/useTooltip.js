import { useState, useEffect } from 'react';

const STORAGE_KEY = 'nusion_tooltips_shown';

/**
 * Hook to manage tooltip display state
 * Tracks which tooltips have been shown using localStorage
 */
export const useTooltip = (tooltipId) => {
    const [shouldShow, setShouldShow] = useState(false);

    useEffect(() => {
        try {
            const shown = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

            // Only show if not previously shown
            if (!shown[tooltipId]) {
                setShouldShow(true);
            }
        } catch (e) {
            console.error('Error reading tooltip state:', e);
        }
    }, [tooltipId]);

    const markAsShown = () => {
        try {
            const shown = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            shown[tooltipId] = true;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(shown));
            setShouldShow(false);
        } catch (e) {
            console.error('Error saving tooltip state:', e);
        }
    };

    const reset = () => {
        try {
            const shown = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            delete shown[tooltipId];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(shown));
            setShouldShow(true);
        } catch (e) {
            console.error('Error resetting tooltip state:', e);
        }
    };

    return {
        shouldShow,
        markAsShown,
        reset
    };
};
