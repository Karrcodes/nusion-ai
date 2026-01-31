/**
 * Generates AI food images using Hugging Face via backend proxy
 * @param {string} description - The description of the dish to generate
 * @param {number} retries - Number of retry attempts (default: 1)
 * @returns {Promise<string>} - Base64 data URL of the generated image
 */
export const generateDishImage = async (description, retries = 2) => {
    console.log('🖼️ Requesting AI-generated image...');

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            // Add timeout to prevent hanging requests - HF models can take 20-60s on cold start
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout for HF cold starts

            // Call our serverless function
            const response = await fetch(`/api/generate-image?description=${encodeURIComponent(description)}`, {
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                console.warn(`⚠️ API returned ${response.status}. Using fallback.`);
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();

            if (data.success && data.image) {
                // Check if it's actually AI-generated or fallback
                const isAI = data.image.startsWith('data:image');
                console.log(`✅ AI image generated successfully ${isAI ? '(AI-generated)' : '(fallback)'}`);
                return data.image;
            } else {
                throw new Error(data.error || 'Unknown error');
            }
        } catch (error) {
            console.warn(`⚠️ Image generation failed (attempt ${attempt + 1}/${retries + 1}):`, error.message);

            if (attempt < retries) {
                console.log(`⏳ Retrying in 2 seconds...`);
                await new Promise(r => setTimeout(r, 2000));
                continue;
            }

            // Immediate fallback to Picsum after retries exhausted
            console.log('🎨 Using fallback placeholder image (Picsum)');
            const hash = description.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const seed = hash % 1000;
            return `https://picsum.photos/seed/${seed}/800/600`;
        }
    }
};
