/**
 * AppState manages the global application data, including quiz answers,
 * recommended cities, and the final generated itinerary.
 */
export class AppState {
    constructor() {
        /** @type {Object} Stores user answers keyed by question ID */
        this.answers = {};
        /** @type {number} Current quiz question index */
        this.currentQuestionIndex = 0;
        /** @type {Array} List of cities recommended by AI */
        this.recommendedCities = [];
        /** @type {string|null} The city selected for the itinerary */
        this.selectedCity = null;
        /** @type {Object|null} The final generated 3-day itinerary */
        this.itinerary = null;
        
        // Static data
        this.questions = [
            {
                id: "group",
                text: "Who's going on this trip?",
                options: ["Solo", "Couple", "Family", "Friends Group"]
            },
            {
                id: "vibe",
                text: "What's the vibe you're looking for?",
                options: ["Beaches & Relaxation", "Mountains & Adventure", "Historical & Cultural", "City Lights & Nightlife", "Pilgrimage & Peace"]
            },
            {
                id: "budget",
                text: "What's your budget style?",
                options: ["Backpacker (Budget)", "Comfort (Moderate)", "Luxury"]
            },
            {
                id: "specialNeeds",
                text: "Any dietary or special needs?",
                options: ["None", "Vegetarian", "Vegan", "Halal", "Jain", "Gluten-Free", "Wheelchair Accessible"]
            }
        ];
    }

    setAnswer(questionId, answer) {
        this.answers[questionId] = answer;
    }

    incrementQuestion() {
        this.currentQuestionIndex++;
    }

    isQuizFinished() {
        return this.currentQuestionIndex >= this.questions.length;
    }

    getCurrentQuestion() {
        return this.questions[this.currentQuestionIndex];
    }

    reset() {
        this.answers = {};
        this.currentQuestionIndex = 0;
        this.recommendedCities = [];
        this.selectedCity = null;
        this.itinerary = null;
    }
}
