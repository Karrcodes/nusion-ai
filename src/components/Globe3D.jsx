import { useEffect, useRef, useState, useMemo } from 'react';
import Globe from 'react-globe.gl';

export function Globe3D({ lat, lng, velocityRef }) {
    const globeEl = useRef();
    const [countries, setCountries] = useState({ features: [] });

    // Load GeoJSON for the "Technical Dotted" look
    useEffect(() => {
        fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
            .then(res => res.json())
            .then(setCountries);
    }, []);

    // Technical Spin Speed & Control setup
    useEffect(() => {
        if (!globeEl.current) return;
        const controls = globeEl.current.controls();
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.5;
        controls.enableZoom = false;

        let frameId;
        const update = () => {
            // Add scroll velocity to rotation for interactive feel
            const speed = 0.5 + Math.min(velocityRef.current * 0.2, 10);
            controls.autoRotateSpeed = speed;
            frameId = requestAnimationFrame(update);
        };
        update();
        return () => cancelAnimationFrame(frameId);
    }, []);

    // Point camera at the marker location
    useEffect(() => {
        if (globeEl.current) {
            globeEl.current.pointOfView({ lat, lng, altitude: 2 }, 1000);
        }
    }, [lat, lng]);

    // Beacon Rings Data (The smooth pulse the user liked)
    const ringsData = useMemo(() => [
        { lat, lng }
    ], [lat, lng]);

    return (
        <Globe
            ref={globeEl}
            backgroundColor="rgba(0,0,0,0)"
            globeImageUrl={null} // Pure black base for contrast

            // The "Black with Brown Dots" Look (Technical Style)
            // Hexagons with high margin simulate the procedural dot grid from cobe
            hexPolygonsData={countries.features}
            hexPolygonResolution={3}
            hexPolygonMargin={0.65}
            hexPolygonColor={() => '#5a461c'} // Brownish/Dimmed Gold land

            // The Beacon Pulse
            ringsData={ringsData}
            ringColor={() => '#e5c07b'}
            ringMaxRadius={15}
            ringPropagationSpeed={2.5}
            ringRepeatPeriod={800}

            // Central Point Marker
            htmlElementsData={[{ lat, lng }]}
            htmlElement={() => {
                const el = document.createElement('div');
                el.className = 'w-2 h-2 rounded-full bg-[#e5c07b] shadow-[0_0_15px_#e5c07b]';
                return el;
            }}

            // Atmosphere
            showAtmosphere={true}
            atmosphereColor="#8a702a"
            atmosphereAltitude={0.15}
            animateIn={false}
        />
    );
}
