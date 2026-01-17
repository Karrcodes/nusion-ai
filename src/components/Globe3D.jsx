import React, { useEffect, useRef } from 'react';
import createGlobe from 'cobe';

export function Globe3D({ lat, lng }) {
    const canvasRef = useRef();

    useEffect(() => {
        let phi = 0;

        // Convert Lat/Lng to Cobe rotation (radians)
        // Cobe uses phi (vertical) and theta (horizontal)
        // We need to target the camera to the lat/lng.
        // Instead of moving the camera, we rotate the globe to center the point.
        // Target Phi (H): -(Lng * PI / 180) 
        // Target Theta (V): Lat * PI / 180
        // Actually Cobe's `phi` is longitude rotation.

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
            baseColor: [0.15, 0.12, 0.1], // Warm Black/Brown Base
            markerColor: [1, 0.8, 0], // Gold
            glowColor: [0.6, 0.5, 0.3], // Warm Gold/Brown Glow
            markers: [
                { location: [lat, lng], size: 0.1 } // The target dish origin
            ],
            onRender: (state) => {
                // ROTATION LOGIC:
                // We want to center the marker [lat, lng]
                // Cobe starts at 0,0 (Africa/Gulf of Guinea approximately)
                // Adjust phi to rotate locally.

                // Target Longitude Focus:
                // We want the view to center on `lng`.
                // state.phi = initial + rotation
                // Let's just create a slow spin for now, but lock starting position?

                state.phi = phi;
                phi += 0.003; // Slow rotation
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
