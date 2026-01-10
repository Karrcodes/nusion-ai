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

    try {
        // We use 'flux' model for better quality and to avoid 'turbo' rate limits
        const seed = Math.floor(Math.random() * 100000);
        const encodedPrompt = encodeURIComponent(`${description}, food photography, 8k, photorealistic, cinematic lighting`);
        // Use the dedicated image API endpoint
        const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=600&model=flux&seed=${seed}&nologo=true`;

        console.log(`🎨 Fetching from Pollinations (Flux): ${pollinationsUrl}`);

        // Fetch the image from Pollinations
        const response = await fetch(pollinationsUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (!response.ok) {
            throw new Error(`Pollinations API error: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.startsWith('image/')) {
            console.warn('Received non-image content type:', contentType);
            throw new Error('Received non-image response from Pollinations');
        }

        // Get the image as a buffer
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Convert to base64
        const base64 = buffer.toString('base64');
        const mimeType = contentType || 'image/jpeg';
        const dataUrl = `data:${mimeType};base64,${base64}`;

        console.log('✅ Image fetched & converted successfully');

        return res.status(200).json({
            success: true,
            image: dataUrl
        });

    } catch (error) {
        console.error('Image generation error:', error);
        return res.status(500).json({
            error: 'Failed to generate image',
            message: error.message
        });
    }
}
