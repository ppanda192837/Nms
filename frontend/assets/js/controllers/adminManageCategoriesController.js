/**
 * Admin Manage Categories Controller
 */

class AdminManageCategoriesController {
    constructor() {
        this.categories = [];
        this.filteredCategories = [];
        this.searchTerm = '';
        this.editingCategory = null;
    }
    
    async init() {
        try {
            await this.loadCategories();
            this.setupEventListeners();
            this.render();
        } catch (error) {
            console.error('Admin manage categories controller error:', error);
            window.app.toast.error('Failed to load manage categories page');
        }
    }
    
    async loadCategories() {
        const response = await apiService.getCategories();
        this.categories = response.data || [];
    }
    
    setupEventListeners() {
        // Create category button
        const createBtn = document.getElementById('admin-create-category-btn');
        if (createBtn) {
            createBtn.addEventListener('click', () => this.showCategoryModal());
        }
        
        // Search
        const searchInput = document.getElementById('admin-search-categories');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value;
                this.filterAndRender();
            });
        }
        
        // Export
        const exportBtn = document.getElementById('admin-export-categories-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportCategories());
        }
        
        // Modal events
        this.setupModalEvents();
    }
    
    setupModalEvents() {
        const modal = document.getElementById('admin-category-modal');
        const closeBtn = document.getElementById('admin-close-category-modal');
        const cancelBtn = document.getElementById('admin-cancel-category-btn');
        const form = document.getElementById('admin-category-form');
        
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
        
        this.renderCategories();
    }
    
    renderCategories() {
        const container = document.getElementById('admin-categories-container');
        if (!container) return;
        
        if (this.filteredCategories.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <i class="fas fa-tags text-4xl text-gray-400 mb-4"></i>
                    <p class="text-gray-600 dark:text-gray-400">${this.searchTerm ? 'No categories match your search' : 'No categories found'}</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.filteredCategories.map(category => `
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 card">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex-1">
                        <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                            ${category.name}
                        </h3>
                        <p class="text-gray-600 dark:text-gray-300 text-sm">
                            ${category.description || 'No description'}
                        </p>
                    </div>
                    <div class="flex space-x-2">
                        <button onclick="adminManageCategoriesController.editCategory(${category.id})" 
                                class="text-blue-600 hover:text-blue-800 p-1" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="adminManageCategoriesController.duplicateCategory(${category.id})" 
                                class="text-yellow-600 hover:text-yellow-800 p-1" title="Duplicate">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button onclick="adminManageCategoriesController.deleteCategory(${category.id})" 
                                class="text-red-600 hover:text-red-800 p-1" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>Created: ${this.formatDate(category.created_at)}</span>
                    <span class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        ${category.article_count || 0} articles
                    </span>
                </div>
            </div>
        `).join('');
    }
    
    showCategoryModal(category = null) {
        this.editingCategory = category;
        const modal = document.getElementById('admin-category-modal');
        const title = document.getElementById('admin-category-modal-title');
        const form = document.getElementById('admin-category-form');
        
        if (category) {
            title.textContent = 'Edit Category';
            document.getElementById('admin-category-id').value = category.id;
            document.getElementById('admin-category-name').value = category.name;
            document.getElementById('admin-category-description').value = category.description || '';
        } else {
            title.textContent = 'Create Category';
            form.reset();
            document.getElementById('admin-category-id').value = '';
        }
        
        modal.classList.remove('hidden');
    }
    
    hideCategoryModal() {
        const modal = document.getElementById('admin-category-modal');
        modal.classList.add('hidden');
        this.editingCategory = null;
    }
    
    async handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('admin-category-name').value,
            description: document.getElementById('admin-category-description').value,
        };
        
        try {
            const categoryId = document.getElementById('admin-category-id').value;
            
            if (categoryId) {
                await apiService.updateCategory(categoryId, formData);
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

const adminManageCategoriesController = new AdminManageCategoriesController();
window.adminManageCategoriesController = adminManageCategoriesController;