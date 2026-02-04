// News Management System - Frontend JavaScript
class NewsAPI {
    constructor() {
        this.baseURL = window.location.origin;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || `HTTP ${response.status}`);
            }
            
            return data;
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    // News endpoints
    async getAllNews(page = 1, limit = 10) {
        return this.request(`/api/news?page=${page}&limit=${limit}`);
    }

    async getNewsById(id) {
        return this.request(`/api/news/${id}`);
    }

    async createNews(newsData) {
        return this.request('/api/news', {
            method: 'POST',
            body: JSON.stringify(newsData)
        });
    }

    async updateNews(id, newsData) {
        return this.request(`/api/news/${id}`, {
            method: 'PUT',
            body: JSON.stringify(newsData)
        });
    }

    async deleteNews(id) {
        return this.request(`/api/news/${id}`, {
            method: 'DELETE'
        });
    }

    async searchNews(query, category = '') {
        const params = new URLSearchParams();
        if (query) params.append('q', query);
        if (category) params.append('category', category);
        return this.request(`/api/news/search?${params}`);
    }

    // Category endpoints
    async getAllCategories() {
        return this.request('/api/categories');
    }

    async createCategory(categoryData) {
        return this.request('/api/categories', {
            method: 'POST',
            body: JSON.stringify(categoryData)
        });
    }

    async updateCategory(id, categoryData) {
        return this.request(`/api/categories/${id}`, {
            method: 'PUT',
            body: JSON.stringify(categoryData)
        });
    }

    async deleteCategory(id) {
        return this.request(`/api/categories/${id}`, {
            method: 'DELETE'
        });
    }

    // Media endpoints
    async getAllMedia() {
        return this.request('/api/media');
    }

    async uploadMedia(formData) {
        return this.request('/api/media', {
            method: 'POST',
            headers: {}, // Remove Content-Type to let browser set boundary
            body: formData
        });
    }

    async deleteMedia(id) {
        return this.request(`/api/media/${id}`, {
            method: 'DELETE'
        });
    }

    // Statistics
    async getStatistics() {
        return this.request('/api/statistics');
    }
}

// Initialize API
const api = new NewsAPI();

// Alpine.js app data
function appData() {
    return {
        currentPage: 'home',
        adminTab: 'dashboard',
        mobileMenuOpen: false,
        loading: false,
        
        // Data
        news: [],
        categories: [],
        media: [],
        statistics: {},
        
        // Pagination
        currentNewsPage: 1,
        newsPerPage: 9,
        totalNewsPages: 1,
        
        // Initialize app
        async init() {
            await this.loadInitialData();
            this.setupEventListeners();
            // Watch for page changes
            this.$watch('currentPage', (newPage) => {
                this.handlePageChange(newPage);
            });
            this.$watch('adminTab', (newTab) => {
                this.handleAdminTabChange(newTab);
            });
        },

        async handlePageChange(page) {
            switch(page) {
                case 'categories':
                    this.renderCategories();
                    break;
                case 'latest':
                    await this.loadNews();
                    break;
            }
        },

        async handleAdminTabChange(tab) {
            switch(tab) {
                case 'manage':
                    await this.loadNews();
                    break;
                case 'categories':
                    this.renderCategories();
                    break;
                case 'media':
                    await this.loadMedia();
                    break;
            }
        },

        async loadInitialData() {
            try {
                this.loading = true;
                await Promise.all([
                    this.loadNews(),
                    this.loadCategories(),
                    this.loadStatistics()
                ]);
            } catch (error) {
                console.error('Failed to load initial data:', error);
                this.showNotification('Failed to load data', 'error');
            } finally {
                this.loading = false;
            }
        },

        async loadNews(page = 1) {
            try {
                const response = await api.getAllNews(page, this.newsPerPage);
                this.news = response.data || [];
                if (response.pagination) {
                    this.currentNewsPage = response.pagination.page;
                    this.totalNewsPages = response.pagination.pages;
                }
                this.renderNews();
            } catch (error) {
                console.error('Failed to load news:', error);
            }
        },

        async loadCategories() {
            try {
                const response = await api.getAllCategories();
                this.categories = response.data || [];
                this.populateCategorySelects();
            } catch (error) {
                console.error('Failed to load categories:', error);
            }
        },

        async loadMedia() {
            try {
                const response = await api.getAllMedia();
                this.media = response.data || [];
                this.renderMedia();
            } catch (error) {
                console.error('Failed to load media:', error);
            }
        },

        async loadStatistics() {
            try {
                const response = await api.getStatistics();
                this.statistics = response.data || {};
                this.updateStatisticsDisplay();
            } catch (error) {
                console.error('Failed to load statistics:', error);
            }
        },

        setupEventListeners() {
            // Create article form
            const createForm = document.getElementById('createArticleForm');
            if (createForm) {
                createForm.addEventListener('submit', (e) => this.handleCreateArticle(e));
            }

            // Create category form
            const categoryForm = document.getElementById('createCategoryForm');
            if (categoryForm) {
                categoryForm.addEventListener('submit', (e) => this.handleCreateCategory(e));
            }

            // Edit article form
            const editForm = document.getElementById('editArticleForm');
            if (editForm) {
                editForm.addEventListener('submit', (e) => this.handleEditArticle(e));
            }

            // Media upload form
            const mediaForm = document.getElementById('uploadMediaForm');
            if (mediaForm) {
                mediaForm.addEventListener('submit', (e) => this.handleMediaUpload(e));
            }

            // Search functionality
            const searchInput = document.getElementById('articleSearch');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
            }

            const categoryFilter = document.getElementById('articleCategory');
            if (categoryFilter) {
                categoryFilter.addEventListener('change', (e) => this.handleCategoryFilter(e.target.value));
            }
        },

        async handleCreateArticle(e) {
            e.preventDefault();
            
            const formData = {
                title: document.getElementById('newArticleTitle').value,
                content: document.getElementById('newArticleContent').value,
                author: document.getElementById('newArticleAuthor').value,
                category: document.getElementById('newArticleCategory').value
            };

            try {
                await api.createNews(formData);
                this.showNotification('Article created successfully!', 'success');
                e.target.reset();
                await this.loadNews();
                await this.loadStatistics();
            } catch (error) {
                this.showNotification(error.message, 'error');
            }
        },

        async handleCreateCategory(e) {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('newCategoryName').value,
                description: document.getElementById('newCategoryDesc').value
            };

            try {
                await api.createCategory(formData);
                this.showNotification('Category created successfully!', 'success');
                e.target.reset();
                await this.loadCategories();
                await this.loadStatistics();
            } catch (error) {
                this.showNotification(error.message, 'error');
            }
        },

        async handleEditArticle(e) {
            e.preventDefault();
            
            const id = document.getElementById('editArticleId').value;
            const formData = {
                title: document.getElementById('editArticleTitle').value,
                content: document.getElementById('editArticleContent').value,
                author: document.getElementById('editArticleAuthor').value,
                category: document.getElementById('editArticleCategory').value
            };

            try {
                await api.updateNews(id, formData);
                this.showNotification('Article updated successfully!', 'success');
                closeEditModal();
                await this.loadNews();
            } catch (error) {
                this.showNotification(error.message, 'error');
            }
        },

        async handleMediaUpload(e) {
            e.preventDefault();
            
            const fileInput = document.getElementById('mediaUploadInput');
            const file = fileInput.files[0];
            
            if (!file) {
                this.showNotification('Please select a file', 'error');
                return;
            }

            const formData = new FormData();
            formData.append('file', file);

            try {
                await api.uploadMedia(formData);
                this.showNotification('File uploaded successfully!', 'success');
                fileInput.value = '';
                await this.loadMedia();
                await this.loadStatistics();
            } catch (error) {
                this.showNotification(error.message, 'error');
            }
        },

        async handleSearch(query) {
            if (!query.trim()) {
                await this.loadNews();
                return;
            }

            try {
                const response = await api.searchNews(query);
                this.news = response.data || [];
                this.renderNews();
            } catch (error) {
                console.error('Search failed:', error);
            }
        },

        async handleCategoryFilter(category) {
            if (!category) {
                await this.loadNews();
                return;
            }

            try {
                const response = await api.searchNews('', category);
                this.news = response.data || [];
                this.renderNews();
            } catch (error) {
                console.error('Filter failed:', error);
            }
        },

        async deleteArticle(id) {
            if (!confirm('Are you sure you want to delete this article?')) {
                return;
            }

            try {
                await api.deleteNews(id);
                this.showNotification('Article deleted successfully!', 'success');
                await this.loadNews();
                await this.loadStatistics();
            } catch (error) {
                this.showNotification(error.message, 'error');
            }
        },

        async deleteCategory(id) {
            if (!confirm('Are you sure you want to delete this category?')) {
                return;
            }

            try {
                await api.deleteCategory(id);
                this.showNotification('Category deleted successfully!', 'success');
                await this.loadCategories();
                await this.loadStatistics();
            } catch (error) {
                this.showNotification(error.message, 'error');
            }
        },

        async deleteMediaFile(id) {
            if (!confirm('Are you sure you want to delete this media file?')) {
                return;
            }

            try {
                await api.deleteMedia(id);
                this.showNotification('Media file deleted successfully!', 'success');
                await this.loadMedia();
                await this.loadStatistics();
            } catch (error) {
                this.showNotification(error.message, 'error');
            }
        },

        renderNews() {
            const containers = [
                'featuredContainer',
                'articlesContainer', 
                'latestContainer',
                'manageArticlesContainer'
            ];

            containers.forEach(containerId => {
                const container = document.getElementById(containerId);
                if (!container) return;

                if (this.news.length === 0) {
                    container.innerHTML = '<div class="col-span-full text-center text-gray-500 py-8">No articles found</div>';
                    return;
                }

                let html = '';
                const isLatest = containerId === 'latestContainer';
                const isManage = containerId === 'manageArticlesContainer';

                this.news.forEach(article => {
                    if (isLatest) {
                        html += this.renderLatestNewsItem(article);
                    } else if (isManage) {
                        html += this.renderManageArticleItem(article);
                    } else {
                        html += this.renderNewsCard(article);
                    }
                });

                container.innerHTML = html;
            });
        },

        renderNewsCard(article) {
            const truncatedContent = article.content.length > 150 
                ? article.content.substring(0, 150) + '...' 
                : article.content;

            return `
                <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div class="p-6">
                        <div class="flex items-center justify-between mb-2">
                            <span class="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                                ${article.category || 'Uncategorized'}
                            </span>
                            <span class="text-xs text-gray-500">
                                ${new Date(article.created_at).toLocaleDateString()}
                            </span>
                        </div>
                        <h3 class="text-xl font-bold text-gray-900 mb-2 cursor-pointer hover:text-blue-600" 
                            onclick="openArticleModal(${article.id})">
                            ${article.title}
                        </h3>
                        <p class="text-gray-600 mb-4">${truncatedContent}</p>
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-gray-500">
                                <i class="fas fa-user mr-1"></i>
                                ${article.author || 'Anonymous'}
                            </span>
                            <button onclick="openArticleModal(${article.id})" 
                                    class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                Read More <i class="fas fa-arrow-right ml-1"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        },

        renderLatestNewsItem(article) {
            return `
                <div class="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
                    <div class="flex items-start justify-between">
                        <div class="flex-1">
                            <div class="flex items-center gap-2 mb-2">
                                <span class="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded">
                                    ${article.category || 'Uncategorized'}
                                </span>
                                <span class="text-xs text-gray-500">
                                    ${new Date(article.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <h3 class="text-lg font-bold text-gray-900 mb-2 cursor-pointer hover:text-blue-600" 
                                onclick="openArticleModal(${article.id})">
                                ${article.title}
                            </h3>
                            <p class="text-gray-600 text-sm">
                                ${article.content.substring(0, 200)}...
                            </p>
                        </div>
                        <button onclick="openArticleModal(${article.id})" 
                                class="ml-4 text-blue-600 hover:text-blue-800">
                            <i class="fas fa-external-link-alt"></i>
                        </button>
                    </div>
                </div>
            `;
        },

        renderManageArticleItem(article) {
            return `
                <div class="bg-white rounded-lg shadow p-4 flex items-center justify-between">
                    <div class="flex-1">
                        <h4 class="font-semibold text-gray-900">${article.title}</h4>
                        <p class="text-sm text-gray-600">
                            ${article.author || 'Anonymous'} • ${article.category || 'Uncategorized'} • 
                            ${new Date(article.created_at).toLocaleDateString()}
                        </p>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="editArticle(${article.id})" 
                                class="text-blue-600 hover:text-blue-800 p-2">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="window.appInstance.deleteArticle(${article.id})" 
                                class="text-red-600 hover:text-red-800 p-2">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        },

        renderCategories() {
            const container = document.getElementById('categoriesContainer');
            const listContainer = document.getElementById('categoriesListContainer');
            
            if (!container && !listContainer) return;

            if (this.categories.length === 0) {
                const emptyHtml = '<div class="text-center text-gray-500 py-8">No categories found</div>';
                if (container) container.innerHTML = emptyHtml;
                if (listContainer) listContainer.innerHTML = emptyHtml;
                return;
            }

            // Render category cards
            if (container) {
                const cardsHtml = this.categories.map(category => `
                    <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                        <h3 class="text-xl font-bold text-gray-900 mb-2">${category.name}</h3>
                        <p class="text-gray-600 mb-4">${category.description || 'No description'}</p>
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-gray-500">
                                <i class="fas fa-calendar mr-1"></i>
                                ${new Date(category.created_at).toLocaleDateString()}
                            </span>
                            <button onclick="window.appInstance.handleCategoryFilter('${category.name}')" 
                                    class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                View Articles <i class="fas fa-arrow-right ml-1"></i>
                            </button>
                        </div>
                    </div>
                `).join('');
                container.innerHTML = cardsHtml;
            }

            // Render category list for admin
            if (listContainer) {
                const listHtml = this.categories.map(category => `
                    <div class="bg-white rounded-lg shadow p-4 flex items-center justify-between">
                        <div>
                            <h4 class="font-semibold text-gray-900">${category.name}</h4>
                            <p class="text-sm text-gray-600">${category.description || 'No description'}</p>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="window.appInstance.deleteCategory(${category.id})" 
                                    class="text-red-600 hover:text-red-800 p-2">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `).join('');
                listContainer.innerHTML = listHtml;
            }
        },

        renderMedia() {
            const container = document.getElementById('mediaListContainer');
            if (!container) return;

            if (this.media.length === 0) {
                container.innerHTML = '<div class="text-center text-gray-500 py-8">No media files found</div>';
                return;
            }

            const html = this.media.map(media => `
                <div class="bg-white rounded-lg shadow p-4 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <i class="fas fa-file text-gray-400 text-xl"></i>
                        <div>
                            <h4 class="font-semibold text-gray-900">${media.filename}</h4>
                            <p class="text-sm text-gray-600">
                                ${media.mime_type || 'Unknown type'} • 
                                ${media.size ? this.formatFileSize(media.size) : 'Unknown size'}
                            </p>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <a href="${media.filepath}" target="_blank" 
                           class="text-blue-600 hover:text-blue-800 p-2">
                            <i class="fas fa-external-link-alt"></i>
                        </a>
                        <button onclick="window.appInstance.deleteMediaFile(${media.id})" 
                                class="text-red-600 hover:text-red-800 p-2">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
            
            container.innerHTML = html;
        },

        populateCategorySelects() {
            const selects = [
                'articleCategory',
                'newArticleCategory', 
                'editArticleCategory'
            ];

            selects.forEach(selectId => {
                const select = document.getElementById(selectId);
                if (!select) return;

                const currentValue = select.value;
                const isFilter = selectId === 'articleCategory';
                
                select.innerHTML = isFilter 
                    ? '<option value="">All Categories</option>'
                    : '<option value="">Select Category</option>';

                this.categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.name;
                    option.textContent = category.name;
                    select.appendChild(option);
                });

                if (currentValue) {
                    select.value = currentValue;
                }
            });
        },

        updateStatisticsDisplay() {
            const stats = this.statistics;
            
            // Update home page stats
            this.updateElement('totalArticles', stats.total_articles || 0);
            this.updateElement('totalCategories', stats.total_categories || 0);
            this.updateElement('totalMedia', stats.total_media || 0);
            
            // Update admin stats
            this.updateElement('adminTotalArticles', stats.total_articles || 0);
            this.updateElement('adminTotalCategories', stats.total_categories || 0);
            this.updateElement('adminTotalMedia', stats.total_media || 0);
        },

        updateElement(id, value) {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        },

        formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        },

        showNotification(message, type = 'info') {
            // Simple notification system
            const notification = document.createElement('div');
            notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
                type === 'success' ? 'bg-green-500' : 
                type === 'error' ? 'bg-red-500' : 'bg-blue-500'
            } text-white`;
            notification.textContent = message;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 3000);
        }
    };
}

// Global functions for modal handling
async function openArticleModal(id) {
    try {
        const response = await api.getNewsById(id);
        const article = response.data;
        
        document.getElementById('modalTitle').textContent = article.title;
        document.getElementById('modalAuthor').textContent = article.author || 'Anonymous';
        document.getElementById('modalCategory').textContent = article.category || 'Uncategorized';
        document.getElementById('modalDate').textContent = new Date(article.created_at).toLocaleDateString();
        document.getElementById('modalContent').textContent = article.content;
        
        document.getElementById('articleModal').classList.remove('hidden');
    } catch (error) {
        console.error('Failed to load article:', error);
    }
}

function closeArticleModal() {
    document.getElementById('articleModal').classList.add('hidden');
}

async function editArticle(id) {
    try {
        const response = await api.getNewsById(id);
        const article = response.data;
        
        document.getElementById('editArticleId').value = article.id;
        document.getElementById('editArticleTitle').value = article.title;
        document.getElementById('editArticleAuthor').value = article.author || '';
        document.getElementById('editArticleCategory').value = article.category || '';
        document.getElementById('editArticleContent').value = article.content;
        
        document.getElementById('editArticleForm').style.display = 'block';
        document.getElementById('editModal').classList.remove('hidden');
    } catch (error) {
        console.error('Failed to load article for editing:', error);
    }
}

function closeEditModal() {
    document.getElementById('editModal').classList.add('hidden');
    document.getElementById('editArticleForm').style.display = 'none';
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Store app instance globally for access from onclick handlers
    window.appInstance = appData();
});

// Remove the Alpine store watcher as it's not needed
// The page changes are now handled by Alpine's $watch in the init method