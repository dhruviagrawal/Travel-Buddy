import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { GoogleGenerativeAI } from '@google/generative-ai';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
/**
 * Travel Buddy Backend Server
 * 
 * This server provides AI-powered destination recommendations and itinerary generation
 * using Google's Gemini AI and integrates securely with the Google Maps JS API.
 * 
 * @module server
 */

const port = process.env.PORT || 8000;

const app = express();

/**
 * Express application instance.
 * Exported for integration and unit testing.
 * @type {import('express').Express}
 */
export { app };

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
/**
 * Advanced Gemini SDK Configuration
 * Uses System Instructions and Safety Settings to maximize AI quality and safety.
 */
const getGenAI = () => new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_INSTRUCTION = "You are a professional, world-class travel agent for 'Travel Buddy'. Your goal is to provide safe, exciting, and highly personalized itineraries that respect all dietary and accessibility constraints.";

const SAFETY_SETTINGS = [
    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
];

/**
 * Advanced Multi-Model Fallback & Retry System
 * First tries high-limit models, then fallbacks to stable models.
 * Automatically handles 429 (Rate Limit) with exponential backoff.
 */
async function generateWithRetry(genAI, prompt, retries = 3) {
    const models = ['gemini-1.5-flash', 'gemini-2.5-flash'];
    
    for (const modelName of models) {
        const model = genAI.getGenerativeModel({ 
            model: modelName,
            systemInstruction: SYSTEM_INSTRUCTION,
            safetySettings: SAFETY_SETTINGS
        });

        for (let i = 0; i < retries; i++) {
            try {
                return await model.generateContent(prompt);
            } catch (error) {
                const isRateLimit = error.status === 429 || (error.message && error.message.includes('429'));
                const isNotFound = error.status === 404 || (error.message && error.message.includes('404'));
                
                if (isNotFound) {
                    console.warn(`Model ${modelName} not found or unauthorized (404), trying next model...`);
                    break; // Try the next model in the list
                }
                
                if (isRateLimit && i < retries - 1) {
                    const waitTime = 2000 * (i + 1);
                    console.log(`Rate limit hit on ${modelName}, retrying in ${waitTime}ms... (Attempt ${i + 1}/${retries})`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                    continue;
                }
                
                // If it's the last model and we've exhausted retries, or it's a different error
                if (modelName === models[models.length - 1]) throw error;
                else {
                    console.warn(`Model ${modelName} failed with ${error.status || 'error'}, falling back to next model.`);
                    break; 
                }
            }
        }
    }
}

// --- FIX 1: SERVE MAPS API KEY SECURELY FROM BACKEND ---
app.get('/api/config', (req, res) => {
    res.json({ mapsApiKey: process.env.MAPS_API_KEY || '' });
});

// --- API ROUTES ---

/**
 * POST /api/recommend-cities
 * Recommends 3 cities based on user preferences and safety criteria.
 * @name recommend-cities
 * @function
 * @inner
 */
app.post('/api/recommend-cities', async (req, res) => {
    try {
        const { answers } = req.body;
        if (!answers || !answers.group || !answers.vibe || !answers.budget) {
            return res.status(400).json({ error: 'Missing required fields: group, vibe, budget.' });
        }
        
        // Backward compatibility for cached frontend clients
        answers.specialNeeds = answers.specialNeeds || 'None';

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

        const result = await generateWithRetry(getGenAI(), prompt);
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

/**
 * POST /api/generate-itinerary
 * Generates a detailed 3-day itinerary for a specific city.
 * @name generate-itinerary
 * @function
 * @inner
 */
app.post('/api/generate-itinerary', async (req, res) => {
    try {
        const { answers, cityName } = req.body;
        if (!answers || !answers.group || !answers.vibe || !answers.budget || !cityName) {
            return res.status(400).json({ error: 'Missing required fields: answers (group, vibe, budget), cityName.' });
        }
        
        // Backward compatibility for cached frontend clients
        answers.specialNeeds = answers.specialNeeds || 'None';

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

        const result = await generateWithRetry(getGenAI(), prompt);
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
