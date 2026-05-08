import test from 'node:test';
import assert from 'node:assert/strict';
import { AppState } from '../public/js/models/AppState.js';

test('AppState initialized correctly', (t) => {
    const state = new AppState();
    assert.deepEqual(state.answers, {});
    assert.strictEqual(state.currentQuestionIndex, 0);
    assert.strictEqual(state.recommendedCities.length, 0);
    assert.strictEqual(state.selectedCity, null);
    assert.strictEqual(state.itinerary, null);
});

test('AppState sets answer correctly', (t) => {
    const state = new AppState();
    state.setAnswer('group', 'Solo');
    assert.strictEqual(state.answers.group, 'Solo');
});

test('AppState increments question correctly', (t) => {
    const state = new AppState();
    state.incrementQuestion();
    assert.strictEqual(state.currentQuestionIndex, 1);
});

test('AppState identifies when quiz is finished', (t) => {
    const state = new AppState();
    state.currentQuestionIndex = state.questions.length;
    assert.strictEqual(state.isQuizFinished(), true);
});

test('AppState resets correctly', (t) => {
    const state = new AppState();
    state.setAnswer('group', 'Solo');
    state.incrementQuestion();
    state.selectedCity = 'Tokyo';
    state.itinerary = {};
    
    state.reset();
    
    assert.deepEqual(state.answers, {});
    assert.strictEqual(state.currentQuestionIndex, 0);
    assert.strictEqual(state.selectedCity, null);
    assert.strictEqual(state.itinerary, null);
});
