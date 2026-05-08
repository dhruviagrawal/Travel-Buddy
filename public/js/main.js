import { AppController } from './controllers/AppController.js';

async function loadGoogleMaps(apiKey) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
        script.async = true;
        script.defer = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Securely fetch Maps API key from backend — never hardcoded in HTML
        const res = await fetch('/api/config');
        const { mapsApiKey } = await res.json();

        if (mapsApiKey) {
            await loadGoogleMaps(mapsApiKey);
        }
    } catch (err) {
        console.warn('Google Maps could not be loaded:', err);
    }

    // Bootstrap the application using the Controller
    window.app = new AppController();
});
