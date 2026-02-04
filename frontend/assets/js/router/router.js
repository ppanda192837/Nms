/**
 * Frontend Router
 */

class Router {
    constructor() {
        this.routes = new Map();
        this.currentPage = null;
        this.setupRoutes();
    }
    
    setupRoutes() {
        // Define routes with their controller names
        this.routes.set('home', 'homeController');
        this.routes.set('articles', 'articlesController');
        this.routes.set('latest-news', 'latestNewsController');
        this.routes.set('categories', 'categoriesController');
        this.routes.set('admin', 'adminController');
        this.routes.set('admin-create-article', 'adminCreateArticleController');
        this.routes.set('admin-manage-articles', 'adminManageArticlesController');
        this.routes.set('admin-manage-categories', 'adminManageCategoriesController');
    }
    
    async navigate(page) {
        try {
            // Show loading
            this.showLoading();
            
            // Update navigation
            this.updateNavigation(page);
            
            // Load page template
            const template = await this.loadTemplate(page);
            
            // Render template
            this.renderTemplate(template);
            
            // Load and initialize controller
            await this.loadController(page);
            
            this.currentPage = page;
            
        } catch (error) {
            console.error('Navigation error:', error);
            this.navigate('404');
        } finally {
            this.hideLoading();
        }
    }
    
    async loadTemplate(page) {
        try {
            const response = await fetch(`/pages/${page}.html`);
            if (!response.ok) {
                throw new Error(`Template not found: ${page}`);
            }
            return await response.text();
        } catch (error) {
            console.error('Template loading error:', error);
            return await this.load404Template();
        }
    }
    
    async load404Template() {
        const response = await fetch('/pages/404.html');
        return await response.text();
    }
    
    renderTemplate(template) {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.innerHTML = template;
        }
    }
    
    async loadController(page) {
        try {
            const controllerName = this.routes.get(page);
            if (controllerName && window[controllerName]) {
                if (typeof window[controllerName].init === 'function') {
                    await window[controllerName].init();
                }
            }
        } catch (error) {
            console.error('Controller loading error:', error);
        }
    }
    
    updateNavigation(page) {
        // Remove active class from all nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Add active class to current page link
        const activeLink = document.querySelector(`[data-page="${page}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }
    
    showLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.classList.remove('hidden');
        }
    }
    
    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.classList.add('hidden');
        }
    }
    
    init() {
        // Handle browser back/forward buttons
        window.addEventListener('popstate', (e) => {
            const page = e.state?.page || 'home';
            this.navigate(page);
        });
    }
}