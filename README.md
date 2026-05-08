# Travel Buddy 🌍✈️

**Travel Buddy** is a full-stack, AI-powered travel planner that dynamically generates personalized 3-day itineraries based on your group type, vibe, and budget preferences.

It utilizes the **Gemini 2.5 Flash** model to recommend real-world destinations and crafts city-specific, day-by-day plans on demand. It also seamlessly integrates with the **Google Maps JavaScript API** to visualize the destinations and the **Wikimedia Commons API** to dynamically fetch real, cloud-hosted images of the recommended locations.

---

## 🚀 Features

- **AI Destination Recommendations**: Uses Gemini AI to analyze your travel preferences (Group, Vibe, Budget, Dietary Needs) and recommends 3 tailored cities.
- **Safety Mode for Solo/Marginalized Travelers**: Each recommended city is evaluated by Gemini for safety, generating a custom safety score (0-100) and an actionable safety highlight displayed as a glowing badge.
- **Medical & Dietary Travel Guard**: Every itinerary dynamically adapts to strict dietary (Vegan, Halal, Jain) and medical (Wheelchair Accessible) requirements. Every generated restaurant and activity will respect these constraints.
- **Dynamic Itineraries**: Generates a custom 3-day itinerary for any of the recommended cities, complete with daily themes, descriptions, and activities.
- **Interactive Map Integration**: Automatically places markers for the recommended cities using the official Google Maps JS API.
- **Real Destination Photos**: Uses the Wikimedia Commons API to fetch actual, real-world photos of the locations in the itinerary—no static placeholders!
- **Accessibility (a11y) First**: Built with semantic HTML, ARIA attributes (`aria-live`, `aria-label`), and keyboard navigable elements.
- **Responsive & Modern UI**: A sleek, dark-mode inspired glassmorphism design that looks incredible on both mobile and desktop.

---

## 🏗️ Architecture & Code Quality

Travel Buddy is built with a strict **SOLID MVC (Model-View-Controller)** architecture using modern ES6 modules.

- **Frontend**: Vanilla JS (ES6+), HTML5, CSS3.
  - **Model (`AppState.js`)**: Manages the single source of truth for the user's quiz state and data.
  - **View (`UIManager.js`)**: Orchestrates DOM manipulations, accessibility updates, and Google Maps rendering.
  - **Controller (`AppController.js`)**: Connects the Model and View.
  - **Service (`ApiService.js`)**: Securely proxies all API requests to the backend.
- **Backend**: Node.js, Express.js.
  - **Security**: The Gemini API key and Maps API key are securely stored in the backend `.env` file. The frontend fetches the Maps key dynamically at runtime via a secure `/api/config` endpoint.
  - **Efficiency**: Implements `compression` (gzip), `Cache-Control` headers, and `express-rate-limit` to prevent abuse.
- **Testing**: Includes a comprehensive test suite (14 passing tests) using `node:test` and `supertest` for both unit tests and API integration tests. Automatically run via GitHub Actions.

---

## 🛠️ Getting Started (Local Development)

### Prerequisites
- Node.js (v20+)
- A Gemini API Key
- A Google Maps JS API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/dhruviagrawal/Travel-Buddy.git
   cd Travel-Buddy
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy the example environment file and add your actual API keys:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and fill in your `GEMINI_API_KEY` and `MAPS_API_KEY`.

4. **Run the Application:**
   ```bash
   npm start
   ```
   The app will be available at `http://localhost:3000`.

---

## 🧪 Testing

To run the test suite (unit and integration tests) and view the coverage report:

```bash
npm run test:coverage
```

---

## ☁️ Deployment

This project is Dockerized and configured for seamless deployment to **Google Cloud Run**.

```bash
gcloud run deploy travel-buddy \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=your_key,MAPS_API_KEY=your_maps_key
```