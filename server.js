import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { GoogleGenerativeAI } from '@google/generative-ai';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
export { app }; // Export for testing

const port = process.env.PORT || 8000;

// --- MIDDLEWARE ---
app.use(compression()); // Gzip all responses for efficiency
app.use(cors());
app.use(express.json());

// Cache-Control headers for static assets (efficiency boost)
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: '1h',
    etag: true,
    lastModified: true
}));

// Rate limiting — prevent API abuse (security boost)
app.set('trust proxy', 1); // Cloud Run acts as a reverse proxy
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // max 30 requests per window per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests. Please try again later.' }
});
app.use('/api/', apiLimiter);

// --- GEMINI INIT ---
const getGenAI = () => new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- FIX 1: SERVE MAPS API KEY SECURELY FROM BACKEND ---
app.get('/api/config', (req, res) => {
    res.json({ mapsApiKey: process.env.MAPS_API_KEY || '' });
});

// --- API ROUTES ---
app.post('/api/recommend-cities', async (req, res) => {
    try {
        const { answers } = req.body;
        if (!answers || !answers.group || !answers.vibe || !answers.budget) {
            return res.status(400).json({ error: 'Missing required fields: group, vibe, budget.' });
        }
        
        // Backward compatibility for cached frontend clients
        answers.specialNeeds = answers.specialNeeds || 'None';

        const model = getGenAI().getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `Act as an expert travel planner. Based on a ${answers.group} trip focusing on ${answers.vibe} with a ${answers.budget} budget and ${answers.specialNeeds === 'None' ? 'no special dietary/medical needs' : 'STRICT ' + answers.specialNeeds + ' requirements'}, recommend 3 amazing cities or regions in the world.
Return ONLY a valid JSON object in this exact structure, no markdown:
{
  "cities": [
    {
      "name": "City Name, Country",
      "lat": 0.0000,
      "lng": 0.0000,
      "reason": "A 1-sentence catchy reason why this fits their vibe and constraints perfectly.",
      "safety": {
        "score": 85,
        "solo_friendly": true,
        "highlight": "A short note on safety, especially for solo or marginalized groups."
      }
    }
  ]
}`;

        const result = await model.generateContent(prompt);
        const textResponse = result.response.text();
        const jsonString = textResponse.replace(/```json\n?|\n?```/g, '');
        const cityData = JSON.parse(jsonString);

        res.json(cityData.cities);
    } catch (error) {
        console.error('Gemini /recommend-cities Error:', error.message || error);
        if (error.status === 429 || (error.message && error.message.includes('429'))) {
            return res.status(429).json({ error: 'Gemini API Rate Limit Exceeded. Please wait a moment and try again.' });
        }
        res.status(500).json({ error: error.message || 'Failed to generate cities.' });
    }
});

app.post('/api/generate-itinerary', async (req, res) => {
    try {
        const { answers, cityName } = req.body;
        if (!answers || !answers.group || !answers.vibe || !answers.budget || !cityName) {
            return res.status(400).json({ error: 'Missing required fields: answers (group, vibe, budget), cityName.' });
        }
        
        // Backward compatibility for cached frontend clients
        answers.specialNeeds = answers.specialNeeds || 'None';

        const model = getGenAI().getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `Act as an expert travel planner. Create a 3-day itinerary for a ${answers.group} trip to ${cityName} focusing on ${answers.vibe} with a ${answers.budget} budget.
IMPORTANT CONSTRAINT: The user has ${answers.specialNeeds === 'None' ? 'no special dietary/medical needs' : 'STRICT ' + answers.specialNeeds + ' requirements'}. Every single restaurant and activity MUST accommodate this.
Return ONLY a valid JSON object in this exact structure, no markdown:
{
  "title": "A catchy trip title",
  "days": [
    {
      "day": 1,
      "theme": "Day 1 Theme",
      "description": "A short summary of what the day entails.",
      "image_keyword": "A single keyword for searching an image of this day location in ${cityName}",
      "activities": ["Activity 1", "Activity 2", "Activity 3"]
    },
    {
      "day": 2,
      "theme": "Day 2 Theme",
      "description": "A short summary of what the day entails.",
      "image_keyword": "A single keyword for searching an image of this day location in ${cityName}",
      "activities": ["Activity 1", "Activity 2", "Activity 3"]
    },
    {
      "day": 3,
      "theme": "Day 3 Theme",
      "description": "A short summary of what the day entails.",
      "image_keyword": "A single keyword for searching an image of this day location in ${cityName}",
      "activities": ["Activity 1", "Activity 2", "Activity 3"]
    }
  ]
}`;

        const result = await model.generateContent(prompt);
        const textResponse = result.response.text();
        const jsonString = textResponse.replace(/```json\n?|\n?```/g, '');

        res.json(JSON.parse(jsonString));
    } catch (error) {
        console.error('Gemini /generate-itinerary Error:', error.message || error);
        if (error.status === 429 || (error.message && error.message.includes('429'))) {
            return res.status(429).json({ error: 'Gemini API Rate Limit Exceeded. Please wait a moment and try again.' });
        }
        res.status(500).json({ error: error.message || 'Failed to generate itinerary.' });
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
