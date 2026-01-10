/**
 * Generates a placeholder for dish images
 * Using picsum.photos which is the most reliable placeholder service
 * @param {string} description - The description of the dish to generate
 * @returns {Promise<string>} - The URL of the image
 */
export const generateDishImage = async (description) => {
    // Use Lorem Picsum - most reliable placeholder service with guaranteed CORS support
    const seed = Math.floor(Math.random() * 1000);
    const url = `https://picsum.photos/seed/${seed}/800/600`;

    console.log('🖼️ Generated image URL:', url);

    // Small delay to stagger requests
    await new Promise(r => setTimeout(r, 300));

    return url;
};
