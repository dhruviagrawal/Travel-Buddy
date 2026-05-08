import { ApiService } from '../services/ApiService.js';

export class UIManager {
    constructor() {
        this.views = {
            landing: document.getElementById('landing'),
            quiz: document.getElementById('quiz'),
            loading: document.getElementById('loading'),
            citySelection: document.getElementById('citySelection'),
            result: document.getElementById('result')
        };
        this.mapInstance = null;
        this.markers = [];
    }

    switchView(viewName) {
        Object.values(this.views).forEach(v => v.classList.remove('active'));
        if (this.views[viewName]) {
            this.views[viewName].classList.add('active');
        }
    }

    showLoading(text) {
        const loadingText = document.getElementById('loading-text');
        loadingText.textContent = text;
        // Accessibility: ensure screen readers announce this
        loadingText.setAttribute('aria-live', 'polite');
        this.switchView('loading');
    }

    updateProgressBar(percent) {
        document.getElementById('progress').style.width = `${percent}%`;
    }

    renderQuestion(question, onAnswer) {
        const questionText = document.getElementById('question-text');
        questionText.textContent = question.text;
        questionText.setAttribute('aria-label', question.text);

        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';
        
        question.options.forEach(opt => {
            const btn = document.createElement('button'); // Changed from div to button for accessibility
            btn.className = 'option-chip';
            btn.textContent = opt;
            btn.setAttribute('aria-label', opt);
            btn.addEventListener('click', () => onAnswer(question.id, opt));
            optionsContainer.appendChild(btn);
        });
    }

    renderMapAndCities(cities, onCitySelect) {
        this.switchView('citySelection');
        
        const cityList = document.getElementById('city-list');
        cityList.innerHTML = '';
        
        if (!this.mapInstance && typeof google !== 'undefined') {
            // Google Maps JS API initialization
            this.mapInstance = new google.maps.Map(document.getElementById('map'), {
                center: { lat: 20, lng: 0 },
                zoom: 2,
                styles: [
                    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                    {
                        featureType: "administrative.locality",
                        elementType: "labels.text.fill",
                        stylers: [{ color: "#d59563" }]
                    },
                    {
                        featureType: "water",
                        elementType: "geometry",
                        stylers: [{ color: "#17263c" }]
                    }
                ],
                disableDefaultUI: true // Clean UI
            });
        }

        // Clear existing markers
        this.markers.forEach(m => m.setMap(null));
        this.markers = [];

        const bounds = new google.maps.LatLngBounds();

        cities.forEach((city) => {
            const position = { lat: city.lat, lng: city.lng };
            bounds.extend(position);

            const marker = new google.maps.Marker({
                position: position,
                map: this.mapInstance,
                title: city.name,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    fillColor: '#00F0FF',
                    fillOpacity: 0.8,
                    strokeColor: '#FF007F',
                    strokeWeight: 2,
                    scale: 8
                }
            });

            const infoWindow = new google.maps.InfoWindow({
                content: `<b>${city.name}</b>`
            });

            this.markers.push(marker);

            const card = document.createElement('div');
            card.className = 'city-card';
            card.tabIndex = 0; // Keyboard accessibility
            card.setAttribute('aria-label', `Select ${city.name}`);
            let safetyHtml = '';
            if (city.safety) {
                let badgeClass = 'safety-green';
                let icon = '✅';
                if (city.safety.score < 50) { badgeClass = 'safety-red'; icon = '🔴'; }
                else if (city.safety.score < 75) { badgeClass = 'safety-yellow'; icon = '⚠️'; }
                
                safetyHtml = `
                    <div class="safety-panel ${badgeClass}">
                        <div class="safety-score">Safety: ${city.safety.score}/100</div>
                        <div class="safety-highlight">${icon} ${city.safety.highlight}</div>
                    </div>
                `;
            }

            card.innerHTML = `
                <h3 class="city-name">${city.name}</h3>
                ${safetyHtml}
                <p class="city-reason">${city.reason}</p>
                <button class="btn-select-city" aria-label="Plan Trip Here">Plan Trip Here</button>
            `;
            
            card.addEventListener('mouseenter', () => {
                this.mapInstance.panTo(position);
                this.mapInstance.setZoom(6);
                infoWindow.open(this.mapInstance, marker);
            });
            
            card.querySelector('.btn-select-city').addEventListener('click', () => {
                onCitySelect(city.name);
            });

            cityList.appendChild(card);
        });

        if (this.mapInstance) {
            setTimeout(() => {
                this.mapInstance.fitBounds(bounds);
            }, 400);
        }
    }

    async renderItinerary(data) {
        if (!data) {
            document.getElementById('itinerary-title').textContent = "Failed to generate itinerary. Please try again.";
            this.switchView('result');
            return;
        }

        document.getElementById('itinerary-title').textContent = data.title;
        const container = document.getElementById('itinerary-content');
        container.innerHTML = '';
        
        for (const day of data.days) {
            const imageUrl = await ApiService.fetchImage(day.image_keyword);

            const card = document.createElement('div');
            card.className = 'day-card';
            card.innerHTML = `
                <img src="${imageUrl}" alt="Image representing ${day.theme}" class="day-img">
                <div class="day-content">
                    <h3 class="day-title">Day ${day.day}: ${day.theme}</h3>
                    <p class="day-desc">${day.description}</p>
                    <ul class="activity-list">
                        ${day.activities.map(act => `<li>${act}</li>`).join('')}
                    </ul>
                </div>
            `;
            container.appendChild(card);
        }
        
        this.switchView('result');
    }
}
