/**
 * State Management System
 */

class StateManager {
    constructor() {
        this.state = {
            articles: [],
            categories: [],
            media: [],
            currentUser: null,
            theme: 'light',
            loading: false,
        };
        
        this.listeners = new Map();
    }
    
    // Get state value
    get(key) {
        return this.state[key];
    }
    
    // Set state value and notify listeners
    set(key, value) {
        const oldValue = this.state[key];
        this.state[key] = value;
        
        // Notify listeners
        if (this.listeners.has(key)) {
            this.listeners.get(key).forEach(callback => {
                callback(value, oldValue);
            });
        }
    }
    
    // Update state with multiple values
    update(updates) {
        Object.keys(updates).forEach(key => {
            this.set(key, updates[key]);
        });
    }
    
    // Subscribe to state changes
    subscribe(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, []);
        }
        
        this.listeners.get(key).push(callback);
        
        // Return unsubscribe function
        return () => {
            const callbacks = this.listeners.get(key);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        };
    }
    
    // Clear all state
    clear() {
        this.state = {
            articles: [],
            categories: [],
            media: [],
            currentUser: null,
            theme: 'light',
            loading: false,
        };
    }
    
    // Save state to localStorage
    save() {
        try {
            localStorage.setItem('newsAppState', JSON.stringify(this.state));
        } catch (error) {
            console.error('Failed to save state:', error);
        }
    }
    
    // Load state from localStorage
    load() {
        try {
            const saved = localStorage.getItem('newsAppState');
            if (saved) {
                const parsedState = JSON.parse(saved);
                this.state = { ...this.state, ...parsedState };
            }
        } catch (error) {
            console.error('Failed to load state:', error);
        }
    }
}

// Create singleton instance
const stateManager = new StateManager();