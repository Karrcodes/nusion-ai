import { useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';

export function Globe3D({ lat, lng, velocityRef }) {
    const globeEl = useRef();
    const [markerSize, setMarkerSize] = useState(0.5);

    // Beacon pulse animation
    useEffect(() => {
        let animationId;
        let time = 0;

        const animate = () => {
            time += 0.05;
            // Pulsing effect: oscillate between 0.3 and 0.8
            const pulse = 0.3 + Math.abs(Math.sin(time)) * 0.5;
            setMarkerSize(pulse);
            animationId = requestAnimationFrame(animate);
        };

        animate();
        return () => cancelAnimationFrame(animationId);
    }, []);

    // Auto-rotate based on scroll velocity
    useEffect(() => {
        if (!globeEl.current) return;

        const controls = globeEl.current.controls();
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.5;
        controls.enableZoom = false;

        // Point camera at the marker location
        globeEl.current.pointOfView({ lat, lng, altitude: 2 }, 1000);
    }, [lat, lng]);

    const markerData = [{
        lat,
        lng,
        size: markerSize,
        color: '#e5c07b' // Gold color
    }];

    return (
        <Globe
            ref={globeEl}
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
            backgroundColor="rgba(0,0,0,0)"

            // Markers
            htmlElementsData={markerData}
            htmlElement={d => {
                const el = document.createElement('div');
                el.innerHTML = `
                    <div style="
                        width: ${d.size * 20}px;
                        height: ${d.size * 20}px;
                        border-radius: 50%;
                        background: radial-gradient(circle, ${d.color} 0%, ${d.color}80 50%, transparent 100%);
                        box-shadow: 0 0 ${d.size * 30}px ${d.color};
                        animation: pulse 2s ease-in-out infinite;
                    "></div>
                `;
                return el;
            }}

            // Atmosphere
            atmosphereColor="#d4af37"
            atmosphereAltitude={0.15}

            // Performance
            animateIn={false}
        />
    );
}
