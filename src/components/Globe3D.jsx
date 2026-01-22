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
                { location: [lat, lng], size: 0.1 }
            ],
            onRender: (state) => {
                const targetBoost = velocityRef.current * 0.002;
                currentBoost += (targetBoost - currentBoost) * 0.1; // Smooth easing

                state.phi = phi;
                state.theta = currentBoost * 2; // Dynamic tilt based on speed

                // Beacon Pulse Effect
                if (state.markers && state.markers[0]) {
                    // Use modulo to create repeating pulse cycles
                    const pulseSpeed = 3; // Seconds per pulse
                    const cycle = (phi * 0.5) % pulseSpeed;
                    const progress = cycle / pulseSpeed;

                    // Exponential easing out for beacon effect (quick expand, slow fade)
                    const eased = 1 - Math.pow(1 - progress, 3);

                    // Size varies from 0.05 (small) to 0.15 (large)
                    state.markers[0].size = 0.05 + (eased * 0.1);
                }

                phi += 0.003 + currentBoost;
            },
        });

        return () => {
            globe.destroy();
        };
    }, [lat, lng]);

    return (
        <div className="w-full h-full flex items-center justify-center">
            <canvas
                ref={canvasRef}
                style={{ width: '100%', height: '100%', maxWidth: '500px', maxHeight: '500px' }}
            />
        </div>
    );
}
