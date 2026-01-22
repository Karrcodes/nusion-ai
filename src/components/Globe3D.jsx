import React, { useEffect, useRef } from 'react';
import createGlobe from 'cobe';

export function Globe3D({ lat, lng, scrollVelocity = 0 }) {
    const canvasRef = useRef();
    const velocityRef = useRef(0);

    // Sync ref for access inside the render loop without re-triggering effect
    useEffect(() => {
        velocityRef.current = scrollVelocity;
    }, [scrollVelocity]);

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
            markerColor: [1, 0.8, 0],
            glowColor: [0.6, 0.5, 0.3],
            markers: [
                { location: [lat, lng], size: 0.1 }
            ],
            onRender: (state) => {
                const targetBoost = velocityRef.current * 0.002;
                currentBoost += (targetBoost - currentBoost) * 0.1; // Smooth easing

                state.phi = phi;
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
