import { createContext, useContext, useState } from 'react';

const ImpersonationContext = createContext();

export const useImpersonation = () => {
    const context = useContext(ImpersonationContext);
    if (!context) {
        throw new Error('useImpersonation must be used within ImpersonationProvider');
    }
    return context;
};

export const ImpersonationProvider = ({ children }) => {
    const [impersonatedRestaurant, setImpersonatedRestaurant] = useState(null);
    const [isImpersonating, setIsImpersonating] = useState(false);

    const startImpersonation = (restaurantData) => {
        setImpersonatedRestaurant(restaurantData);
        setIsImpersonating(true);
        // Store in sessionStorage for persistence across page reloads
        sessionStorage.setItem('nusion_impersonation', JSON.stringify(restaurantData));
    };

    const exitImpersonation = () => {
        setImpersonatedRestaurant(null);
        setIsImpersonating(false);
        sessionStorage.removeItem('nusion_impersonation');
    };

    // Check for existing impersonation session on mount
    const checkImpersonationSession = () => {
        const stored = sessionStorage.getItem('nusion_impersonation');
        if (stored) {
            try {
                const data = JSON.parse(stored);
                setImpersonatedRestaurant(data);
                setIsImpersonating(true);
            } catch (e) {
                console.error('Failed to parse impersonation session:', e);
                sessionStorage.removeItem('nusion_impersonation');
            }
        }
    };

    return (
        <ImpersonationContext.Provider
            value={{
                impersonatedRestaurant,
                isImpersonating,
                startImpersonation,
                exitImpersonation,
                checkImpersonationSession
            }}
        >
            {children}
        </ImpersonationContext.Provider>
    );
};

export default ImpersonationContext;
