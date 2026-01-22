import React, { useEffect, useRef } from 'react';
import createGlobe from 'cobe';

export function Globe3D({ lat, lng, velocityRef }) {
    const canvasRef = useRef();
    // velocityRef is now passed from parent to avoid re-renders

    useEffect(() => {
        let phi = 0;
        let currentBoost = 0;

        if (!canvasRef.current) return;

        const globe = createGlobe(canvasRef.current, {
            devicePixelRatio: 2,
            width: 1000,
            height: 1000,
            phi: 0,
            theta: 0,
            dark: 1,
            diffuse: 1.2,
            mapSamples: 16000,
            mapBrightness: 6,
            baseColor: [0.15, 0.12, 0.1],
            markerColor: [0.898, 0.753, 0.482], // Modeled after --color-gold #e5c07b
            glowColor: [0.6, 0.5, 0.3],
            markers: [
                { location: [lat, lng], size: 0.07 },
                { location: [lat, lng], size: 0.07 },
                { location: [lat, lng], size: 0.07 }
            ],
            onRender: (state) => {
                const targetBoost = velocityRef.current * 0.002;
                currentBoost += (targetBoost - currentBoost) * 0.1; // Smooth easing

                state.phi = phi;
                state.theta = currentBoost * 2; // Dynamic tilt based on speed

                // Multi-ring Beacon Pulse Effect
                if (state.markers && state.markers.length >= 3) {
                    const time = phi * 3; // Speed up animation

                    // Ring 1: Main pulse - MUCH larger size for visibility
                    const pulse1 = (Math.sin(time) + 1) / 2; // 0 to 1
                    state.markers[0].size = 0.08 + (pulse1 * 0.17);

                    // Ring 2: Delayed pulse (offset by 1/3 cycle)
                    const pulse2 = (Math.sin(time - Math.PI * 2 / 3) + 1) / 2;
                    state.markers[1].size = 0.08 + (pulse2 * 0.17);

                    // Ring 3: Delayed pulse (offset by 2/3 cycle)
                    const pulse3 = (Math.sin(time - Math.PI * 4 / 3) + 1) / 2;
                    state.markers[2].size = 0.08 + (pulse3 * 0.17);
                }

                phi += 0.003 + currentBoost;
            },
        });

        return () => {
            globe.destroy();
        };
    }, [lat, lng]);

    return (
        <div className="w-full h-full flex items-center justify-center relative">
            <canvas
                ref={canvasRef}
                style={{ width: '100%', height: '100%', maxWidth: '500px', maxHeight: '500px' }}
            />

            {/* BEACON PULSE RINGS - Positioned at marker location (globe center) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="absolute w-4 h-4 rounded-full bg-[var(--color-gold)] animate-[beaconPulse_2s_ease-out_infinite]"></div>
                <div className="absolute w-4 h-4 rounded-full bg-[var(--color-gold)] animate-[beaconPulse_2s_ease-out_infinite_0.66s]"></div>
                <div className="absolute w-4 h-4 rounded-full bg-[var(--color-gold)] animate-[beaconPulse_2s_ease-out_infinite_1.33s]"></div>
            </div>
        </div>
    );
}
