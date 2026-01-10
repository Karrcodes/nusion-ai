import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

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
        const enhancedPrompt = `Michelin star fine dining dish, ${description}, professional food photography, studio lighting, hyper-realistic, 8k resolution, elegant plating, cinematic lighting, shallow depth of field, sharp focus, magazine quality`;

        console.log('🎨 Generating AI image with Hugging Face SDK...');

        // Use the SDK to generate the image
        const blob = await hf.textToImage({
            model: 'runwayml/stable-diffusion-v1-5',
            inputs: enhancedPrompt,
            parameters: {
                negative_prompt: 'blurry, low quality, distorted, ugly, bad anatomy',
            }
        });

        // Convert Blob to ArrayBuffer
        const arrayBuffer = await blob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Convert to base64
        const base64 = buffer.toString('base64');
        const dataUrl = `data:image/jpeg;base64,${base64}`;

        console.log('✅ Image generated successfully');

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
