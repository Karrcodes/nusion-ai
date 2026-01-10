/**
 * Generates placeholder images for dishes
 * AI generation via Pollinations has persistent CORS and redirect issues
 * Using elegant placeholders until a reliable AI service is found
 * @param {string} description - The description of the dish
 * @returns {Promise<string>} - The URL of the placeholder image
 */
export const generateDishImage = async (description) => {
    console.log('🖼️ Using placeholder image (AI generation temporarily disabled due to CORS)');

    // Use Lorem Picsum with consistent seeds based on description hash
    const hash = description.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const seed = hash % 1000;

    // Return a beautiful, consistent placeholder
    const url = `https://picsum.photos/seed/${seed}/800/600`;

    await new Promise(r => setTimeout(r, 300));

    return url;
};
