import '../public/favicon.ico'; // Ensure favicon is copied
import './style.scss'; // Import main styles
import gsap from 'gsap'; // Import GSAP
import { generateHomePage } from './modules/homepage.js'; // Will create this module
import { setupNavigation } from './modules/navigation.js'; // Will create this module

// --- Global Setup ---
document.addEventListener('DOMContentLoaded', () => {
    const appContainer = document.getElementById('app-container');

    // Initial page load
    generateHomePage(appContainer);

    // Setup navigation for mobile responsiveness
    setupNavigation();

    // Basic animation on page load for the header
    gsap.from(".main-header", { y: -100, opacity: 0, duration: 0.8, ease: "power3.out" });
    gsap.from(".blog-logo, .main-nav li", { opacity: 0, y: 20, stagger: 0.1, duration: 0.6, delay: 0.5 });


    console.log('Fancy Blog loaded successfully!');
});
