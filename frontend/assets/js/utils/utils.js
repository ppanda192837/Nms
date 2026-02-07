/**
 * Toast Notification Manager
 */

class ToastManager {
    constructor() {
        this.container = this.createContainer();
    }
    
    createContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'fixed top-4 right-4 z-50 space-y-2';
        document.body.appendChild(container);
        return container;
    }
    
    show(message, type = 'info', duration = 5000) {
        const toast = this.createToast(message, type);
        this.container.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Auto remove
        setTimeout(() => this.remove(toast), duration);
        
        return toast;
    }
    
    createToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast ${type} transform translate-x-full transition-transform duration-300 ease-in-out`;
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        toast.innerHTML = `
            <div class="flex items-center">
                <i class="${icons[type]} mr-3"></i>
                <span class="flex-1">${message}</span>
                <button class="ml-4 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        return toast;
    }
    
    remove(toast) {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }
    
    success(message, duration) {
        return this.show(message, 'success', duration);
    }
    
    error(message, duration) {
        return this.show(message, 'error', duration);
    }
    
    warning(message, duration) {
        return this.show(message, 'warning', duration);
    }
    
    info(message, duration) {
        return this.show(message, 'info', duration);
    }
}

/**
 * Skeleton Loading Utility
 */

class SkeletonLoader {
    static createArticleCard() {
        return `
            <div class="bg-white rounded-lg shadow p-6 animate-pulse">
                <div class="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                <div class="h-3 bg-gray-300 rounded w-1/2 mb-2"></div>
                <div class="h-3 bg-gray-300 rounded w-full mb-2"></div>
                <div class="h-3 bg-gray-300 rounded w-2/3 mb-4"></div>
                <div class="flex justify-between items-center">
                    <div class="h-3 bg-gray-300 rounded w-1/4"></div>
                    <div class="h-6 bg-gray-300 rounded w-16"></div>
                </div>
            </div>
        `;
    }
    
    static createStatCard() {
        return `
            <div class="bg-white rounded-lg shadow p-6 animate-pulse">
                <div class="flex items-center">
                    <div class="w-12 h-12 bg-gray-300 rounded-lg mr-4"></div>
                    <div class="flex-1">
                        <div class="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                        <div class="h-6 bg-gray-300 rounded w-1/2"></div>
                    </div>
                </div>
            </div>
        `;
    }
    
    static createListItem() {
        return `
            <div class="bg-white rounded-lg shadow p-4 animate-pulse">
                <div class="flex items-center space-x-4">
                    <div class="w-10 h-10 bg-gray-300 rounded-full"></div>
                    <div class="flex-1">
                        <div class="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                        <div class="h-3 bg-gray-300 rounded w-1/2"></div>
                    </div>
                </div>
            </div>
        `;
    }
}

/**
 * Export Utility
 */

class ExportUtil {
    static downloadJSON(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        this.downloadBlob(blob, filename);
    }
    
    static downloadCSV(data, filename) {
        if (!data.length) return;
        
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        this.downloadBlob(blob, filename);
    }
    
    static downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

/**
 * Scroll Behavior Manager
 */
class ScrollManager {
    static init() {
        this.initBackToTop();
        this.initModalScrollLock();
    }

    static initBackToTop() {
        // Create back-to-top button
        const backToTopBtn = document.createElement('button');
        backToTopBtn.className = 'back-to-top';
        backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
        backToTopBtn.setAttribute('title', 'Back to top');
        document.body.appendChild(backToTopBtn);

        // Show/hide button on scroll
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });

        // Scroll to top on click
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    static initModalScrollLock() {
        // Monitor for modal visibility
        const observer = new MutationObserver(() => {
            const hasVisibleModal = document.querySelector('.modal-overlay.show, .fixed.inset-0:not(.hidden)');
            if (hasVisibleModal) {
                document.body.classList.add('scroll-lock');
            } else {
                document.body.classList.remove('scroll-lock');
            }
        });

        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['class'],
            subtree: true,
            childList: true
        });
    }

    static scrollToElement(selector, offset = 100) {
        const element = document.querySelector(selector);
        if (element) {
            const topPos = element.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top: topPos, behavior: 'smooth' });
        }
    }

    static scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Initialize scroll manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => ScrollManager.init());