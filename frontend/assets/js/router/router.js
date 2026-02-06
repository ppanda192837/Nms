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
    
    async navigate(page, pushState = true) {
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
            
            // Update browser history
            if (pushState && page !== this.currentPage) {
                history.pushState({ page }, '', `#${page}`);
            }
            
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
            console.log('Loading controller for page:', page, 'Controller name:', controllerName);
            
            if (controllerName && window[controllerName]) {
                console.log('Controller found:', controllerName);
                if (typeof window[controllerName].init === 'function') {
                    console.log('Calling controller init()');
                    await window[controllerName].init();
                }
            } else {
                console.warn('Controller not found:', controllerName);
            }
            
            // Reinitialize theme button after page load
            this.initThemeButton();
        } catch (error) {
            console.error('Controller loading error:', error);
        }
    }
    
    initThemeButton() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle && window.app) {
            // Remove existing listeners to prevent duplicates
            themeToggle.replaceWith(themeToggle.cloneNode(true));
            const newThemeToggle = document.getElementById('theme-toggle');
            
            newThemeToggle.addEventListener('click', () => {
                window.app.theme.toggle();
            });
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
    
    back() {
        // Navigate to admin page if coming from admin sub-pages
        if (this.currentPage && this.currentPage.startsWith('admin-')) {
            this.navigate('admin');
        } else {
            // Default back to home
            this.navigate('home');
        }
    }
    
    init() {
        // Handle browser back/forward buttons
        window.addEventListener('popstate', (e) => {
            const page = e.state?.page || this.getPageFromHash() || 'home';
            this.navigate(page, false);
        });
        
        // Handle initial page load from hash
        const initialPage = this.getPageFromHash() || 'home';
        if (initialPage !== 'home') {
            this.navigate(initialPage);
        }
    }
    
    getPageFromHash() {
        const hash = window.location.hash.substring(1);
        return this.routes.has(hash) ? hash : null;
    }
}