/**
 * Generates AI food images using Hugging Face via backend proxy
 * @param {string} description - The description of the dish to generate
 * @param {number} retries - Number of retry attempts (default: 1)
 * @returns {Promise<string>} - Base64 data URL of the generated image
 */
export const generateDishImage = async (description, retries = 1) => {
    console.log('🖼️ Requesting AI-generated image...');

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            // Add timeout to prevent hanging requests
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

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
                console.log('✅ AI image generated successfully');
                return data.image;
            } else {
                throw new Error(data.error || 'Unknown error');
            }
        } catch (error) {
            console.warn(`⚠️ Image generation failed (attempt ${attempt + 1}/${retries + 1}):`, error.message);

            if (attempt < retries) {
                await new Promise(r => setTimeout(r, 1000));
                continue;
            }

            // Immediate fallback to Picsum after retries exhausted
            console.log('🎨 Using fallback placeholder image');
            const hash = description.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const seed = hash % 1000;
            return `https://picsum.photos/seed/${seed}/800/600`;
        }
    }
};
