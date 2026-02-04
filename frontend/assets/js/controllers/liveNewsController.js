/**
 * Live News Controller
 */

class LiveNewsController {
    constructor() {
        this.articles = [];
        this.autoRefresh = true;
        this.refreshInterval = 60; // seconds
        this.intervalId = null;
    }
    
    async init() {
        try {
            await this.loadLiveNews();
            this.setupEventListeners();
            this.render();
            this.startAutoRefresh();
        } catch (error) {
            console.error('Live news controller error:', error);
            window.app.toast.error('Failed to load live news');
        }
    }
    
    async loadLiveNews() {
        const response = await apiService.getLatestNews(15);
        this.articles = response.data.latest_articles || [];
    }
    
    setupEventListeners() {
        const autoRefreshCheckbox = document.getElementById('auto-refresh');
        const refreshIntervalSelect = document.getElementById('refresh-interval');
        const refreshNowBtn = document.getElementById('refresh-now-btn');
        
        if (autoRefreshCheckbox) {
            autoRefreshCheckbox.addEventListener('change', (e) => {
                this.autoRefresh = e.target.checked;
                if (this.autoRefresh) {
                    this.startAutoRefresh();
                } else {
                    this.stopAutoRefresh();
                }
            });
        }
        
        if (refreshIntervalSelect) {
            refreshIntervalSelect.addEventListener('change', (e) => {
                this.refreshInterval = parseInt(e.target.value);
                if (this.autoRefresh) {
                    this.startAutoRefresh();
                }
            });
        }
        
        if (refreshNowBtn) {
            refreshNowBtn.addEventListener('click', () => this.refreshNews());
        }
    }
    
    render() {
        const container = document.getElementById('live-news-container');
        if (!container) return;
        
        if (this.articles.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-broadcast-tower text-4xl text-gray-400 mb-4"></i>
                    <p class="text-gray-600 dark:text-gray-400">No live news available</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.articles.map((article, index) => `
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 card ${index === 0 ? 'border-l-4 border-red-500' : ''}">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <div class="flex items-center space-x-2 mb-2">
                            ${index === 0 ? '<span class="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-2 py-1 rounded text-xs font-semibold">BREAKING</span>' : ''}
                            <span class="category-badge bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                ${article.category || 'General'}
                            </span>
                            <span class="text-sm text-gray-500 dark:text-gray-400">
                                ${this.getTimeAgo(article.created_at)}
                            </span>
                        </div>
                        <h3 class="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                            ${article.title}
                        </h3>
                        <p class="text-gray-600 dark:text-gray-300 mb-2">
                            ${article.content.substring(0, 200)}...
                        </p>
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                            By ${article.author || 'Anonymous'}
                        </p>
                    </div>
                    <div class="ml-4 flex flex-col items-center">
                        <span class="inline-block w-3 h-3 bg-red-500 rounded-full animate-pulse mb-2"></span>
                        <span class="text-xs text-gray-500 dark:text-gray-400">LIVE</span>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    async refreshNews() {
        try {
            const refreshBtn = document.getElementById('refresh-now-btn');
            if (refreshBtn) {
                refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Refreshing...';
                refreshBtn.disabled = true;
            }
            
            await this.loadLiveNews();
            this.render();
            
            window.app.toast.success('News updated');
            
            if (refreshBtn) {
                refreshBtn.innerHTML = '<i class="fas fa-sync-alt mr-2"></i>Refresh Now';
                refreshBtn.disabled = false;
            }
        } catch (error) {
            window.app.toast.error('Failed to refresh news');
        }
    }
    
    startAutoRefresh() {
        this.stopAutoRefresh();
        if (this.autoRefresh) {
            this.intervalId = setInterval(() => {
                this.refreshNews();
            }, this.refreshInterval * 1000);
        }
    }
    
    stopAutoRefresh() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
    
    getTimeAgo(dateString) {
        if (!dateString) return '';
        
        const now = new Date();
        const date = new Date(dateString);
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) {
            return `${diffInSeconds}s ago`;
        } else if (diffInSeconds < 3600) {
            return `${Math.floor(diffInSeconds / 60)}m ago`;
        } else if (diffInSeconds < 86400) {
            return `${Math.floor(diffInSeconds / 3600)}h ago`;
        } else {
            return `${Math.floor(diffInSeconds / 86400)}d ago`;
        }
    }
    
    destroy() {
        this.stopAutoRefresh();
    }
}

const liveNewsController = new LiveNewsController();