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
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || "Backend failed to fetch cities.");
            }

            return await response.json();
        } catch (error) {
            console.error("Fetch Error:", error);
            alert(error.message || "Failed to connect to the backend. Ensure you have added the API keys and the server is running.");
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
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || "Backend failed to generate itinerary.");
            }

            return await response.json();
        } catch (error) {
            console.error("Fetch Error:", error);
            alert(error.message || "Failed to connect to the backend.");
            return null;
        }
    }

    static async fetchImage(keyword) {
        try {
            // Use Wikimedia Commons API for real, cloud-hosted photos based on the location/keyword
            const encodedKeyword = encodeURIComponent(keyword || 'travel');
            const url = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodedKeyword}&gsrlimit=1&prop=pageimages&piprop=original&format=json&origin=*`;
            
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                if (data.query && data.query.pages) {
                    const pages = Object.values(data.query.pages);
                    if (pages.length > 0 && pages[0].original && pages[0].original.source) {
                        return pages[0].original.source;
                    }
                }
            }
        } catch (error) {
            console.warn("Wikimedia image fetch failed:", error);
        }

        // Fallback if Wikipedia doesn't have a photo for that specific keyword
        const seed = encodeURIComponent((keyword || 'travel').toLowerCase().replace(/\s+/g, '-'));
        return `https://picsum.photos/seed/${seed}/800/500`;
    }
}
