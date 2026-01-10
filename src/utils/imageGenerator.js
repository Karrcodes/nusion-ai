/**
 * Generates AI food images using Hugging Face via backend proxy
 * @param {string} description - The description of the dish to generate
 * @returns {Promise<string>} - Base64 data URL of the generated image
 */
export const generateDishImage = async (description) => {
    console.log('🖼️ Requesting AI-generated image from Hugging Face...');

    try {
        // Call our serverless function
        const response = await fetch(`/api/generate-image?description=${encodeURIComponent(description)}`);

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.image) {
            console.log('✅ AI image generated successfully via Hugging Face');
            return data.image;
        } else {
            throw new Error(data.error || 'Unknown error');
        }
    } catch (error) {
        console.error('❌ Failed to generate AI image:', error);
        // Return a fallback placeholder if AI generation fails
        const hash = description.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const seed = hash % 1000;
        return `https://picsum.photos/seed/${seed}/800/600`;
    }
};
