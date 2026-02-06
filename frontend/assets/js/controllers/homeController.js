/**
 * Home Page Controller
 */

class HomeController {
    constructor() {
        this.featuredArticles = [];
        this.statistics = {};
    }
    
    async init() {
        try {
            await this.loadData();
            this.render();
        } catch (error) {
            console.error('Home controller error:', error);
            window.app.toast.error('Failed to load home data');
        }
    }
    
    async loadData() {
        const data = await apiService.getHomeData();
        this.featuredArticles = data.data.featured_articles || [];
        this.statistics = data.data.statistics || {};
    }
    
    render() {
        this.renderStatistics();
        this.renderRecentArticles();
    }
    
    renderStatistics() {
        const container = document.getElementById('stats-container');
        if (!container) return;
        
        const stats = [
            {
                title: 'Total Articles',
                value: this.statistics.total_articles || 0,
                icon: 'fas fa-newspaper',
                color: 'bg-blue-500'
            },
            {
                title: 'Categories',
                value: this.statistics.total_categories || 0,
                icon: 'fas fa-tags',
                color: 'bg-green-500'
            },
            {
                title: 'Authors',
                value: this.statistics.total_authors || 0,
                icon: 'fas fa-users',
                color: 'bg-purple-500'
            }
        ];
        
        container.innerHTML = stats.map(stat => `
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 card">
                <div class="flex items-center">
                    <div class="${stat.color} text-white p-3 rounded-lg mr-4">
                        <i class="${stat.icon} text-xl"></i>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600 dark:text-gray-400">${stat.title}</p>
                        <p class="text-2xl font-bold text-gray-800 dark:text-white">${stat.value}</p>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    renderFeaturedArticles() {
        const container = document.getElementById('featured-articles');
        if (!container) return;
        
        if (this.featuredArticles.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <i class="fas fa-newspaper text-4xl text-gray-400 mb-4"></i>
                    <p class="text-gray-600 dark:text-gray-400">No featured articles available</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.featuredArticles.map(article => `
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden card article-card">
                <div class="p-6">
                    <div class="flex items-center justify-between mb-2">
                        <span class="category-badge bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            ${article.category || 'General'}
                        </span>
                        <span class="text-sm text-gray-500 dark:text-gray-400">
                            ${this.formatDate(article.created_at)}
                        </span>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-2 line-clamp-2">
                        ${article.title}
                    </h3>
                    <p class="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                        ${article.content.substring(0, 150)}...
                    </p>
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-gray-500 dark:text-gray-400">
                            By ${article.author || 'Anonymous'}
                        </span>
                        <button class="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm font-medium"
                                onclick="if(window.app && window.app.router) window.app.router.navigate('articles')">
                            Read More →
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    renderRecentArticles() {
        const container = document.getElementById('recent-articles-list');
        if (!container) return;
        
        const recentArticles = this.featuredArticles.slice(0, 5);
        
        if (recentArticles.length === 0) {
            container.innerHTML = `
                <div class="text-center py-4">
                    <p class="text-gray-500 dark:text-gray-400">No recent articles</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = recentArticles.map(article => `
            <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div class="flex-1">
                    <h4 class="font-medium text-gray-800 dark:text-white">${article.title}</h4>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                        ${article.category} • ${this.formatDate(article.created_at)}
                    </p>
                </div>
                <div class="flex space-x-2">
                    <button onclick="homeController.editArticle(${article.id})" 
                            class="text-blue-600 hover:text-blue-800 p-1" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="homeController.deleteArticle(${article.id})" 
                            class="text-red-600 hover:text-red-800 p-1" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    async refreshRecentArticles() {
        try {
            await this.loadData();
            this.renderRecentArticles();
            window.app.toast.success('Articles refreshed');
        } catch (error) {
            window.app.toast.error('Failed to refresh articles');
        }
    }
    
    async editArticle(id) {
        try {
            const response = await apiService.getArticle(id);
            // Navigate to articles page and trigger edit
            window.app.router.navigate('articles');
            setTimeout(() => {
                if (window.articlesController) {
                    window.articlesController.editArticle(id);
                }
            }, 500);
        } catch (error) {
            window.app.toast.error('Failed to load article for editing');
        }
    }
    
    async deleteArticle(id) {
        if (!confirm('Are you sure you want to delete this article?')) return;
        
        try {
            await apiService.deleteArticle(id);
            window.app.toast.success('Article deleted successfully');
            await this.loadData();
            this.render();
        } catch (error) {
            window.app.toast.error('Failed to delete article');
        }
    }
    
    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
}

const homeController = new HomeController();
window.homeController = homeController;