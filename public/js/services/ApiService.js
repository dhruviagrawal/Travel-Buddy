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
