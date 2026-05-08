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
    }

    switchView(viewName) {
        Object.values(this.views).forEach(v => v.classList.remove('active'));
        if (this.views[viewName]) {
            this.views[viewName].classList.add('active');
        }
    }

    showLoading(text) {
        document.getElementById('loading-text').textContent = text;
        this.switchView('loading');
    }

    updateProgressBar(percent) {
        document.getElementById('progress').style.width = `${percent}%`;
    }

    renderQuestion(question, onAnswer) {
        document.getElementById('question-text').textContent = question.text;
        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';
        
        question.options.forEach(opt => {
            const btn = document.createElement('div');
            btn.className = 'option-chip';
            btn.textContent = opt;
            btn.addEventListener('click', () => onAnswer(question.id, opt));
            optionsContainer.appendChild(btn);
        });
    }

    renderMapAndCities(cities, onCitySelect) {
        this.switchView('citySelection');
        
        const cityList = document.getElementById('city-list');
        cityList.innerHTML = '';
        
        if (!this.mapInstance) {
            this.mapInstance = L.map('map', { zoomControl: false }).setView([20, 0], 2); 
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; OpenStreetMap contributors',
                subdomains: 'abcd',
                maxZoom: 19
            }).addTo(this.mapInstance);
        }
        
        setTimeout(() => this.mapInstance.invalidateSize(), 100);

        this.mapInstance.eachLayer((layer) => {
            if (layer instanceof L.CircleMarker) layer.remove();
        });

        const bounds = L.latLngBounds();

        cities.forEach((city) => {
            const marker = L.circleMarker([city.lat, city.lng], {
                color: '#FF007F',
                fillColor: '#00F0FF',
                fillOpacity: 0.8,
                radius: 8,
                weight: 2
            }).addTo(this.mapInstance);
            
            marker.bindPopup(`<b>${city.name}</b>`);
            bounds.extend([city.lat, city.lng]);

            const card = document.createElement('div');
            card.className = 'city-card';
            card.innerHTML = `
                <h3 class="city-name">${city.name}</h3>
                <p class="city-reason">${city.reason}</p>
                <button class="btn-select-city">Plan Trip Here</button>
            `;
            
            card.addEventListener('mouseenter', () => {
                this.mapInstance.flyTo([city.lat, city.lng], 6, { duration: 1 });
                marker.openPopup();
            });
            
            card.querySelector('.btn-select-city').addEventListener('click', () => {
                onCitySelect(city.name);
            });

            cityList.appendChild(card);
        });

        setTimeout(() => {
            this.mapInstance.flyToBounds(bounds, { padding: [50, 50], duration: 1.5 });
        }, 400);
    }

    async renderItinerary(data) {
        document.getElementById('itinerary-title').textContent = data.title;
        const container = document.getElementById('itinerary-content');
        container.innerHTML = '';
        
        for (const day of data.days) {
            const imageUrl = await ApiService.fetchImage(day.image_keyword);

            const card = document.createElement('div');
            card.className = 'day-card';
            card.innerHTML = `
                <img src="${imageUrl}" alt="${day.theme}" class="day-img">
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
