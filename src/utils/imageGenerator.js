/**
 * Generates AI food images using Hugging Face via backend proxy
 * @param {string} description - The description of the dish to generate
 * @param {number} retries - Number of retry attempts (default: 2)
 * @returns {Promise<string>} - Base64 data URL of the generated image
 */
export const generateDishImage = async (description, retries = 2) => {
    console.log('🖼️ Requesting AI-generated image from Hugging Face...');

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            // Add timeout to prevent hanging requests
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

            // Call our serverless function
            const response = await fetch(`/api/generate-image?description=${encodeURIComponent(description)}`, {
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));

                // Check for rate limiting
                if (response.status === 429) {
                    console.warn(`⏳ Rate limited. Attempt ${attempt + 1}/${retries + 1}`);
                    if (attempt < retries) {
                        await new Promise(r => setTimeout(r, 2000 * (attempt + 1))); // Exponential backoff
                        continue;
                    }
                }

                console.error('Frontend reported error. Backend response:', errorData);
                throw new Error(errorData.message || `API error: ${response.status}`);
            }

            const data = await response.json();

            if (data.success && data.image) {
                console.log('✅ AI image generated successfully via Hugging Face');
                return data.image;
            } else {
                throw new Error(data.error || 'Unknown error');
            }
        } catch (error) {
            // Handle timeout
            if (error.name === 'AbortError') {
                console.warn(`⏱️ Request timeout. Attempt ${attempt + 1}/${retries + 1}`);
                if (attempt < retries) {
                    continue;
                }
            }

            // Log error and retry if attempts remain
            console.error(`❌ Failed to generate AI image (attempt ${attempt + 1}/${retries + 1}):`, error.message);

            if (attempt < retries) {
                await new Promise(r => setTimeout(r, 1000 * (attempt + 1))); // Exponential backoff
                continue;
            }

            // Final fallback after all retries exhausted
            console.log('🎨 Using fallback placeholder image');
            const hash = description.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const seed = hash % 1000;
            return `https://picsum.photos/seed/${seed}/800/600`;
        }
    }
};
