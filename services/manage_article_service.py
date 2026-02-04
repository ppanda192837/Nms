"""
Manage Article Service - Business logic for article management
"""
from database.queries import ArticleQueries

class ManageArticleService:
    @staticmethod
    def get_paginated_articles(page: int, limit: int) -> dict:
        """Get paginated articles"""
        offset = (page - 1) * limit
        articles = ArticleQueries.get_articles_paginated(limit, offset)
        total_count = ArticleQueries.get_articles_count()
        
        return {
            'data': articles,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total_count,
                'pages': (total_count + limit - 1) // limit
            }
        }
    
    @staticmethod
    def get_article_by_id(article_id: int) -> dict:
        """Get article by ID"""
        return ArticleQueries.get_article_by_id(article_id)
    
    @staticmethod
    def update_article(article_id: int, article_data: dict) -> bool:
        """Update article"""
        if not article_data.get('title'):
            raise ValueError('Title is required')
        if not article_data.get('content'):
            raise ValueError('Content is required')
        
        return ArticleQueries.update_article(article_id, article_data)
    
    @staticmethod
    def delete_article(article_id: int) -> bool:
        """Delete article"""
        return ArticleQueries.delete_article(article_id)
    
    @staticmethod
    def search_articles(search_term: str, category: str = None) -> list:
        """Search articles"""
        if search_term:
            return ArticleQueries.search_articles(search_term)
        elif category:
            return ArticleQueries.get_articles_by_category(category)
        return []
    
    @staticmethod
    def get_featured_articles(limit: int) -> list:
        """Get featured articles"""
        return ArticleQueries.get_latest_articles(limit)
    
    @staticmethod
    def get_latest_articles(limit: int) -> list:
        """Get latest articles"""
        return ArticleQueries.get_latest_articles(limit)
    
    @staticmethod
    def get_statistics() -> dict:
        """Get article statistics"""
        return ArticleQueries.get_statistics()