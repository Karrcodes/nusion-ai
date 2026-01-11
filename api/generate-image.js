// Initialize HfInference with the Router API endpoint
// Removed unused HfInference import to prevent confusion

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { description } = req.query;

    if (!description) {
        return res.status(400).json({ error: 'Description parameter is required' });
    }

    // Helper to fetch with model fallback
    const fetchImage = async (prompt, model) => {
        const seed = Math.floor(Math.random() * 100000);
        const encodedPrompt = encodeURIComponent(`${prompt}, food photography, 8k, photorealistic, cinematic lighting`);
        const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=600&model=${model}&seed=${seed}&nologo=true`;

        console.log(`🎨 Fetching from Pollinations (${model}): ${url}`);

        const res = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
        });

        if (!res.ok) throw new Error(`Status ${res.status}`);

        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.startsWith('image/')) throw new Error('Invalid content type');

        return res.arrayBuffer();
    };

    try {
        let arrayBuffer;

        // Attempt 1: Flux (High Quality)
        try {
            arrayBuffer = await fetchImage(description, 'flux');
        } catch (error) {
            console.warn(`Flux model failed (${error.message}). Falling back to Turbo.`);
            // Attempt 2: Turbo (Reliable / Faster)
            arrayBuffer = await fetchImage(description, 'turbo');
        }

        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');
        const mimeType = 'image/jpeg'; // Checking type is cleaner but for now assume jpeg

        return res.status(200).json({
            success: true,
            image: `data:${mimeType};base64,${base64}`
        });

    } catch (error) {
        console.error('Image generation fatal error:', error);
        return res.status(500).json({ error: 'Failed to generate image', message: error.message });
    }
}
