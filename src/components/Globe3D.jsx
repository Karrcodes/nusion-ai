import React, { useEffect, useRef } from 'react';
import createGlobe from 'cobe';

export function Globe3D({ lat, lng, velocityRef }) {
    const canvasRef = useRef();

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
            baseColor: [0.15, 0.12, 0.1], // The "Brown" base
            markerColor: [0.898, 0.753, 0.482], // Gold markers
            glowColor: [0.6, 0.5, 0.3],

            // KEY: Centering the globe on the target location
            location: [lat, lng],

            markers: [
                { location: [lat, lng], size: 0.1 }
            ],
            onRender: (state) => {
                const targetBoost = velocityRef.current * 0.002;
                currentBoost += (targetBoost - currentBoost) * 0.1; // Smooth easing

                state.phi = phi;
                state.theta = currentBoost * 2; // Dynamic tilt based on speed
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
                style={{
                    width: '100%',
                    height: '100%',
                    maxWidth: '500px',
                    maxHeight: '500px',
                    cursor: 'grab'
                }}
            />

            {/* 
                BEACON PULSE: 
                Since cobe 'location' centers the lat/lng, 
                this CSS pulse at container center will always align with the marker.
            */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="absolute w-6 h-6 rounded-full bg-[var(--color-gold)] opacity-40 animate-[beaconPulse_2s_ease-out_infinite]"></div>
                <div className="absolute w-6 h-6 rounded-full bg-[var(--color-gold)] opacity-30 animate-[beaconPulse_2s_ease-out_infinite_0.66s]"></div>
                <div className="absolute w-6 h-6 rounded-full bg-[var(--color-gold)] opacity-20 animate-[beaconPulse_2s_ease-out_infinite_1.33s]"></div>
            </div>
        </div>
    );
}
