
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
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
            You are a Restaurant Inventory AI.
            Analyze the provided menu image (or PDF) and extract two things:
            1. 'meals': A list of menu items (Meal Name, Price, Description, Ingredients).
               - Infer potential ingredients if not explicitly listed.
            2. 'pantry': A list of unique base ingredients found (e.g. Chicken, Tomato, Rice).
               - Estimate 'currentStock' as 'Medium' for all.
               - Estimate 'costPerUnit' reasonably.

            Return JSON ONLY. Format:
            {
              "meals": [{ "name": "Dish Name", "price": "£XX", "status": "Active", "ingredients": ["Ing1", "Ing2"] }],
              "pantry": [{ "item": "Ingredient Name", "category": "Produce/Protein/Pantry", "stock": "Medium", "status": "Active" }]
            }
        `;

        // Retry logic for 503 (Overloaded) or 429 (Quota) errors
        const generateWithRetry = async (attempts = 3, delay = 2000) => {
            for (let i = 0; i < attempts; i++) {
                try {
                    const result = await model.generateContent([prompt, { inlineData: { data: image, mimeType } }]);
                    return result;
                } catch (error) {
                    console.log(`Attempt ${i + 1} failed: ${error.message}`);
                    if (i === attempts - 1) throw error; // Throw on last attempt
                    // Wait before retrying (exponential backoff: 2s, 4s, 8s...)
                    await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
                }
            }
        };

        const result = await generateWithRetry();
        const response = await result.response;
        const text = response.text();

        // Robust JSON extraction: Find first '{' and last '}'
        const firstOpen = text.indexOf('{');
        const lastClose = text.lastIndexOf('}');

        if (firstOpen === -1 || lastClose === -1) {
            throw new Error("No JSON found in response.");
        }

        const jsonStr = text.substring(firstOpen, lastClose + 1);
        const data = JSON.parse(jsonStr);

        res.status(200).json(data);

    } catch (error) {
        console.error('Gemini API Error (Backtrace):');
        console.error(error);

        // Enhance error message for client
        let clientMessage = error.message;
        if (error.message.includes('503')) clientMessage += " (Server Busy - Auto-retired)";

        if (error.response) console.error(JSON.stringify(error.response, null, 2));
        res.status(500).json({ error: 'Failed to analyze menu', details: clientMessage, stack: error.stack });
    }
}
