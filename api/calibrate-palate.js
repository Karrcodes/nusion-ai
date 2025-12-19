
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { favorites } = req.body; // Expecting string or array of strings e.g. "Truffle Pasta, Miso Soup"

        if (!favorites) {
            return res.status(400).json({ error: 'Favorites input is required' });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is not set in server environment.");
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
            You are a Gastronomic Calibration AI.
            The user has provided their favorite dishes: "${favorites}".

            Your task is to:
            1. Analyze the 'Semantic Flavor Essence' of these dishes (e.g., are they Umami-heavy? Creamy? Acidic? Spicy?).
            2. Suggest a 'West African Flavor Bridge' - a specific ingredient or dish from West African cuisine that shares this essence.
            3. Write a 1-sentence 'Narrative Bridge' explaining the connection to the user.

            Return JSON ONLY. Format:
            {
              "semantic_profile": {
                "primary": "Flavor (e.g. Umami, Earthy, Bright)",
                "secondary": "Flavor (e.g. Rich, Herbal, Spicy)",
                "texture": "Texture (e.g. Creamy, Crunchy, Brothy)"
              },
              "bridge_ingredient": "Name (e.g. Iru, Egusi, Scotch Bonnet)",
              "narrative": "Because you enjoy [User Flavor], you will appreciate the [Bridge Ingredient]..."
            }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Robust JSON extractions
        const firstOpen = text.indexOf('{');
        const lastClose = text.lastIndexOf('}');

        if (firstOpen === -1 || lastClose === -1) {
            throw new Error("Invalid AI response");
        }

        const jsonStr = text.substring(firstOpen, lastClose + 1);
        const data = JSON.parse(jsonStr);

        res.status(200).json(data);

    } catch (error) {
        console.error('Calibration API Error:', error);
        res.status(500).json({ error: 'Calibration failed', details: error.message });
    }
}
