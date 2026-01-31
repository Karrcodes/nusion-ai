// Initialize HfInference with the Router API endpoint
// Using Unsplash for reliable food photography

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
        // Extract key food terms from description for better search
        const foodKeywords = description
            .toLowerCase()
            .replace(/\b(with|and|in|on|of|the|a|an)\b/g, '')
            .split(/[\s,]+/)
            .filter(word => word.length > 3)
            .slice(0, 3)
            .join(',');

        const searchQuery = foodKeywords || 'gourmet food';

        // Use Unsplash Source API (no auth required for basic usage)
        // This returns a random photo from the search results
        const seed = description.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const url = `https://source.unsplash.com/800x600/?${encodeURIComponent(searchQuery)},food,restaurant&sig=${seed}`;

        console.log(`🎨 Fetching from Unsplash: ${searchQuery}`);

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            redirect: 'follow'
        });

        if (!response.ok) {
            throw new Error(`Unsplash returned ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');
        const mimeType = 'image/jpeg';

        console.log('✅ Image fetched successfully from Unsplash');

        return res.status(200).json({
            success: true,
            image: `data:${mimeType};base64,${base64}`
        });

    } catch (error) {
        console.error('Unsplash fetch error:', error);

        // Fallback to Picsum if Unsplash fails
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
