// Pollinations AI for free AI-generated food images
// Simple and reliable when available

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
        // Enhanced prompt for better food photography
        const prompt = `${description}, professional food photography, michelin star plating, gourmet presentation, studio lighting, appetizing, delicious, 8k, high quality`;
        const seed = Math.floor(Math.random() * 100000);
        const encodedPrompt = encodeURIComponent(prompt);

        // Use Pollinations with Flux model
        const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=600&model=flux&seed=${seed}&nologo=true&enhance=true`;

        console.log(`🎨 Generating with Pollinations: "${description}"`);

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (!response.ok) {
            throw new Error(`Pollinations returned ${response.status}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.startsWith('image/')) {
            throw new Error('Invalid content type - not an image');
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');

        console.log('✅ AI image generated successfully from Pollinations');

        return res.status(200).json({
            success: true,
            image: `data:image/jpeg;base64,${base64}`
        });

    } catch (error) {
        console.error('Pollinations error:', error);

        // Fallback to Picsum if Pollinations fails
        try {
            const hash = description.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const seed = hash % 1000;
            const fallbackUrl = `https://picsum.photos/seed/${seed}/800/600`;

            const response = await fetch(fallbackUrl);
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const base64 = buffer.toString('base64');

            console.log('✅ Using Picsum fallback');

            return res.status(200).json({
                success: true,
                image: `data:image/jpeg;base64,${base64}`
            });
        } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError);
            return res.status(500).json({
                error: 'Failed to generate image',
                message: error.message
            });
        }
    }
}
