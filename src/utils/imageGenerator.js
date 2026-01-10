/**
 * Generates an AI food image using our backend proxy
 * @param {string} description - The description of the dish to generate
 * @returns {Promise<string>} - Base64 data URL of the generated image
 */
export const generateDishImage = async (description) => {
    console.log('🖼️ Requesting AI-generated image from backend...');

    try {
        // Call our serverless function instead of Pollinations directly
        const response = await fetch(`/api/generate-image?description=${encodeURIComponent(description)}`);

        if (!response.ok) {
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
        console.error('❌ Failed to generate AI image:', error);
        // Return a fallback placeholder if AI generation fails
        const fallbackSeed = Math.floor(Math.random() * 1000);
        return `https://picsum.photos/seed/${fallbackSeed}/800/600`;
    }
};
