/**
 * API Service for backend communication
 */

class ApiService {
    constructor() {
        this.baseUrl = window.ENV?.API_BASE_URL || '';
    }
    
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };
        
        const config = { ...defaultOptions, ...options };
        
        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }
            
            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }
    
    // Article endpoints
    async getArticles(page = 1, limit = 10) {
        return this.request(`/api/articles?page=${page}&limit=${limit}`);
    }
    
    async getArticle(id) {
        return this.request(`/api/articles/${id}`);
    }
    
    async createArticle(articleData) {
        return this.request('/api/articles', {
            method: 'POST',
            body: JSON.stringify(articleData),
        });
    }
    
    async updateArticle(id, articleData) {
        return this.request(`/api/articles/${id}`, {
            method: 'PUT',
            body: JSON.stringify(articleData),
        });
    }
    
    async deleteArticle(id) {
        return this.request(`/api/articles/${id}`, {
            method: 'DELETE',
        });
    }
    
    async searchArticles(query, category = '') {
        const params = new URLSearchParams();
        if (query) params.append('q', query);
        if (category) params.append('category', category);
        
        return this.request(`/api/articles/search?${params.toString()}`);
    }
    
    // Category endpoints
    async getCategories() {
        return this.request('/api/categories');
    }
    
    async createCategory(categoryData) {
        return this.request('/api/categories', {
            method: 'POST',
            body: JSON.stringify(categoryData),
        });
    }
    
    async updateCategory(id, categoryData) {
        return this.request(`/api/categories/${id}`, {
            method: 'PUT',
            body: JSON.stringify(categoryData),
        });
    }
    
    async deleteCategory(id) {
        return this.request(`/api/categories/${id}`, {
            method: 'DELETE',
        });
    }
    
    // Media endpoints
    async getMedia() {
        return this.request('/api/media');
    }
    
    async uploadMedia(formData) {
        return this.request('/api/media', {
            method: 'POST',
            headers: {}, // Remove Content-Type to let browser set it for FormData
            body: formData,
        });
    }
    
    async deleteMedia(id) {
        return this.request(`/api/media/${id}`, {
            method: 'DELETE',
        });
    }
    
    // Statistics endpoints
    async getStatistics() {
        return this.request('/api/statistics');
    }
    
    async getHomeData() {
        return this.request('/api/pages/home');
    }
    
    async getLatestNews(limit = 20) {
        return this.request(`/api/pages/latest?limit=${limit}`);
    }
    
    // Health check
    async healthCheck() {
        return this.request('/api/health');
    }
}

// Create singleton instance
const apiService = new ApiService();