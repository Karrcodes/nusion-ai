import React, { useEffect, useRef } from 'react';
import createGlobe from 'cobe';

export function Globe3D({ lat, lng, velocityRef }) {
    const canvasRef = useRef();

    useEffect(() => {
        if (!canvasRef.current) return;

        // Convert lat/lng to radians
        // Cobe's phi is longitude rotation
        // Cobe's theta is latitude rotation
        const initialPhi = -lng * (Math.PI / 180);
        const initialTheta = lat * (Math.PI / 180);

        let phi = initialPhi;
        let currentBoost = 0;

        const globe = createGlobe(canvasRef.current, {
            devicePixelRatio: 2,
            width: 1000,
            height: 1000,
            phi: initialPhi,
            theta: initialTheta,
            dark: 1,
            diffuse: 1.2,
            mapSamples: 16000,
            mapBrightness: 6,
            baseColor: [0.15, 0.12, 0.1],
            markerColor: [0.898, 0.753, 0.482],
            glowColor: [0.6, 0.5, 0.3],
            location: [lat, lng],
            markers: [
                { location: [lat, lng], size: 0.1 }
            ],
            onRender: (state) => {
                const targetBoost = velocityRef.current * 0.002;
                currentBoost += (targetBoost - currentBoost) * 0.1;

                state.phi = phi;
                // Add velocity tilt TO the initial latitude, don't replace it
                state.theta = initialTheta + (currentBoost * 2);

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
        </div>
    );
}
