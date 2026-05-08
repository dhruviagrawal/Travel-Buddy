import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app } from '../server.js';

// --- INTEGRATION TESTS: API Routes ---

test('GET /api/config: returns mapsApiKey field', async () => {
    const res = await request(app).get('/api/config');
    assert.strictEqual(res.status, 200);
    assert.ok(Object.hasOwn(res.body, 'mapsApiKey'));
});

test('POST /api/recommend-cities: returns 400 if answers are missing', async () => {
    const res = await request(app)
        .post('/api/recommend-cities')
        .send({});
    assert.strictEqual(res.status, 400);
    assert.ok(res.body.error);
});

test('POST /api/recommend-cities: returns 400 if answers fields are incomplete', async () => {
    const res = await request(app)
        .post('/api/recommend-cities')
        .send({ answers: { group: 'Solo', vibe: 'Beaches', budget: 'Comfort' } }); // missing specialNeeds
    assert.strictEqual(res.status, 400);
    assert.ok(res.body.error);
});

test('POST /api/generate-itinerary: returns 400 if cityName is missing', async () => {
    const res = await request(app)
        .post('/api/generate-itinerary')
        .send({ answers: { group: 'Solo', vibe: 'Beaches', budget: 'Comfort', specialNeeds: 'Vegan' } });
    assert.strictEqual(res.status, 400);
    assert.ok(res.body.error);
});

test('POST /api/generate-itinerary: returns 400 if answers fields are incomplete', async () => {
    const res = await request(app)
        .post('/api/generate-itinerary')
        .send({ cityName: 'Tokyo', answers: { group: 'Solo' } });
    assert.strictEqual(res.status, 400);
    assert.ok(res.body.error);
});
