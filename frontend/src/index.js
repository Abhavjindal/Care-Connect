import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'aos/dist/aos.css';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './css/main.css';

// JS Vendors
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import AOS from 'aos';
import GLightbox from 'glightbox';
import Swiper from 'swiper';

// Initialize AOS & GLightbox
AOS.init();
GLightbox({ selector: '.glightbox' });

// Example Swiper init (remove if already initialized inside Testimonials)
new Swiper('.swiper', {
  loop: true,
  pagination: { el: '.swiper-pagination', clickable: true },
  navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
