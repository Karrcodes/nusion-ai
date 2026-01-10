/**
 * Vercel Serverless Function - Image Generation Proxy
 * Fetches AI-generated images from Pollinations.ai and returns them as base64
 * This bypasses CORS restrictions by handling the request server-side
 */

export default async function handler(req, res) {
    // Enable CORS for your domain
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
        const seed = Math.floor(Math.random() * 1000000);
        const enhancedPrompt = `Michelin star fine dining dish, ${description}, professional food photography, studio lighting, hyper-realistic, 8k resolution, elegant plating, cinematic lighting, shallow depth of field, sharp focus, magazine quality`;

        const encodedPrompt = encodeURIComponent(enhancedPrompt);
        const pollinationsUrl = `https://pollinations.ai/p/${encodedPrompt}?width=1024&height=1024&seed=${seed}&nologo=true&model=flux`;

        console.log('Fetching image from Pollinations:', pollinationsUrl);

        // Fetch the image from Pollinations
        const response = await fetch(pollinationsUrl);

        if (!response.ok) {
            throw new Error(`Pollinations API error: ${response.status}`);
        }

        // Get the image as a buffer
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Convert to base64
        const base64 = buffer.toString('base64');
        const dataUrl = `data:image/jpeg;base64,${base64}`;

        // Return the base64 image
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
