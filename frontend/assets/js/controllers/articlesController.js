/**
 * Articles Page Controller
 */

class ArticlesController {
    constructor() {
        this.articles = [];
        this.categories = [];
        this.currentPage = 1;
        this.totalPages = 1;
        this.viewMode = 'grid';
        this.searchTerm = '';
        this.selectedCategory = '';
        this.sortBy = 'created_at';
        this.selectedArticles = new Set();
        this.editingArticle = null;
    }
    
    async init() {
        try {
            await this.loadCategories();
            await this.loadArticles();
            this.setupEventListeners();
            this.render();
        } catch (error) {
            console.error('Articles controller error:', error);
            window.app.toast.error('Failed to load articles');
        }
    }
    
    async loadCategories() {
        const response = await apiService.getCategories();
        this.categories = response.data || [];
    }
    
    async loadArticles(page = 1) {
        const response = await apiService.getArticles(page, 12);
        this.articles = response.data || [];
        this.currentPage = response.pagination?.page || 1;
        this.totalPages = response.pagination?.pages || 1;
    }
    
    setupEventListeners() {
        // Article count button
        const articleCountBtn = document.getElementById('article-count-btn');
        if (articleCountBtn) {
            articleCountBtn.addEventListener('click', () => this.showArticleCountModal());
        }
        
        // Create article button
        const createBtn = document.getElementById('create-article-btn');
        if (createBtn) {
            createBtn.addEventListener('click', () => this.showArticleModal());
        }
        
        // Search input
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value;
                this.debounceSearch();
            });
        }
        
        // Category filter
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.selectedCategory = e.target.value;
                this.performSearch();
            });
        }
        
        // Sort selector
        const sortBy = document.getElementById('sort-by');
        if (sortBy) {
            sortBy.addEventListener('change', (e) => {
                this.sortBy = e.target.value;
                this.performSearch();
            });
        }
        
        // Bulk operations
        const selectAllBtn = document.getElementById('select-all-btn');
        const bulkDeleteBtn = document.getElementById('bulk-delete-btn');
        const exportBtn = document.getElementById('export-articles-btn');
        
        if (selectAllBtn) {
            selectAllBtn.addEventListener('click', () => this.toggleSelectAll());
        }
        
        if (bulkDeleteBtn) {
            bulkDeleteBtn.addEventListener('click', () => this.bulkDeleteArticles());
        }
        
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportArticles());
        }
        
        // View mode buttons
        const gridViewBtn = document.getElementById('grid-view-btn');
        const listViewBtn = document.getElementById('list-view-btn');
        
        if (gridViewBtn) {
            gridViewBtn.addEventListener('click', () => this.setViewMode('grid'));
        }
        
        if (listViewBtn) {
            listViewBtn.addEventListener('click', () => this.setViewMode('list'));
        }
        
        // Modal events
        this.setupModalEvents();
    }
    
    setupModalEvents() {
        // Article count modal
        const countModal = document.getElementById('article-count-modal');
        const closeCountBtn = document.getElementById('close-count-modal');
        const closeCountBtnAlt = document.getElementById('close-count-modal-btn');
        
        if (closeCountBtn) {
            closeCountBtn.addEventListener('click', () => this.hideArticleCountModal());
        }
        
        if (closeCountBtnAlt) {
            closeCountBtnAlt.addEventListener('click', () => this.hideArticleCountModal());
        }
        
        // Close modal on backdrop click
        if (countModal) {
            countModal.addEventListener('click', (e) => {
                if (e.target === countModal) {
                    this.hideArticleCountModal();
                }
            });
        }
        
        // Article modal
        const modal = document.getElementById('article-modal');
        const closeBtn = document.getElementById('close-modal');
        const cancelBtn = document.getElementById('cancel-btn');
        const form = document.getElementById('article-form');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideArticleModal());
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hideArticleModal());
        }
        
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
        
        // Close modal on backdrop click
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideArticleModal();
                }
            });
        }
    }
    
    render() {
        this.renderCategoryFilter();
        this.renderArticles();
        this.renderPagination();
    }
    
    renderCategoryFilter() {
        const categoryFilter = document.getElementById('category-filter');
        if (!categoryFilter) return;
        
        categoryFilter.innerHTML = `
            <option value="">All Categories</option>
            ${this.categories.map(category => `
                <option value="${category.name}" ${this.selectedCategory === category.name ? 'selected' : ''}>
                    ${category.name}
                </option>
            `).join('')}
        `;
    }
    
    renderArticles() {
        const container = document.getElementById('articles-container');
        if (!container) return;
        
        // Update container class based on view mode
        if (this.viewMode === 'list') {
            container.className = 'space-y-4';
        } else {
            container.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
        }
        
        if (this.articles.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <i class="fas fa-newspaper text-4xl text-gray-400 mb-4"></i>
                    <p class="text-gray-600">No articles found</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.articles.map(article => 
            this.viewMode === 'list' ? this.renderListItem(article) : this.renderGridItem(article)
        ).join('');
    }
    
    renderGridItem(article) {
        const isSelected = this.selectedArticles.has(article.id);
        return `
            <div class="bg-gray-50 rounded-lg shadow p-6 card article-card ${isSelected ? 'ring-2 ring-blue-500' : ''}">
                <div class="p-6">
                    <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center space-x-2">
                            <input type="checkbox" ${isSelected ? 'checked' : ''} 
                                   onchange="articlesController.toggleArticleSelection(${article.id})" 
                                   class="rounded border-gray-300">
                            <span class="category-badge bg-blue-100 text-blue-800">
                                ${article.category || 'General'}
                            </span>
                        </div>
                        <div class="flex space-x-2">
                            <button onclick="articlesController.viewArticle(${article.id})" 
                                    class="text-green-600 hover:text-green-800 text-sm" title="View">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button onclick="articlesController.editArticle(${article.id})" 
                                    class="text-blue-600 hover:text-blue-800 text-sm" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="articlesController.duplicateArticle(${article.id})" 
                                    class="text-yellow-600 hover:text-yellow-800 text-sm" title="Duplicate">
                                <i class="fas fa-copy"></i>
                            </button>
                            <button onclick="articlesController.deleteArticle(${article.id})" 
                                    class="text-red-600 hover:text-red-800 text-sm" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        ${article.title}
                    </h3>
                    <p class="text-gray-700 text-sm mb-4 line-clamp-3">
                        ${article.content.substring(0, 150)}...
                    </p>
                    <div class="flex items-center justify-between text-sm text-gray-600">
                        <span>By ${article.author || 'Anonymous'}</span>
                        <span>${this.formatDate(article.created_at)}</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderListItem(article) {
        const isSelected = this.selectedArticles.has(article.id);
        return `
            <div class="bg-gray-50 rounded-lg shadow p-6 card ${isSelected ? 'ring-2 ring-blue-500' : ''}">
                <div class="flex items-start justify-between">
                    <div class="flex items-start space-x-3">
                        <input type="checkbox" ${isSelected ? 'checked' : ''} 
                               onchange="articlesController.toggleArticleSelection(${article.id})" 
                               class="mt-1 rounded border-gray-300">
                        <div class="flex-1">
                            <div class="flex items-center space-x-2 mb-2">
                                <span class="category-badge bg-blue-100 text-blue-800">
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
                    </div>
                    <div class="flex space-x-2 ml-4">
                        <button onclick="articlesController.viewArticle(${article.id})" 
                                class="text-green-600 hover:text-green-800 p-2" title="View">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button onclick="articlesController.editArticle(${article.id})" 
                                class="text-blue-600 hover:text-blue-800 p-2" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="articlesController.duplicateArticle(${article.id})" 
                                class="text-yellow-600 hover:text-yellow-800 p-2" title="Duplicate">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button onclick="articlesController.deleteArticle(${article.id})" 
                                class="text-red-600 hover:text-red-800 p-2" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderPagination() {
        const container = document.getElementById('pagination');
        if (!container || this.totalPages <= 1) return;
        
        const buttons = [];
        
        // Previous button
        buttons.push(`
            <button ${this.currentPage === 1 ? 'disabled' : ''} 
                    onclick="articlesController.goToPage(${this.currentPage - 1})"
                    class="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50">
                <i class="fas fa-chevron-left"></i>
            </button>
        `);
        
        // Page numbers
        for (let i = 1; i <= this.totalPages; i++) {
            if (i === this.currentPage) {
                buttons.push(`
                    <button class="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg">
                        ${i}
                    </button>
                `);
            } else if (i === 1 || i === this.totalPages || Math.abs(i - this.currentPage) <= 2) {
                buttons.push(`
                    <button onclick="articlesController.goToPage(${i})"
                            class="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                        ${i}
                    </button>
                `);
            } else if (Math.abs(i - this.currentPage) === 3) {
                buttons.push('<span class="px-2 text-gray-500">...</span>');
            }
        }
        
        // Next button
        buttons.push(`
            <button ${this.currentPage === this.totalPages ? 'disabled' : ''} 
                    onclick="articlesController.goToPage(${this.currentPage + 1})"
                    class="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50">
                <i class="fas fa-chevron-right"></i>
            </button>
        `);
        
        container.innerHTML = buttons.join('');
    }
    
    async goToPage(page) {
        if (page < 1 || page > this.totalPages) return;
        
        try {
            await this.loadArticles(page);
            this.renderArticles();
            this.renderPagination();
        } catch (error) {
            window.app.toast.error('Failed to load page');
        }
    }
    
    setViewMode(mode) {
        this.viewMode = mode;
        
        // Update button states
        const gridBtn = document.getElementById('grid-view-btn');
        const listBtn = document.getElementById('list-view-btn');
        
        if (gridBtn && listBtn) {
            gridBtn.classList.toggle('bg-blue-600', mode === 'grid');
            gridBtn.classList.toggle('text-white', mode === 'grid');
            listBtn.classList.toggle('bg-blue-600', mode === 'list');
            listBtn.classList.toggle('text-white', mode === 'list');
        }
        
        this.renderArticles();
    }
    
    debounceSearch() {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.performSearch();
        }, 500);
    }
    
    async performSearch() {
        if (!this.searchTerm && !this.selectedCategory) {
            await this.loadArticles();
        } else {
            try {
                const response = await apiService.searchArticles(this.searchTerm, this.selectedCategory);
                this.articles = response.data || [];
                this.currentPage = 1;
                this.totalPages = 1;
            } catch (error) {
                window.app.toast.error('Search failed');
            }
        }
        
        this.render();
    }
    
    showArticleModal(article = null) {
        this.editingArticle = article;
        const modal = document.getElementById('article-modal');
        const title = document.getElementById('modal-title');
        const form = document.getElementById('article-form');
        
        if (article) {
            title.textContent = 'Edit Article';
            document.getElementById('article-title').value = article.title;
            document.getElementById('article-author').value = article.author || '';
            document.getElementById('article-category').value = article.category || '';
            document.getElementById('article-content').value = article.content;
        } else {
            title.textContent = 'Create Article';
            form.reset();
        }
        
        modal.classList.remove('hidden');
    }
    
    hideArticleModal() {
        const modal = document.getElementById('article-modal');
        modal.classList.add('hidden');
        this.editingArticle = null;
    }
    
    async handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = {
            title: document.getElementById('article-title').value,
            author: document.getElementById('article-author').value,
            category: document.getElementById('article-category').value,
            content: document.getElementById('article-content').value,
        };
        
        try {
            if (this.editingArticle) {
                await apiService.updateArticle(this.editingArticle.id, formData);
                window.app.toast.success('Article updated successfully');
            } else {
                await apiService.createArticle(formData);
                window.app.toast.success('Article created successfully');
            }
            
            this.hideArticleModal();
            await this.loadArticles(this.currentPage);
            this.render();
            
        } catch (error) {
            window.app.toast.error('Failed to save article');
        }
    }
    
    async editArticle(id) {
        try {
            const response = await apiService.getArticle(id);
            this.showArticleModal(response.data);
        } catch (error) {
            window.app.toast.error('Failed to load article');
        }
    }
    
    async deleteArticle(id) {
        if (!confirm('Are you sure you want to delete this article?')) return;
        
        try {
            await apiService.deleteArticle(id);
            window.app.toast.success('Article deleted successfully');
            await this.loadArticles(this.currentPage);
            this.render();
        } catch (error) {
            window.app.toast.error('Failed to delete article');
        }
    }
    
    
    toggleArticleSelection(id) {
        if (this.selectedArticles.has(id)) {
            this.selectedArticles.delete(id);
        } else {
            this.selectedArticles.add(id);
        }
        this.updateBulkActions();
    }
    
    toggleSelectAll() {
        if (this.selectedArticles.size === this.articles.length) {
            this.selectedArticles.clear();
        } else {
            this.articles.forEach(article => this.selectedArticles.add(article.id));
        }
        this.updateBulkActions();
        this.renderArticles();
    }
    
    updateBulkActions() {
        const bulkDeleteBtn = document.getElementById('bulk-delete-btn');
        const selectAllBtn = document.getElementById('select-all-btn');
        
        if (bulkDeleteBtn) {
            if (this.selectedArticles.size > 0) {
                bulkDeleteBtn.classList.remove('hidden');
                bulkDeleteBtn.textContent = `Delete Selected (${this.selectedArticles.size})`;
            } else {
                bulkDeleteBtn.classList.add('hidden');
            }
        }
        
        if (selectAllBtn) {
            const icon = selectAllBtn.querySelector('i');
            if (this.selectedArticles.size === this.articles.length && this.articles.length > 0) {
                icon.className = 'fas fa-check-square';
            } else {
                icon.className = 'fas fa-square';
            }
        }
    }
    
    async bulkDeleteArticles() {
        if (this.selectedArticles.size === 0) return;
        
        if (!confirm(`Are you sure you want to delete ${this.selectedArticles.size} articles?`)) return;
        
        try {
            const deletePromises = Array.from(this.selectedArticles).map(id => 
                apiService.deleteArticle(id)
            );
            
            await Promise.all(deletePromises);
            
            window.app.toast.success(`${this.selectedArticles.size} articles deleted successfully`);
            this.selectedArticles.clear();
            await this.loadArticles(this.currentPage);
            this.render();
        } catch (error) {
            window.app.toast.error('Failed to delete some articles');
        }
    }
    
    async viewArticle(id) {
        try {
            const response = await apiService.getArticle(id);
            const article = response.data;
            
            // Create view modal
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
            modal.innerHTML = `
                <div class="bg-gray-50 p-6 rounded-lg w-full max-w-4xl max-h-screen overflow-y-auto">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-2xl font-bold text-gray-900">${article.title}</h2>
                        <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                                class="text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    <div class="mb-4">
                        <div class="flex items-center space-x-4 text-sm text-gray-600">
                            <span class="category-badge bg-blue-100 text-blue-800">
                                ${article.category || 'General'}
                            </span>
                            <span>By ${article.author || 'Anonymous'}</span>
                            <span>${this.formatDate(article.created_at)}</span>
                        </div>
                    </div>
                    <div class="prose max-w-none">
                        <p class="text-gray-800 whitespace-pre-wrap">${article.content}</p>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
        } catch (error) {
            window.app.toast.error('Failed to load article');
        }
    }
    
    async duplicateArticle(id) {
        try {
            const response = await apiService.getArticle(id);
            const article = response.data;
            
            const duplicatedArticle = {
                title: `Copy of ${article.title}`,
                content: article.content,
                author: article.author,
                category: article.category
            };
            
            await apiService.createArticle(duplicatedArticle);
            window.app.toast.success('Article duplicated successfully');
            await this.loadArticles(this.currentPage);
            this.render();
        } catch (error) {
            window.app.toast.error('Failed to duplicate article');
        }
    }
    
    exportArticles() {
        const exportData = this.articles.map(article => ({
            id: article.id,
            title: article.title,
            content: article.content,
            author: article.author,
            category: article.category,
            created_at: article.created_at,
            updated_at: article.updated_at
        }));
        
        ExportUtil.downloadJSON(exportData, `articles-export-${new Date().toISOString().split('T')[0]}.json`);
        window.app.toast.success('Articles exported successfully');
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
    
    async showArticleCountModal() {
        const modal = document.getElementById('article-count-modal');
        if (!modal) return;
        
        modal.classList.remove('hidden');
        
        try {
            // Get total count by fetching all articles
            const response = await apiService.getArticles(1, 1000);
            const totalCount = response.data ? response.data.length : 0;
            
            const displayElement = document.getElementById('article-count-display');
            const statsElement = document.getElementById('article-stats');
            
            if (displayElement) {
                displayElement.textContent = totalCount;
            }
            
            if (statsElement) {
                statsElement.textContent = `Total articles in the application: ${totalCount}`;
            }
        } catch (error) {
            console.error('Failed to fetch article count:', error);
            window.app.toast.error('Failed to fetch article count');
        }
    }
    
    hideArticleCountModal() {
        const modal = document.getElementById('article-count-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }
}

const articlesController = new ArticlesController();
window.articlesController = articlesController;