import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize Gemini — key is read after dotenv/config has loaded
const getGenAI = () => new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/recommend-cities', async (req, res) => {
    try {
        const { answers } = req.body;
        const model = getGenAI().getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `Act as an expert travel planner. Based on a ${answers.group} trip focusing on ${answers.vibe} with a ${answers.budget} budget, recommend 3 amazing cities or regions in the world.
Return ONLY a valid JSON object in this exact structure, no markdown:
{
  "cities": [
    {
      "name": "City Name, Country",
      "lat": 0.0000,
      "lng": 0.0000,
      "reason": "A 1-sentence catchy reason why this fits their vibe perfectly."
    }
  ]
}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const textResponse = response.text();
        const jsonString = textResponse.replace(/```json\n?|\n?```/g, '');
        const cityData = JSON.parse(jsonString);

        res.json(cityData.cities);
    } catch (error) {
        console.error("Gemini /recommend-cities Error:", error.message || error);
        res.status(500).json({ error: error.message || "Failed to generate cities." });
    }
});

app.post('/api/generate-itinerary', async (req, res) => {
    try {
        const { answers, cityName } = req.body;
        const model = getGenAI().getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `Act as an expert travel planner. Create a 3-day itinerary for a ${answers.group} trip to ${cityName} focusing on ${answers.vibe} with a ${answers.budget} budget. Return ONLY a valid JSON object in this exact structure, no markdown:
{
  "title": "A catchy trip title",
  "days": [
    {
      "day": 1,
      "theme": "Day 1 Theme",
      "description": "A short summary of what the day entails.",
      "image_keyword": "A single word or short phrase for searching an image of this day's location in ${cityName}",
      "activities": ["Activity 1", "Activity 2", "Activity 3"]
    },
    {
      "day": 2,
      "theme": "Day 2 Theme",
      "description": "A short summary of what the day entails.",
      "image_keyword": "A single word or short phrase for searching an image of this day's location in ${cityName}",
      "activities": ["Activity 1", "Activity 2", "Activity 3"]
    },
    {
      "day": 3,
      "theme": "Day 3 Theme",
      "description": "A short summary of what the day entails.",
      "image_keyword": "A single word or short phrase for searching an image of this day's location in ${cityName}",
      "activities": ["Activity 1", "Activity 2", "Activity 3"]
    }
  ]
}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const textResponse = response.text();
        const jsonString = textResponse.replace(/```json\n?|\n?```/g, '');
        
        res.json(JSON.parse(jsonString));
    } catch (error) {
        console.error("Gemini /generate-itinerary Error:", error.message || error);
        res.status(500).json({ error: error.message || "Failed to generate itinerary." });
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
