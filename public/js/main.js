import { AppController } from './controllers/AppController.js';

document.addEventListener('DOMContentLoaded', () => {
    // Bootstrap the application using the Controller
    window.app = new AppController();
});
