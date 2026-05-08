import { AppState } from '../models/AppState.js';
import { ApiService } from '../services/ApiService.js';
import { UIManager } from '../views/UIManager.js';

/**
 * AppController acts as the orchestrator, connecting the Model (AppState),
 * View (UIManager), and Service (ApiService) layers.
 */
export class AppController {
    constructor() {
        /** @type {AppState} */
        this.state = new AppState();
        /** @type {UIManager} */
        this.ui = new UIManager();
        this.bindEvents();
    }

    /**
     * Attaches main UI events to the controller logic.
     */
    bindEvents() {
        document.getElementById('start-btn').addEventListener('click', () => this.startQuiz());
        document.getElementById('restart-btn').addEventListener('click', () => this.restartApp());
    }

    startQuiz() {
        this.ui.switchView('quiz');
        this.nextQuestion();
    }

    nextQuestion() {
        const percent = (this.state.currentQuestionIndex / this.state.questions.length) * 100;
        this.ui.updateProgressBar(percent);

        const question = this.state.getCurrentQuestion();
        this.ui.renderQuestion(question, (qId, answer) => this.handleAnswer(qId, answer));
    }

    handleAnswer(questionId, answer) {
        this.state.setAnswer(questionId, answer);
        this.state.incrementQuestion();
        
        if (this.state.isQuizFinished()) {
            this.ui.updateProgressBar(100);
            setTimeout(() => this.startCitySelectionPhase(), 300);
        } else {
            this.nextQuestion();
        }
    }

    async startCitySelectionPhase() {
        this.ui.showLoading("Scanning the globe for perfect destinations...");
        const cities = await ApiService.fetchCityRecommendations(this.state.answers);
        this.state.recommendedCities = cities;
        
        this.ui.renderMapAndCities(cities, (cityName) => this.startItineraryPhase(cityName));
    }

    async startItineraryPhase(cityName) {
        this.state.selectedCity = cityName;
        this.ui.showLoading(`Crafting the perfect 3-day itinerary for ${cityName}...`);
        
        const itinerary = await ApiService.fetchItinerary(this.state.answers, cityName);
        this.state.itinerary = itinerary;
        
        await this.ui.renderItinerary(itinerary, () => this.startItineraryPhase(cityName));
    }

    restartApp() {
        this.state.reset();
        this.ui.updateProgressBar(0);
        this.ui.switchView('landing');
    }
}
