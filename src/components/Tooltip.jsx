import React, { useEffect, useState } from 'react';

/**
 * Premium Tooltip Component
 * Shows helpful hints to guide users, with auto-dismiss and elegant animations
 */
const Tooltip = ({ message, position = 'top', onDismiss, autoHideDelay = 5000, show = true }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (show) {
            // Delay initial show for smooth entrance
            const showTimer = setTimeout(() => setVisible(true), 100);

            // Auto-hide after delay
            if (autoHideDelay > 0) {
                const hideTimer = setTimeout(() => {
                    handleDismiss();
                }, autoHideDelay);

                return () => {
                    clearTimeout(showTimer);
                    clearTimeout(hideTimer);
                };
            }

            return () => clearTimeout(showTimer);
        }
    }, [show, autoHideDelay]);

    const handleDismiss = () => {
        setVisible(false);
        setTimeout(() => {
            if (onDismiss) onDismiss();
        }, 300); // Wait for fade-out animation
    };

    if (!show || !visible) return null;

    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-3',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-3',
        left: 'right-full top-1/2 -translate-y-1/2 mr-3',
        right: 'left-full top-1/2 -translate-y-1/2 ml-3'
    };

    const arrowClasses = {
        top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-[#2a2520]',
        bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-[#2a2520]',
        left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-[#2a2520]',
        right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-[#2a2520]'
    };

    return (
        <div className={`absolute ${positionClasses[position]} z-50 animate-[fadeIn_0.3s_ease-out]`}>
            <div className="relative bg-[#2a2520] text-white px-4 py-3 rounded-lg shadow-2xl border border-[#d4af37]/20 max-w-xs">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-[#d4af37]/5 rounded-lg blur-sm -z-10"></div>

                {/* Content */}
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#d4af37]/20 flex items-center justify-center mt-0.5">
                        <span className="text-[#d4af37] text-xs">✨</span>
                    </div>
                    <p className="text-sm leading-relaxed flex-1">{message}</p>
                    <button
                        onClick={handleDismiss}
                        className="flex-shrink-0 text-white/50 hover:text-white transition-colors ml-2"
                        aria-label="Dismiss tooltip"
                    >
                        ✕
                    </button>
                </div>

                {/* Arrow */}
                <div className={`absolute w-0 h-0 border-[6px] ${arrowClasses[position]}`}></div>
            </div>
        </div>
    );
};

export default Tooltip;
