import { CONFIG } from '../config.js';
import { MockDataService } from './MockDataService.js';

export class ApiService {
    static async fetchCityRecommendations(answers) {
        if (CONFIG.GEMINI_API_KEY === "YOUR_GEMINI_API_KEY") {
            await MockDataService.simulateDelay();
            return MockDataService.getCities();
        }

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
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${CONFIG.GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error.message);

            const textResponse = data.candidates[0].content.parts[0].text;
            const jsonString = textResponse.replace(/```json\n?|\n?```/g, '');
            const cityData = JSON.parse(jsonString);
            return cityData.cities;
        } catch (error) {
            console.error("Gemini Error:", error);
            return MockDataService.getCities(); // Fallback
        }
    }

    static async fetchItinerary(answers, cityName) {
        if (CONFIG.GEMINI_API_KEY === "YOUR_GEMINI_API_KEY") {
            await MockDataService.simulateDelay();
            return MockDataService.getItinerary(cityName);
        }

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
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${CONFIG.GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error.message);

            const textResponse = data.candidates[0].content.parts[0].text;
            const jsonString = textResponse.replace(/```json\n?|\n?```/g, '');
            return JSON.parse(jsonString);
        } catch (error) {
            console.error("Gemini Error:", error);
            return MockDataService.getItinerary(cityName); // Fallback
        }
    }

    static async fetchImage(keyword) {
        if (CONFIG.UNSPLASH_ACCESS_KEY === "YOUR_UNSPLASH_ACCESS_KEY") {
            return `https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`;
        }

        try {
            const imgRes = await fetch(`https://api.unsplash.com/photos/random?query=${encodeURIComponent(keyword)}&orientation=landscape&client_id=${CONFIG.UNSPLASH_ACCESS_KEY}`);
            if (imgRes.ok) {
                const imgData = await imgRes.json();
                return imgData.urls.regular;
            }
        } catch (error) {
            console.error("Unsplash Error:", error);
        }
        return `https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`;
    }
}
