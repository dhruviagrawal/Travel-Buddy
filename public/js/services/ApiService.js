import { CONFIG } from '../config.js';

export class ApiService {
    static async fetchCityRecommendations(answers) {
        try {
            // Securely call our own backend instead of exposing the API key
            const response = await fetch('/api/recommend-cities', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers })
            });

            if (!response.ok) {
                throw new Error("Backend failed to fetch cities.");
            }

            return await response.json();
        } catch (error) {
            console.error("Fetch Error:", error);
            alert("Failed to connect to the backend. Ensure you have added the API keys and the server is running.");
            return [];
        }
    }

    static async fetchItinerary(answers, cityName) {
        try {
            const response = await fetch('/api/generate-itinerary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers, cityName })
            });

            if (!response.ok) {
                throw new Error("Backend failed to generate itinerary.");
            }

            return await response.json();
        } catch (error) {
            console.error("Fetch Error:", error);
            return null;
        }
    }

    static async fetchImage(keyword) {
        // Use Unsplash Source — free, no API key, returns relevant images by keyword
        const encodedKeyword = encodeURIComponent(keyword || 'travel');
        return `https://source.unsplash.com/featured/800x500/?${encodedKeyword}`;
    }
}
