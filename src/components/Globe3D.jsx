import React, { useEffect, useRef } from 'react';
import createGlobe from 'cobe';

export function Globe3D({ lat, lng, velocityRef, size = 500 }) {
    const canvasRef = useRef();

    useEffect(() => {
        if (!canvasRef.current) return;

        // Convert lat/lng to radians for Cobe
        const initialPhi = 4.7 - (lng * Math.PI / 180);
        const initialTheta = lat * (Math.PI / 180);

        let phi = initialPhi;

        const globe = createGlobe(canvasRef.current, {
            devicePixelRatio: 2,
            width: size * 2,
            height: size * 2,
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
                const velocity = velocityRef?.current || 0;
                phi += 0.003 + (velocity * 0.002);
                state.phi = phi;
            },
        });

        return () => {
            globe.destroy();
        };
    }, [lat, lng, velocityRef, size]);

    return (
        <div className="w-full h-full flex items-center justify-center relative">
            <canvas
                ref={canvasRef}
                style={{
                    width: '100%',
                    height: '100%',
                    aspectRatio: '1/1'
                }}
            />
        </div>
    );
}
