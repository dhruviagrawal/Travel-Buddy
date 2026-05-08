import test from 'node:test';
import assert from 'node:assert/strict';
import { AppState } from '../public/js/models/AppState.js';

// --- UNIT TESTS: AppState Model ---

test('AppState: initializes with correct default values', () => {
    const state = new AppState();
    assert.deepEqual(state.answers, {});
    assert.strictEqual(state.currentQuestionIndex, 0);
    assert.strictEqual(state.recommendedCities.length, 0);
    assert.strictEqual(state.selectedCity, null);
    assert.strictEqual(state.itinerary, null);
});

test('AppState: has 4 questions defined', () => {
    const state = new AppState();
    assert.strictEqual(state.questions.length, 4);
});

test('AppState: setAnswer stores the answer correctly', () => {
    const state = new AppState();
    state.setAnswer('group', 'Solo');
    assert.strictEqual(state.answers.group, 'Solo');
});

test('AppState: setAnswer overwrites a previous answer', () => {
    const state = new AppState();
    state.setAnswer('group', 'Solo');
    state.setAnswer('group', 'Couple');
    assert.strictEqual(state.answers.group, 'Couple');
});

test('AppState: incrementQuestion increases index by 1', () => {
    const state = new AppState();
    state.incrementQuestion();
    assert.strictEqual(state.currentQuestionIndex, 1);
});

test('AppState: isQuizFinished returns false mid-quiz', () => {
    const state = new AppState();
    state.incrementQuestion();
    assert.strictEqual(state.isQuizFinished(), false);
});

test('AppState: isQuizFinished returns true at end of quiz', () => {
    const state = new AppState();
    state.currentQuestionIndex = state.questions.length;
    assert.strictEqual(state.isQuizFinished(), true);
});

test('AppState: getCurrentQuestion returns correct question', () => {
    const state = new AppState();
    const q = state.getCurrentQuestion();
    assert.ok(q.id);
    assert.ok(q.text);
    assert.ok(Array.isArray(q.options));
});

test('AppState: reset clears all state back to defaults', () => {
    const state = new AppState();
    state.setAnswer('group', 'Solo');
    state.incrementQuestion();
    state.selectedCity = 'Tokyo';
    state.itinerary = { title: 'Test' };
    state.recommendedCities = [{ name: 'Tokyo' }];

    state.reset();

    assert.deepEqual(state.answers, {});
    assert.strictEqual(state.currentQuestionIndex, 0);
    assert.strictEqual(state.selectedCity, null);
    assert.strictEqual(state.itinerary, null);
    assert.strictEqual(state.recommendedCities.length, 0);
});
