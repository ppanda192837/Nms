/**
 * Environment Configuration
 */

window.ENV = {
    // API Configuration
    API_BASE_URL: '', // Empty string means same origin
    
    // App Configuration
    APP_NAME: 'News Management System',
    APP_VERSION: '1.0.0',
    
    // Feature Flags
    FEATURES: {
        DARK_MODE: true,
        MEDIA_UPLOAD: true,
        EXPORT_DATA: true,
        SEARCH: true,
        PAGINATION: true
    },
    
    // UI Configuration
    UI: {
        ITEMS_PER_PAGE: 12,
        SEARCH_DEBOUNCE: 500,
        TOAST_DURATION: 5000,
        ANIMATION_DURATION: 300
    },
    
    // Development Configuration
    DEBUG: false,
    LOG_LEVEL: 'info' // 'debug', 'info', 'warn', 'error'
};