/**
 * Generates an image URL using Pollinations.ai with Retry Logic
 * @param {string} description - The description of the dish to generate
 * @param {number} retries - Number of retries remaining (default 1)
 * @returns {Promise<string>} - The URL of the generated image
 */
export const generateDishImage = async (description, retries = 1) => {
    const seed = Math.floor(Math.random() * 1000000);
    // Enhanced prompt for luxury food photography
    const enhancedPrompt = `Michelin star fine dining dish, ${description}, professional food photography, studio lighting, hyper-realistic, 8k resolution, elegant plating, cinematic lighting, shallow depth of field, sharp focus, magazine quality`;

    const encodedPrompt = encodeURIComponent(enhancedPrompt);
    // Construct URL directly (Pollinations returns image directly, not JSON)
    const url = `https://pollinations.ai/p/${encodedPrompt}?width=1024&height=1024&seed=${seed}&nologo=true&model=flux`;

    try {
        // Pre-load the image to ensure it's ready before resolving
        return await new Promise((resolve, reject) => {
            const img = new Image();
            img.src = url;
            img.onload = () => resolve(url);
            img.onerror = () => reject(new Error('Failed to load image'));
        });
    } catch (error) {
        if (retries > 0) {
            console.warn(`Image generation failed, retrying... (${retries} left)`);
            return generateDishImage(description, retries - 1);
        }
        throw error;
    }
};
