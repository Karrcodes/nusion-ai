import { HfInference } from '@huggingface/inference';

// Initialize HfInference with the Router API endpoint
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY, {
    endpoint: "https://router.huggingface.co/hf-inference", // Explicitly use the router endpoint
});

export default async function handler(req, res) {
    // ... (rest of handler) ...

    try {
        const enhancedPrompt = `Michelin star fine dining dish, ${description}, professional food photography, studio lighting, hyper-realistic, 8k resolution, elegant plating, cinematic lighting, shallow depth of field, sharp focus, magazine quality`;

        console.log('🎨 Generating AI image with Hugging Face SDK (Router API)...');

        // Use the SDK to generate the image using a reliable model
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
