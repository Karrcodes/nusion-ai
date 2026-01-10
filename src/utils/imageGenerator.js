/**
 * Generates an AI food image using Pollinations.ai via proxy/fetch
 * Converts to base64 to bypass CORS restrictions
 * @param {string} description - The description of the dish to generate
 * @returns {Promise<string>} - Base64 data URL of the generated image
 */
export const generateDishImage = async (description) => {
    const seed = Math.floor(Math.random() * 1000000);
    // Enhanced prompt for luxury food photography
    const enhancedPrompt = `Michelin star fine dining dish, ${description}, professional food photography, studio lighting, hyper-realistic, 8k resolution, elegant plating, cinematic lighting, shallow depth of field, sharp focus, magazine quality`;

    const encodedPrompt = encodeURIComponent(enhancedPrompt);
    const pollinationsUrl = `https://pollinations.ai/p/${encodedPrompt}?width=1024&height=1024&seed=${seed}&nologo=true&model=flux`;

    console.log('🖼️ Fetching AI-generated image from Pollinations...');

    try {
        // Fetch the image as a blob, then convert to base64
        // This bypasses CORS restrictions by processing it through JavaScript
        const response = await fetch(pollinationsUrl, {
            mode: 'cors',
            credentials: 'omit'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();

        // Convert blob to base64 data URL
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === 'string' && reader.result.startsWith('data:image')) {
                    console.log('✅ AI image converted to base64 successfully');
                    resolve(reader.result);
                } else {
                    reject(new Error('Failed to convert image to base64'));
                }
            };
            reader.onerror = () => reject(new Error('FileReader error'));
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('❌ Failed to generate AI image:', error);
        // Return a fallback placeholder if AI generation fails
        const fallbackSeed = Math.floor(Math.random() * 1000);
        return `https://picsum.photos/seed/${fallbackSeed}/800/600`;
    }
};
