/**
 * Generates an image URL using a food-specific placeholder service
 * Since Pollinations.ai has CORS issues, we'll use Unsplash Source for food images
 * @param {string} description - The description of the dish to generate
 * @returns {Promise<string>} - The URL of the image
 */
export const generateDishImage = async (description) => {
    // Extract key food terms from description for better image matching
    const foodKeywords = description.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(' ')
        .filter(word => word.length > 3)
        .slice(0, 3)
        .join(',');

    // Use Unsplash Source API for reliable, CORS-friendly food images
    // This service is specifically designed for embedding and has no CORS restrictions
    const seed = Math.floor(Math.random() * 1000000);
    const url = `https://source.unsplash.com/800x600/?food,${foodKeywords}&sig=${seed}`;

    console.log('🖼️ Generated image URL:', url);

    // Small delay to stagger requests
    await new Promise(r => setTimeout(r, 300));

    return url;
};
