/**
 * Categories Controller
 */

class CategoriesController {
    constructor() {
        this.categories = [];
        this.filteredCategories = [];
        this.searchTerm = '';
        this.sortBy = 'name';
        this.editingCategory = null;
    }
    
    async init() {
        try {
            await this.loadCategories();
            this.setupEventListeners();
            this.render();
        } catch (error) {
            console.error('Categories controller error:', error);
            window.app.toast.error('Failed to load categories');
        }
    }
    
    async loadCategories() {
        const response = await apiService.getCategories();
        this.categories = response.data || [];
    }
    
    setupEventListeners() {
        // Create category button
        const createBtn = document.getElementById('create-category-btn');
        if (createBtn) {
            createBtn.addEventListener('click', () => this.showCategoryModal());
        }
        
        // Search and sort
        const searchInput = document.getElementById('category-search');
        const sortSelect = document.getElementById('category-sort');
        const exportBtn = document.getElementById('export-categories-btn');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value;
                this.filterAndRender();
            });
        }
        
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortBy = e.target.value;
                this.filterAndRender();
            });
        }
        
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportCategories());
        }
        
        // Modal events
        this.setupModalEvents();
    }
    
    setupModalEvents() {
        const modal = document.getElementById('category-modal');
        const closeBtn = document.getElementById('close-category-modal');
        const cancelBtn = document.getElementById('cancel-category-btn');
        const form = document.getElementById('category-form');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideCategoryModal());
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hideCategoryModal());
        }
        
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
        
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideCategoryModal();
                }
            });
        }
    }
    
    render() {
        this.filterAndRender();
    }
    
    filterAndRender() {
        // Filter categories
        this.filteredCategories = this.categories.filter(category => {
            if (!this.searchTerm) return true;
            return category.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                   (category.description && category.description.toLowerCase().includes(this.searchTerm.toLowerCase()));
        });
        
        // Sort categories
        this.filteredCategories.sort((a, b) => {
            switch (this.sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'created_at':
                    return new Date(b.created_at) - new Date(a.created_at);
                case 'article_count':
                    return (b.article_count || 0) - (a.article_count || 0);
                default:
                    return 0;
            }
        });
        
        this.renderCategories();
    }
    
    renderCategories() {
        const container = document.getElementById('categories-container');
        if (!container) return;
        
        if (this.filteredCategories.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <i class="fas fa-tags text-4xl text-gray-400 mb-4"></i>
                    <p class="text-gray-600">${this.searchTerm ? 'No categories match your search' : 'No categories found'}</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.filteredCategories.map(category => `
            <div class="bg-gray-50 rounded-lg shadow p-6 card">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex-1">
                        <h3 class="text-lg font-semibold text-gray-900 mb-2">
                            ${category.name}
                        </h3>
                        <p class="text-gray-700 text-sm">
                            ${category.description || 'No description'}
                        </p>
                    </div>
                    <div class="flex space-x-2">
                        <button onclick="categoriesController.viewCategoryArticles(${category.id})" 
                                class="text-green-600 hover:text-green-800 p-1" title="View Articles">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button onclick="categoriesController.editCategory(${category.id})" 
                                class="text-blue-600 hover:text-blue-800 p-1" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="categoriesController.duplicateCategory(${category.id})" 
                                class="text-yellow-600 hover:text-yellow-800 p-1" title="Duplicate">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button onclick="categoriesController.deleteCategory(${category.id})" 
                                class="text-red-600 hover:text-red-800 p-1" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="flex items-center justify-between text-sm text-gray-600">
                    <span>Created: ${this.formatDate(category.created_at)}</span>
                    <span class="bg-gray-200 px-2 py-1 rounded">
                        ${category.article_count || 0} articles
                    </span>
                </div>
            </div>
        `).join('');
    }
    
    showCategoryModal(category = null) {
        this.editingCategory = category;
        const modal = document.getElementById('category-modal');
        const title = document.getElementById('category-modal-title');
        const form = document.getElementById('category-form');
        
        if (category) {
            title.textContent = 'Edit Category';
            document.getElementById('category-name').value = category.name;
            document.getElementById('category-description').value = category.description || '';
        } else {
            title.textContent = 'Create Category';
            form.reset();
        }
        
        modal.classList.remove('hidden');
    }
    
    hideCategoryModal() {
        const modal = document.getElementById('category-modal');
        modal.classList.add('hidden');
        this.editingCategory = null;
    }
    
    async handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('category-name').value,
            description: document.getElementById('category-description').value,
        };
        
        try {
            if (this.editingCategory) {
                await apiService.updateCategory(this.editingCategory.id, formData);
                window.app.toast.success('Category updated successfully');
            } else {
                await apiService.createCategory(formData);
                window.app.toast.success('Category created successfully');
            }
            
            this.hideCategoryModal();
            await this.loadCategories();
            this.render();
            
        } catch (error) {
            window.app.toast.error('Failed to save category');
        }
    }
    
    async editCategory(id) {
        const category = this.categories.find(c => c.id === id);
        if (category) {
            this.showCategoryModal(category);
        }
    }
    
    async deleteCategory(id) {
        if (!confirm('Are you sure you want to delete this category?')) return;
        
        try {
            await apiService.deleteCategory(id);
            window.app.toast.success('Category deleted successfully');
            await this.loadCategories();
            this.render();
        } catch (error) {
            window.app.toast.error('Failed to delete category');
        }
    }
    
    
    async viewCategoryArticles(id) {
        const category = this.categories.find(c => c.id === id);
        if (!category) return;
        
        try {
            const response = await apiService.searchArticles('', category.name);
            const articles = response.data || [];
            
            // Create articles view modal
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
            modal.innerHTML = `
                <div class="bg-gray-50 p-6 rounded-lg w-full max-w-4xl max-h-screen overflow-y-auto">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-2xl font-bold text-gray-900">Articles in "${category.name}"</h2>
                        <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                                class="text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    <div class="space-y-4">
                        ${articles.length === 0 ? 
                            '<p class="text-gray-600 text-center py-8">No articles in this category</p>' :
                            articles.map(article => `
                                <div class="border border-gray-300 rounded-lg p-4">
                                    <h3 class="font-semibold text-gray-900 mb-2">${article.title}</h3>
                                    <p class="text-gray-700 text-sm mb-2">${article.content.substring(0, 150)}...</p>
                                    <p class="text-xs text-gray-600">By ${article.author || 'Anonymous'} • ${this.formatDate(article.created_at)}</p>
                                </div>
                            `).join('')
                        }
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
        } catch (error) {
            window.app.toast.error('Failed to load category articles');
        }
    }
    
    async duplicateCategory(id) {
        const category = this.categories.find(c => c.id === id);
        if (!category) return;
        
        try {
            const duplicatedCategory = {
                name: `Copy of ${category.name}`,
                description: category.description
            };
            
            await apiService.createCategory(duplicatedCategory);
            window.app.toast.success('Category duplicated successfully');
            await this.loadCategories();
            this.render();
        } catch (error) {
            window.app.toast.error('Failed to duplicate category');
        }
    }
    
    exportCategories() {
        const exportData = this.categories.map(category => ({
            id: category.id,
            name: category.name,
            description: category.description,
            article_count: category.article_count || 0,
            created_at: category.created_at
        }));
        
        ExportUtil.downloadJSON(exportData, `categories-export-${new Date().toISOString().split('T')[0]}.json`);
        window.app.toast.success('Categories exported successfully');
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

const categoriesController = new CategoriesController();
window.categoriesController = categoriesController;