
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { image, mimeType } = req.body;

        // Use environment variable for security (prevents leaked key errors)
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is not set in server environment.");
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `
            You are a Restaurant Inventory AI. 
            Analyze this menu image. 
            1. Extract every distinct MEAL/DISH name and price.
            2. Infer the core basic ingredients needed for each dish.
            3. List any other distinct ingredients or pantry items found.
            
            Return ONLY raw JSON (no markdown formatting) with this structure:
            {
                "meals": [
                    { "name": "Dish Name", "price": "£XX", "status": "Active", "ingredients": ["Ing1", "Ing2"] }
                ],
                "pantry": [
                    { "item": "Ingredient Name", "category": "Produce/Protein/Pantry", "stock": "High", "status": "Active" }
                ]
            }
        `;

        const imagePart = {
            inlineData: {
                data: image,
                mimeType: mimeType
            }
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(cleanedText);

        res.status(200).json(data);

    } catch (error) {
        console.error('Gemini API Error (Backtrace):');
        console.error(error);
        if (error.response) console.error(JSON.stringify(error.response, null, 2));
        res.status(500).json({ error: 'Failed to analyze menu', details: error.message, stack: error.stack });
    }
}
