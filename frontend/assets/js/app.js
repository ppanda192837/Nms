/**
 * Main Application Entry Point
 */

class App {
    constructor() {
        this.router = new Router();
        this.state = stateManager;
        this.toast = new ToastManager();
        
        this.init();
    }
    
    init() {
        // Initialize router
        this.router.init();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load initial page
        this.router.navigate('home');
        
        console.log('News Management App initialized');
    }
    
    setupEventListeners() {
        // Navigation links
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-page]')) {
                e.preventDefault();
                const page = e.target.getAttribute('data-page');
                this.router.navigate(page);
            }
        });
        
        // Global error handling
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
            this.toast.show('An unexpected error occurred', 'error');
        });
        
        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
            this.toast.show('An unexpected error occurred', 'error');
        });
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});