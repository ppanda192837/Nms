/**
 * Admin Controller
 */

class AdminController {
    constructor() {
        this.statistics = {};
        this.mediaFiles = [];
    }
    
    async init() {
        try {
            await this.loadData();
            this.setupEventListeners();
            this.render();
        } catch (error) {
            console.error('Admin controller error:', error);
            window.app.toast.error('Failed to load admin data');
        }
    }
    
    async loadData() {
        const [statsResponse, mediaResponse] = await Promise.all([
            apiService.getStatistics(),
            apiService.getMedia()
        ]);
        
        this.statistics = statsResponse.data || {};
        this.mediaFiles = mediaResponse.data || [];
    }
    
    setupEventListeners() {
        // Manage Media button
        const manageMediaBtn = document.getElementById('manage-media-btn');
        if (manageMediaBtn) {
            manageMediaBtn.addEventListener('click', () => this.showMediaModal());
        }
        
        // Media modal
        const closeMediaModal = document.getElementById('close-media-modal');
        if (closeMediaModal) {
            closeMediaModal.addEventListener('click', () => this.hideMediaModal());
        }
        
        // Media upload (support multiple possible element id variants)
        const uploadBtn = document.getElementById('uploadMediaBtn') || document.getElementById('upload-media-btn');
        if (uploadBtn) {
            uploadBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.uploadMedia();
            });
        }
        
        // System actions
        const exportBtn = document.getElementById('export-data-btn');
        const importBtn = document.getElementById('import-data-btn');
        const importFileInput = document.getElementById('import-file-input');
        const clearCacheBtn = document.getElementById('clear-cache-btn');
        const backupBtn = document.getElementById('backup-db-btn');
        const bulkOpsBtn = document.getElementById('bulk-operations-btn');
        const healthBtn = document.getElementById('system-health-btn');
        const refreshActivityBtn = document.getElementById('refresh-activity-btn');
        
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportData());
        }
        
        if (importBtn) {
            importBtn.addEventListener('click', () => importFileInput.click());
        }
        
        if (importFileInput) {
            importFileInput.addEventListener('change', (e) => this.importData(e));
        }
        
        if (clearCacheBtn) {
            clearCacheBtn.addEventListener('click', () => this.clearCache());
        }
        
        if (backupBtn) {
            backupBtn.addEventListener('click', () => this.backupDatabase());
        }
        
        if (bulkOpsBtn) {
            bulkOpsBtn.addEventListener('click', () => this.showBulkOperations());
        }
        
        if (healthBtn) {
            healthBtn.addEventListener('click', () => this.checkSystemHealth());
        }
        
        if (refreshActivityBtn) {
            refreshActivityBtn.addEventListener('click', () => this.refreshActivity());
        }
        
        // Bulk operations modal
        this.setupBulkOperationsModal();
    }
    
    render() {
        this.renderStatistics();
        this.renderMediaFiles();
        this.renderRecentActivity();
        this.updateBulkActions();
    }
    
    updateBulkActions() {
        // Update bulk action button states based on data
        const bulkDeleteBtn = document.getElementById('bulk-delete-articles');
        if (bulkDeleteBtn && this.statistics.total_articles) {
            const oldArticlesCount = Math.floor(this.statistics.total_articles * 0.1); // Estimate
            bulkDeleteBtn.querySelector('p.text-sm').textContent = `Remove ~${oldArticlesCount} old articles`;
        }
    }
    
    renderStatistics() {
        const container = document.getElementById('admin-stats');
        if (!container) return;
        
        const stats = [
            {
                title: 'Total Articles',
                value: this.statistics.total_articles || 0,
                icon: 'fas fa-newspaper',
                color: 'bg-blue-500'
            },
            {
                title: 'Categories',
                value: this.statistics.total_categories || 0,
                icon: 'fas fa-tags',
                color: 'bg-green-500'
            },
            {
                title: 'Authors',
                value: this.statistics.total_authors || 0,
                icon: 'fas fa-users',
                color: 'bg-purple-500'
            },
            {
                title: 'Media Files',
                value: this.mediaFiles.length,
                icon: 'fas fa-images',
                color: 'bg-orange-500'
            }
        ];
        
        container.innerHTML = stats.map(stat => `
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 card">
                <div class="flex items-center">
                    <div class="${stat.color} text-white p-3 rounded-lg mr-4">
                        <i class="${stat.icon} text-xl"></i>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600 dark:text-gray-400">${stat.title}</p>
                        <p class="text-2xl font-bold text-gray-800 dark:text-white">${stat.value}</p>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    renderMediaFiles() {
        const container = document.getElementById('media-list');
        if (!container) return;
        
        if (this.mediaFiles.length === 0) {
            container.innerHTML = `
                <div class="text-center py-4">
                    <p class="text-gray-500 dark:text-gray-400">No media files uploaded</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.mediaFiles.map(file => `
            <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div class="flex items-center space-x-3">
                    <i class="fas fa-file text-gray-400"></i>
                    <div>
                        <p class="text-sm font-medium text-gray-800 dark:text-white">${file.filename}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">
                            ${this.formatFileSize(file.size)} • ${this.formatDate(file.uploaded_at)}
                        </p>
                    </div>
                </div>
                <button onclick="adminController.deleteMedia(${file.id})" 
                        class="text-red-600 hover:text-red-800 p-1">
                    <i class="fas fa-trash text-sm"></i>
                </button>
            </div>
        `).join('');
    }
    
    renderRecentActivity() {
        const container = document.getElementById('recent-activity');
        if (!container) return;
        
        // Mock recent activity data
        const activities = [
            { action: 'Article created', item: 'New Technology Trends', time: '2 minutes ago' },
            { action: 'Category updated', item: 'Technology', time: '15 minutes ago' },
            { action: 'Media uploaded', item: 'image.jpg', time: '1 hour ago' },
            { action: 'Article deleted', item: 'Old News', time: '2 hours ago' },
        ];
        
        container.innerHTML = activities.map(activity => `
            <div class="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                <div>
                    <p class="text-sm text-gray-800 dark:text-white">${activity.action}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">${activity.item}</p>
                </div>
                <span class="text-xs text-gray-500 dark:text-gray-400">${activity.time}</span>
            </div>
        `).join('');
    }
    
    showMediaModal() {
        const modal = document.getElementById('media-management-modal');
        if (modal) {
            modal.classList.remove('hidden');
            // Refresh media list when modal opens
            this.renderMediaFiles();
        }
    }
    
    hideMediaModal() {
        const modal = document.getElementById('media-management-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    async uploadMedia() {
        // Support both `mediaUploadInput` (index.html) and `media-upload` ids
        const fileInput = document.getElementById('mediaUploadInput') || document.getElementById('media-upload');
        const files = fileInput?.files || [];

        if (files.length === 0) {
            window.app.toast.warning('Please select files to upload');
            return;
        }

        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
        }

        try {
            await apiService.uploadMedia(formData);
            window.app.toast.success('Files uploaded successfully');
            if (fileInput) fileInput.value = '';
            await this.loadData();
            this.render();
        } catch (error) {
            window.app.toast.error('Failed to upload files');
        }
    }
    
    async deleteMedia(id) {
        if (!confirm('Are you sure you want to delete this media file?')) return;
        
        try {
            await apiService.deleteMedia(id);
            window.app.toast.success('Media file deleted successfully');
            await this.loadData();
            this.render();
        } catch (error) {
            window.app.toast.error('Failed to delete media file');
        }
    }
    
    async exportData() {
        try {
            const [articlesResponse, categoriesResponse] = await Promise.all([
                apiService.getArticles(1, 1000),
                apiService.getCategories()
            ]);
            
            const exportData = {
                articles: articlesResponse.data || [],
                categories: categoriesResponse.data || [],
                exported_at: new Date().toISOString()
            };
            
            ExportUtil.downloadJSON(exportData, `news-export-${new Date().toISOString().split('T')[0]}.json`);
            window.app.toast.success('Data exported successfully');
        } catch (error) {
            window.app.toast.error('Failed to export data');
        }
    }
    
    clearCache() {
        // Clear localStorage
        localStorage.clear();
        
        // Clear session storage
        sessionStorage.clear();
        
        window.app.toast.success('Cache cleared successfully');
    }
    
    backupDatabase() {
        // This would typically trigger a server-side backup
        window.app.toast.info('Database backup initiated (this is a demo)');
    }
    
    formatFileSize(bytes) {
        if (!bytes) return '0 B';
        
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }
    
    
    setupBulkOperationsModal() {
        const modal = document.getElementById('bulk-operations-modal');
        const closeBtn = document.getElementById('close-bulk-modal');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.classList.add('hidden');
            });
        }
        
        // Bulk operation buttons
        const bulkDeleteBtn = document.getElementById('bulk-delete-articles');
        const bulkUpdateBtn = document.getElementById('bulk-update-categories');
        const bulkExportBtn = document.getElementById('bulk-export-by-date');
        const bulkCleanupBtn = document.getElementById('bulk-cleanup-media');
        
        if (bulkDeleteBtn) {
            bulkDeleteBtn.addEventListener('click', () => this.bulkDeleteOldArticles());
        }
        
        if (bulkUpdateBtn) {
            bulkUpdateBtn.addEventListener('click', () => this.bulkUpdateCategories());
        }
        
        if (bulkExportBtn) {
            bulkExportBtn.addEventListener('click', () => this.bulkExportByDate());
        }
        
        if (bulkCleanupBtn) {
            bulkCleanupBtn.addEventListener('click', () => this.bulkCleanupMedia());
        }
    }
    
    showBulkOperations() {
        const modal = document.getElementById('bulk-operations-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }
    
    async importData(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            if (data.articles && Array.isArray(data.articles)) {
                for (const article of data.articles) {
                    await apiService.createArticle({
                        title: article.title,
                        content: article.content,
                        author: article.author,
                        category: article.category
                    });
                }
            }
            
            if (data.categories && Array.isArray(data.categories)) {
                for (const category of data.categories) {
                    await apiService.createCategory({
                        name: category.name,
                        description: category.description
                    });
                }
            }
            
            window.app.toast.success('Data imported successfully');
            await this.loadData();
            this.render();
        } catch (error) {
            window.app.toast.error('Failed to import data: ' + error.message);
        }
    }
    
    async checkSystemHealth() {
        try {
            const health = await apiService.healthCheck();
            
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
            modal.innerHTML = `
                <div class="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-xl font-bold text-gray-800 dark:text-white">System Health</h2>
                        <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                                class="text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="space-y-3">
                        <div class="flex items-center justify-between">
                            <span class="text-gray-700 dark:text-gray-300">Server Status</span>
                            <span class="text-green-600 font-semibold">
                                <i class="fas fa-check-circle mr-1"></i>Online
                            </span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-gray-700 dark:text-gray-300">Database</span>
                            <span class="text-green-600 font-semibold">
                                <i class="fas fa-check-circle mr-1"></i>Connected
                            </span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-gray-700 dark:text-gray-300">Articles</span>
                            <span class="text-blue-600 font-semibold">${this.statistics.total_articles || 0}</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-gray-700 dark:text-gray-300">Categories</span>
                            <span class="text-blue-600 font-semibold">${this.statistics.total_categories || 0}</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-gray-700 dark:text-gray-300">Media Files</span>
                            <span class="text-blue-600 font-semibold">${this.mediaFiles.length}</span>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
        } catch (error) {
            window.app.toast.error('System health check failed');
        }
    }
    
    async bulkDeleteOldArticles() {
        if (!confirm('This will delete all articles older than 1 year. Are you sure?')) return;
        
        try {
            const response = await apiService.getArticles(1, 1000);
            const articles = response.data || [];
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
            
            const oldArticles = articles.filter(article => 
                new Date(article.created_at) < oneYearAgo
            );
            
            for (const article of oldArticles) {
                await apiService.deleteArticle(article.id);
            }
            
            window.app.toast.success(`Deleted ${oldArticles.length} old articles`);
            await this.loadData();
            this.render();
        } catch (error) {
            window.app.toast.error('Failed to delete old articles');
        }
    }
    
    async bulkUpdateCategories() {
        const oldCategory = prompt('Enter the old category name:');
        const newCategory = prompt('Enter the new category name:');
        
        if (!oldCategory || !newCategory) return;
        
        try {
            const response = await apiService.searchArticles('', oldCategory);
            const articles = response.data || [];
            
            for (const article of articles) {
                await apiService.updateArticle(article.id, {
                    ...article,
                    category: newCategory
                });
            }
            
            window.app.toast.success(`Updated ${articles.length} articles`);
        } catch (error) {
            window.app.toast.error('Failed to update categories');
        }
    }
    
    async bulkExportByDate() {
        const startDate = prompt('Enter start date (YYYY-MM-DD):');
        const endDate = prompt('Enter end date (YYYY-MM-DD):');
        
        if (!startDate || !endDate) return;
        
        try {
            const response = await apiService.getArticles(1, 1000);
            const articles = response.data || [];
            
            const filteredArticles = articles.filter(article => {
                const articleDate = new Date(article.created_at);
                return articleDate >= new Date(startDate) && articleDate <= new Date(endDate);
            });
            
            ExportUtil.downloadJSON(filteredArticles, `articles-${startDate}-to-${endDate}.json`);
            window.app.toast.success(`Exported ${filteredArticles.length} articles`);
        } catch (error) {
            window.app.toast.error('Failed to export articles by date');
        }
    }
    
    async bulkCleanupMedia() {
        if (!confirm('This will remove unused media files. Are you sure?')) return;
        
        try {
            // This would typically call a backend endpoint to cleanup unused media
            window.app.toast.info('Media cleanup initiated (demo)');
        } catch (error) {
            window.app.toast.error('Failed to cleanup media');
        }
    }
    
    async refreshActivity() {
        // Refresh recent activity
        this.renderRecentActivity();
        window.app.toast.success('Activity refreshed');
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

const adminController = new AdminController();
window.adminController = adminController;