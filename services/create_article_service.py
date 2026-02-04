"""
Create Article Service - Business logic for article creation
"""
from database.queries import ArticleQueries

class CreateArticleService:
    @staticmethod
    def create_article(article_data: dict) -> int:
        """Create a new article"""
        # Validate required fields
        if not article_data.get('title'):
            raise ValueError('Title is required')
        if not article_data.get('content'):
            raise ValueError('Content is required')
        
        # Set defaults
        article_data.setdefault('author', 'Anonymous')
        article_data.setdefault('category', 'General')
        
        return ArticleQueries.create_article(article_data)