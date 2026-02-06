/**
 * Admin Manage Articles Controller
 */

class AdminManageArticlesController {
    constructor() {
        this.articles = [];
        this.categories = [];
        this.selectedArticles = new Set();
        this.currentPage = 1;
        this.totalPages = 1;
        this.searchTerm = '';
        this.filterCategory = '';
        this.editingArticle = null;
    }
    
    async init() {
        try {
            await this.loadData();
            this.setupEventListeners();
            this.render();
        } catch (error) {
            console.error('Admin manage articles controller error:', error);
            window.app.toast.error('Failed to load manage articles page');
        }
    }
    
    async loadData() {
        const [articlesResponse, categoriesResponse] = await Promise.all([
            apiService.getArticles(this.currentPage, 10),
            apiService.getCategories()
        ]);
        
        this.articles = articlesResponse.data || [];
        this.categories = categoriesResponse.data || [];
        this.totalPages = articlesResponse.pagination?.pages || 1;
    }
    
    setupEventListeners() {
        // Article count button
        const articleCountBtn = document.getElementById('admin-article-count-btn');
        if (articleCountBtn) {
            articleCountBtn.addEventListener('click', () => this.showArticleCountModal());
        }
        
        // Search
        const searchInput = document.getElementById('admin-search-articles');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value;
                this.debounceSearch();
            });
        }
        
        // Category filter
        const categoryFilter = document.getElementById('admin-filter-category');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.filterCategory = e.target.value;
                this.performSearch();
            });
        }
        
        // Select all
        const selectAll = document.getElementById('admin-select-all');
        if (selectAll) {
            selectAll.addEventListener('change', (e) => this.toggleSelectAll(e.target.checked));
        }
        
        // Bulk delete
        const bulkDeleteBtn = document.getElementById('admin-bulk-delete-btn');
        if (bulkDeleteBtn) {
            bulkDeleteBtn.addEventListener('click', () => this.bulkDeleteArticles());
        }
        
        // Modal events
        this.setupModalEvents();
    }
    
    setupModalEvents() {
        // Article count modal
        const countModal = document.getElementById('admin-article-count-modal');
        const closeCountBtn = document.getElementById('admin-close-count-modal');
        const closeCountBtnAlt = document.getElementById('admin-close-count-modal-btn');
        
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
        
        // Edit article modal
        const modal = document.getElementById('admin-edit-article-modal');
        const closeBtn = document.getElementById('admin-close-edit-modal');
        const cancelBtn = document.getElementById('admin-cancel-edit-btn');
        const form = document.getElementById('admin-edit-article-form');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideEditModal());
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hideEditModal());
        }
        
        if (form) {
            form.addEventListener('submit', (e) => this.handleEditSubmit(e));
        }
    }
    
    render() {
        this.renderCategoryFilter();
        this.renderArticlesTable();
        this.updateBulkActions();
    }
    
    renderCategoryFilter() {
        const categoryFilter = document.getElementById('admin-filter-category');
        if (categoryFilter) {
            categoryFilter.innerHTML = `
                <option value="">All Categories</option>
                ${this.categories.map(category => `
                    <option value="${category.name}" ${this.filterCategory === category.name ? 'selected' : ''}>
                        ${category.name}
                    </option>
                `).join('')}
            `;
        }
    }
    
    renderArticlesTable() {
        const tbody = document.getElementById('admin-articles-tbody');
        if (!tbody) return;
        
        if (this.articles.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                        No articles found
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = this.articles.map(article => {
            const isSelected = this.selectedArticles.has(article.id);
            return `
                <tr class="${isSelected ? 'bg-blue-50 dark:bg-blue-900' : ''}">
                    <td class="px-6 py-4 whitespace-nowrap">
                        <input type="checkbox" ${isSelected ? 'checked' : ''} 
                               onchange="adminManageArticlesController.toggleArticleSelection(${article.id})" 
                               class="rounded">
                    </td>
                    <td class="px-6 py-4">
                        <div class="text-sm font-medium text-gray-900 dark:text-white">${article.title}</div>
                        <div class="text-sm text-gray-500 dark:text-gray-400">${article.content.substring(0, 100)}...</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        ${article.author || 'Anonymous'}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            ${article.category || 'General'}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        ${this.formatDate(article.created_at)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div class="flex space-x-2">
                            <button onclick="adminManageArticlesController.editArticle(${article.id})" 
                                    class="text-blue-600 hover:text-blue-900" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="adminManageArticlesController.deleteArticle(${article.id})" 
                                    class="text-red-600 hover:text-red-900" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }
    
    toggleArticleSelection(id) {
        if (this.selectedArticles.has(id)) {
            this.selectedArticles.delete(id);
        } else {
            this.selectedArticles.add(id);
        }
        this.updateBulkActions();
        this.renderArticlesTable();
    }
    
    toggleSelectAll(checked) {
        if (checked) {
            this.articles.forEach(article => this.selectedArticles.add(article.id));
        } else {
            this.selectedArticles.clear();
        }
        this.updateBulkActions();
        this.renderArticlesTable();
    }
    
    updateBulkActions() {
        const bulkDeleteBtn = document.getElementById('admin-bulk-delete-btn');
        if (bulkDeleteBtn) {
            if (this.selectedArticles.size > 0) {
                bulkDeleteBtn.classList.remove('hidden');
                bulkDeleteBtn.innerHTML = `<i class="fas fa-trash mr-2"></i>Delete Selected (${this.selectedArticles.size})`;
            } else {
                bulkDeleteBtn.classList.add('hidden');
            }
        }
    }
    
    async editArticle(id) {
        try {
            const response = await apiService.getArticle(id);
            this.editingArticle = response.data;
            this.showEditModal();
        } catch (error) {
            window.app.toast.error('Failed to load article for editing');
        }
    }
    
    showEditModal() {
        if (!this.editingArticle) return;
        
        document.getElementById('admin-edit-article-id').value = this.editingArticle.id;
        document.getElementById('admin-edit-article-title').value = this.editingArticle.title;
        document.getElementById('admin-edit-article-author').value = this.editingArticle.author || '';
        document.getElementById('admin-edit-article-content').value = this.editingArticle.content;
        
        // Populate categories
        const categorySelect = document.getElementById('admin-edit-article-category');
        categorySelect.innerHTML = this.categories.map(category => `
            <option value="${category.name}" ${this.editingArticle.category === category.name ? 'selected' : ''}>
                ${category.name}
            </option>
        `).join('');
        
        document.getElementById('admin-edit-article-modal').classList.remove('hidden');
    }
    
    hideEditModal() {
        document.getElementById('admin-edit-article-modal').classList.add('hidden');
        this.editingArticle = null;
    }
    
    async handleEditSubmit(e) {
        e.preventDefault();
        
        const formData = {
            title: document.getElementById('admin-edit-article-title').value,
            author: document.getElementById('admin-edit-article-author').value,
            category: document.getElementById('admin-edit-article-category').value,
            content: document.getElementById('admin-edit-article-content').value,
        };
        
        try {
            const id = document.getElementById('admin-edit-article-id').value;
            await apiService.updateArticle(id, formData);
            window.app.toast.success('Article updated successfully');
            this.hideEditModal();
            await this.loadData();
            this.render();
        } catch (error) {
            window.app.toast.error('Failed to update article');
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
            await this.loadData();
            this.render();
        } catch (error) {
            window.app.toast.error('Failed to delete some articles');
        }
    }
    
    debounceSearch() {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.performSearch();
        }, 500);
    }
    
    async performSearch() {
        if (!this.searchTerm && !this.filterCategory) {
            await this.loadData();
        } else {
            try {
                const response = await apiService.searchArticles(this.searchTerm, this.filterCategory);
                this.articles = response.data || [];
            } catch (error) {
                window.app.toast.error('Search failed');
            }
        }
        this.render();
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
        const modal = document.getElementById('admin-article-count-modal');
        if (!modal) return;
        
        modal.classList.remove('hidden');
        
        try {
            // Get total count by fetching all articles
            const response = await apiService.getArticles(1, 1000);
            const totalCount = response.data ? response.data.length : 0;
            
            const displayElement = document.getElementById('admin-article-count-display');
            const statsElement = document.getElementById('admin-article-stats');
            
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
        const modal = document.getElementById('admin-article-count-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }
}

const adminManageArticlesController = new AdminManageArticlesController();
window.adminManageArticlesController = adminManageArticlesController;