// Hugging Face Inference API for AI-generated food images
// Using Stable Diffusion XL for high-quality food photography

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

    const HF_TOKEN = process.env.HF_TOKEN;

    if (!HF_TOKEN) {
        console.error('❌ HF_TOKEN not found in environment variables');
        return res.status(500).json({ error: 'Server configuration error: Missing HF_TOKEN' });
    }

    try {
        // Enhanced prompt for better food photography - more specific and detailed
        const prompt = `A professional photograph of ${description}, gourmet food styling, michelin star restaurant plating, studio lighting, macro photography, appetizing, delicious, high-end culinary presentation, 8k resolution, sharp focus, beautiful composition, food magazine quality`;

        console.log(`🎨 Generating AI image with Hugging Face: "${description}"`);

        // Use Stable Diffusion XL via Hugging Face Inference API
        const response = await fetch(
            'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${HF_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: {
                        negative_prompt: 'blurry, low quality, distorted, ugly, bad anatomy, watermark, text, logo, people, hands, faces, unappetizing, raw ingredients, messy, dirty, artificial, plastic',
                        num_inference_steps: 35,
                        guidance_scale: 8.0,
                    }
                })
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Hugging Face API error:', response.status, errorText);

            // If model is loading, wait and retry once
            if (response.status === 503 && errorText.includes('loading')) {
                console.log('⏳ Model is loading, waiting 20 seconds...');
                await new Promise(r => setTimeout(r, 20000));

                const retryResponse = await fetch(
                    'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
                    {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${HF_TOKEN}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            inputs: prompt,
                            parameters: {
                                negative_prompt: 'blurry, low quality, distorted, ugly, bad anatomy, watermark, text, logo',
                                num_inference_steps: 30,
                                guidance_scale: 7.5,
                            }
                        })
                    }
                );

                if (!retryResponse.ok) {
                    throw new Error(`Retry failed: ${retryResponse.status}`);
                }

                const arrayBuffer = await retryResponse.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                const base64 = buffer.toString('base64');

                console.log('✅ AI image generated successfully (after retry)');

                return res.status(200).json({
                    success: true,
                    image: `data:image/jpeg;base64,${base64}`
                });
            }

            throw new Error(`HF API error: ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');

        console.log('✅ AI image generated successfully from Hugging Face');

        return res.status(200).json({
            success: true,
            image: `data:image/jpeg;base64,${base64}`
        });

    } catch (error) {
        console.error('Hugging Face generation error:', error);

        // Fallback to Picsum if HF fails
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
