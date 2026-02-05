/**
 * Admin Create Article Controller
 */

class AdminCreateArticleController {
    constructor() {
        this.categories = [];
    }
    
    async init() {
        try {
            await this.loadCategories();
            this.setupEventListeners();
            this.renderCategories();
        } catch (error) {
            console.error('Admin create article controller error:', error);
            window.app.toast.error('Failed to load create article page');
        }
    }
    
    async loadCategories() {
        try {
            const response = await apiService.getCategories();
            this.categories = response.data || [];
        } catch (error) {
            console.error('Failed to load categories:', error);
            this.categories = [];
            window.app.toast.error('Failed to load categories');
        }
    }
    
    setupEventListeners() {
        const form = document.getElementById('admin-create-article-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }
    
    renderCategories() {
        const categorySelect = document.getElementById('admin-article-category');
        if (categorySelect) {
            if (this.categories.length === 0) {
                categorySelect.innerHTML = '<option value="">No categories available</option>';
            } else {
                categorySelect.innerHTML = `
                    <option value="">Select a category...</option>
                    ${this.categories.map(category => `
                        <option value="${category.name}">${category.name}</option>
                    `).join('')}
                `;
            }
        }
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        const formData = {
            title: document.getElementById('admin-article-title').value,
            author: document.getElementById('admin-article-author').value || 'Admin',
            category: document.getElementById('admin-article-category').value,
            content: document.getElementById('admin-article-content').value,
        };
        
        try {
            await apiService.createArticle(formData);
            window.app.toast.success('Article created successfully');
            
            // Reset form
            document.getElementById('admin-create-article-form').reset();
            
            // Navigate to manage articles
            setTimeout(() => {
                window.app.router.navigate('admin-manage-articles');
            }, 1000);
            
        } catch (error) {
            window.app.toast.error('Failed to create article');
        }
    }
}

const adminCreateArticleController = new AdminCreateArticleController();
window.adminCreateArticleController = adminCreateArticleController;