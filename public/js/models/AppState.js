export class AppState {
    constructor() {
        this.answers = {};
        this.currentQuestionIndex = 0;
        this.recommendedCities = [];
        this.selectedCity = null;
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
