/**
 * Latest News Controller
 */

class LatestNewsController {
    constructor() {
        this.articles = [];
        this.filteredArticles = [];
        this.categories = [];
        this.authors = [];
        this.filters = {
            category: '',
            author: '',
            timeRange: ''
        };
        this.limit = 20;
    }
    
    async init() {
        try {
            console.log('Initializing Latest News Controller');
            await this.loadLatestNews();
            await this.loadFilters();
            this.setupEventListeners();
            this.render();
            console.log('Latest News Controller initialized successfully');
        } catch (error) {
            console.error('Latest news controller error:', error);
            window.app.toast.error('Failed to load latest news');
        }
    }
    
    async loadLatestNews() {
        try {
            console.log('Loading latest news with limit:', this.limit);
            // Fetch articles from the articles endpoint
            const response = await apiService.getArticles(1, this.limit);
            console.log('API Response:', response);
            this.articles = response.data || [];
            console.log('Articles loaded:', this.articles.length);
            
            // Sort articles by creation date (newest first)
            this.articles.sort((a, b) => {
                const dateA = new Date(a.created_at || 0);
                const dateB = new Date(b.created_at || 0);
                return dateB - dateA;
            });
            
            console.log('Articles sorted by date');
            this.applyFilters();
        } catch (error) {
            console.error('Error loading latest news:', error);
            throw error;
        }
    }
    
    async loadFilters() {
        try {
            const categoriesResponse = await apiService.getCategories();
            this.categories = categoriesResponse.data || [];
            
            // Extract unique authors from articles
            this.authors = [...new Set(this.articles.map(article => article.author).filter(Boolean))];
            
            this.renderFilters();
        } catch (error) {
            console.error('Failed to load filters:', error);
        }
    }
    
    applyFilters() {
        this.filteredArticles = this.articles.filter(article => {
            // Category filter
            if (this.filters.category && article.category !== this.filters.category) {
                return false;
            }
            
            // Author filter
            if (this.filters.author && article.author !== this.filters.author) {
                return false;
            }
            
            // Time range filter
            if (this.filters.timeRange) {
                const articleDate = new Date(article.created_at);
                const now = new Date();
                
                switch (this.filters.timeRange) {
                    case 'today':
                        if (articleDate.toDateString() !== now.toDateString()) return false;
                        break;
                    case 'week':
                        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        if (articleDate < weekAgo) return false;
                        break;
                    case 'month':
                        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                        if (articleDate < monthAgo) return false;
                        break;
                }
            }
            
            return true;
        });
    }
    
    setupEventListeners() {
        const loadMoreBtn = document.getElementById('load-more-btn');
        const refreshBtn = document.getElementById('refresh-latest-btn');
        const filterBtn = document.getElementById('filter-latest-btn');
        const exportBtn = document.getElementById('export-latest-btn');
        
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => this.loadMore());
        }
        
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshNews());
        }
        
        if (filterBtn) {
            filterBtn.addEventListener('click', () => this.toggleFilterPanel());
        }
        
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportLatestNews());
        }
        
        // Filter event listeners
        const categoryFilter = document.getElementById('latest-category-filter');
        const authorFilter = document.getElementById('latest-author-filter');
        const timeFilter = document.getElementById('latest-time-filter');
        
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.filters.category = e.target.value;
                this.applyFilters();
                this.render();
            });
        }
        
        if (authorFilter) {
            authorFilter.addEventListener('change', (e) => {
                this.filters.author = e.target.value;
                this.applyFilters();
                this.render();
            });
        }
        
        if (timeFilter) {
            timeFilter.addEventListener('change', (e) => {
                this.filters.timeRange = e.target.value;
                this.applyFilters();
                this.render();
            });
        }
    }
    
    render() {
        this.renderArticles();
    }
    
    renderFilters() {
        // Render category filter
        const categoryFilter = document.getElementById('latest-category-filter');
        if (categoryFilter) {
            categoryFilter.innerHTML = `
                <option value="">All Categories</option>
                ${this.categories.map(category => `
                    <option value="${category.name}" ${this.filters.category === category.name ? 'selected' : ''}>
                        ${category.name}
                    </option>
                `).join('')}
            `;
        }
        
        // Render author filter
        const authorFilter = document.getElementById('latest-author-filter');
        if (authorFilter) {
            authorFilter.innerHTML = `
                <option value="">All Authors</option>
                ${this.authors.map(author => `
                    <option value="${author}" ${this.filters.author === author ? 'selected' : ''}>
                        ${author}
                    </option>
                `).join('')}
            `;
        }
    }
    
    renderArticles() {
        const container = document.getElementById('latest-articles-container');
        if (!container) {
            console.warn('latest-articles-container not found');
            return;
        }
        
        console.log('Rendering articles, filtered count:', this.filteredArticles.length);
        
        if (this.filteredArticles.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-newspaper text-4xl text-gray-400 mb-4"></i>
                    <p class="text-gray-600">No latest news available</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.filteredArticles.map(article => {
            console.log('Rendering article:', article.title);
            return `
            <div class="bg-gray-50 rounded-lg shadow p-6 card">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <div class="flex items-center space-x-2 mb-2">
                            <span class="category-badge bg-green-100 text-green-800">
                                ${article.category || 'General'}
                            </span>
                            <span class="text-sm text-gray-600">
                                ${this.formatDate(article.created_at)}
                            </span>
                        </div>
                        <h3 class="text-xl font-semibold text-gray-900 mb-2">
                            ${article.title}
                        </h3>
                        <p class="text-gray-700 mb-2">
                            ${article.content.substring(0, 200)}...
                        </p>
                        <p class="text-sm text-gray-600">
                            By ${article.author || 'Anonymous'}
                        </p>
                    </div>
                    <div class="ml-4 flex flex-col items-center space-y-2">
                        <span class="inline-block w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                        <div class="flex space-x-1">
                            <button onclick="latestNewsController.editArticle(${article.id})" 
                                    class="text-blue-600 hover:text-blue-800 p-1" title="Edit">
                                <i class="fas fa-edit text-sm"></i>
                            </button>
                            <button onclick="latestNewsController.deleteArticle(${article.id})" 
                                    class="text-red-600 hover:text-red-800 p-1" title="Delete">
                                <i class="fas fa-trash text-sm"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `}).join('');
    }
    
    async loadMore() {
        this.limit += 10;
        try {
            await this.loadLatestNews();
            this.render();
        } catch (error) {
            window.app.toast.error('Failed to load more articles');
        }
    }
    
    async refreshNews() {
        try {
            await this.loadLatestNews();
            await this.loadFilters();
            this.render();
            window.app.toast.success('Latest news refreshed');
        } catch (error) {
            window.app.toast.error('Failed to refresh news');
        }
    }
    
    toggleFilterPanel() {
        const panel = document.getElementById('filter-panel');
        if (panel) {
            panel.classList.toggle('hidden');
        }
    }
    
    async editArticle(id) {
        // Navigate to articles page and trigger edit
        window.app.router.navigate('articles');
        setTimeout(() => {
            if (window.articlesController) {
                window.articlesController.editArticle(id);
            }
        }, 500);
    }
    
    async deleteArticle(id) {
        if (!confirm('Are you sure you want to delete this article?')) return;
        
        try {
            await apiService.deleteArticle(id);
            window.app.toast.success('Article deleted successfully');
            await this.loadLatestNews();
            this.render();
        } catch (error) {
            window.app.toast.error('Failed to delete article');
        }
    }
    
    exportLatestNews() {
        const exportData = this.filteredArticles.map(article => ({
            id: article.id,
            title: article.title,
            content: article.content,
            author: article.author,
            category: article.category,
            created_at: article.created_at
        }));
        
        ExportUtil.downloadJSON(exportData, `latest-news-export-${new Date().toISOString().split('T')[0]}.json`);
        window.app.toast.success('Latest news exported successfully');
    }
    
    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

const latestNewsController = new LatestNewsController();
window.latestNewsController = latestNewsController;