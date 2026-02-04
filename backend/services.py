"""
Service layer - Business logic for news operations
"""
from typing import List, Optional, Dict, Any
from database import db_manager
from models import News
import math


class NewsService:
    """Service layer for news operations"""
    
    @staticmethod
    def create_news(news: News) -> int:
        """Create a new news article"""
        is_valid, error = news.validate()
        if not is_valid:
            raise ValueError(error)
        
        query = '''
            INSERT INTO news (title, content, author, category)
            VALUES (?, ?, ?, ?)
        '''
        params = (news.title, news.content, news.author, news.category)
        news_id = db_manager.execute_insert(query, params)
        return news_id
    
    @staticmethod
    def get_news_by_id(news_id: int) -> Optional[News]:
        """Get a news article by ID"""
        query = 'SELECT * FROM news WHERE id = ?'
        result = db_manager.fetch_one(query, (news_id,))
        if result:
            return News.from_dict(result)
        return None
    
    @staticmethod
    def get_all_news(limit: int = None, offset: int = 0) -> List[News]:
        """Get all news articles with optional pagination"""
        query = 'SELECT * FROM news ORDER BY created_at DESC'
        
        if limit:
            query += ' LIMIT ? OFFSET ?'
            results = db_manager.execute_query(query, (limit, offset))
        else:
            results = db_manager.execute_query(query)
        
        return [News.from_dict(row) for row in results]
    
    @staticmethod
    def get_news_count() -> int:
        """Get total count of news articles"""
        query = 'SELECT COUNT(*) as count FROM news'
        result = db_manager.fetch_one(query)
        return result['count'] if result else 0
    
    @staticmethod
    def get_news_by_category(category: str, limit: int = None, offset: int = 0) -> List[News]:
        """Get news articles by category"""
        query = 'SELECT * FROM news WHERE category = ? ORDER BY created_at DESC'
        
        if limit:
            query += ' LIMIT ? OFFSET ?'
            results = db_manager.execute_query(query, (category, limit, offset))
        else:
            results = db_manager.execute_query(query, (category,))
        
        return [News.from_dict(row) for row in results]
    
    @staticmethod
    def search_news(search_term: str, limit: int = None, offset: int = 0) -> List[News]:
        """Search news by title, content, or author"""
        query = '''
            SELECT * FROM news 
            WHERE title LIKE ? OR content LIKE ? OR author LIKE ?
            ORDER BY created_at DESC
        '''
        
        search_param = f'%{search_term}%'
        params = (search_param, search_param, search_param)
        
        if limit:
            query += ' LIMIT ? OFFSET ?'
            results = db_manager.execute_query(query, params + (limit, offset))
        else:
            results = db_manager.execute_query(query, params)
        
        return [News.from_dict(row) for row in results]
    
    @staticmethod
    def update_news(news_id: int, news: News) -> bool:
        """Update a news article"""
        existing = NewsService.get_news_by_id(news_id)
        if not existing:
            return False
        
        is_valid, error = news.validate()
        if not is_valid:
            raise ValueError(error)
        
        query = '''
            UPDATE news 
            SET title = ?, content = ?, author = ?, category = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        '''
        params = (news.title, news.content, news.author, news.category, news_id)
        result = db_manager.execute_update(query, params)
        return result > 0
    
    @staticmethod
    def delete_news(news_id: int) -> bool:
        """Delete a news article"""
        query = 'DELETE FROM news WHERE id = ?'
        result = db_manager.execute_update(query, (news_id,))
        return result > 0
    
    @staticmethod
    def get_paginated_news(page: int = 1, limit: int = 10) -> Dict[str, Any]:
        """Get paginated news articles"""
        if page < 1:
            page = 1
        if limit < 1:
            limit = 10
        
        total = NewsService.get_news_count()
        pages = math.ceil(total / limit)
        offset = (page - 1) * limit
        
        news_list = NewsService.get_all_news(limit, offset)
        
        return {
            'data': [n.to_dict() for n in news_list],
            'pagination': {
                'total': total,
                'page': page,
                'limit': limit,
                'pages': pages
            }
        }
    
    @staticmethod
    def get_statistics() -> Dict[str, Any]:
        """Get news statistics"""
        total = NewsService.get_news_count()
        query = 'SELECT category, COUNT(*) as count FROM news GROUP BY category'
        categories = db_manager.execute_query(query)

        # Include total categories and media counts
        try:
            total_categories = CategoryService.get_category_count()
            total_media = MediaService.get_media_count()
        except Exception:
            # Fallback: compute category count from query or zero
            total_categories = len(categories)
            total_media = 0

        return {
            'total_articles': total,
            'total_categories': total_categories,
            'total_media': total_media,
            'categories': {item['category'] or 'Uncategorized': item['count'] for item in categories}
        }


class CategoryService:
    """Service layer for category operations"""
    
    @staticmethod
    def create_category(category) -> int:
        """Create a new category"""
        is_valid, error = category.validate()
        if not is_valid:
            raise ValueError(error)
        
        # Generate slug from name
        slug = category.name.lower().replace(' ', '-').replace('_', '-')
        
        query = '''
            INSERT INTO categories (name, description, slug)
            VALUES (?, ?, ?)
        '''
        params = (category.name, category.description, slug)
        category_id = db_manager.execute_insert(query, params)
        return category_id
    
    @staticmethod
    def get_category_by_id(category_id: int):
        """Get a category by ID"""
        from models import Category
        query = 'SELECT * FROM categories WHERE id = ?'
        result = db_manager.fetch_one(query, (category_id,))
        if result:
            return Category.from_dict(result)
        return None
    
    @staticmethod
    def get_all_categories() -> list:
        """Get all categories"""
        from models import Category
        query = 'SELECT * FROM categories ORDER BY name'
        results = db_manager.execute_query(query)
        return [Category.from_dict(row) for row in results]
    
    @staticmethod
    def update_category(category_id: int, category) -> bool:
        """Update a category"""
        is_valid, error = category.validate()
        if not is_valid:
            raise ValueError(error)
        
        slug = category.name.lower().replace(' ', '-').replace('_', '-')
        
        query = '''
            UPDATE categories 
            SET name = ?, description = ?, slug = ?
            WHERE id = ?
        '''
        params = (category.name, category.description, slug, category_id)
        result = db_manager.execute_update(query, params)
        return result > 0
    
    @staticmethod
    def delete_category(category_id: int) -> bool:
        """Delete a category"""
        query = 'DELETE FROM categories WHERE id = ?'
        result = db_manager.execute_update(query, (category_id,))
        return result > 0
    
    @staticmethod
    def get_category_count() -> int:
        """Get total number of categories"""
        query = 'SELECT COUNT(*) as count FROM categories'
        result = db_manager.fetch_one(query)
        return result['count'] if result else 0


class MediaService:
    """Service layer for media operations"""
    
    @staticmethod
    def create_media(media) -> int:
        """Create a new media entry"""
        query = '''
            INSERT INTO media (filename, filepath, mime_type, size)
            VALUES (?, ?, ?, ?)
        '''
        params = (media.filename, media.filepath, media.mime_type, media.size)
        media_id = db_manager.execute_insert(query, params)
        return media_id
    
    @staticmethod
    def get_media_by_id(media_id: int):
        """Get media by ID"""
        from models import Media
        query = 'SELECT * FROM media WHERE id = ?'
        result = db_manager.fetch_one(query, (media_id,))
        if result:
            return Media.from_dict(result)
        return None
    
    @staticmethod
    def get_all_media() -> list:
        """Get all media files"""
        from models import Media
        query = 'SELECT * FROM media ORDER BY uploaded_at DESC'
        results = db_manager.execute_query(query)
        return [Media.from_dict(row) for row in results]
    
    @staticmethod
    def delete_media(media_id: int) -> bool:
        """Delete media"""
        # Retrieve filepath first so we can remove the file
        from models import Media
        query = 'SELECT * FROM media WHERE id = ?'
        row = db_manager.fetch_one(query, (media_id,))
        if not row:
            return False

        media = Media.from_dict(row)

        # Delete DB record
        query_del = 'DELETE FROM media WHERE id = ?'
        result = db_manager.execute_update(query_del, (media_id,))

        # Attempt to remove file from disk
        try:
            if media.filepath:
                # filepath stored as web path like /uploads/filename
                # Map to filesystem path under frontend/uploads
                import os
                frontend_root = os.path.join(os.path.dirname(__file__), '..', 'frontend')
                # strip leading slash
                rel = media.filepath.lstrip('/')
                file_abs = os.path.abspath(os.path.join(frontend_root, rel))
                if os.path.exists(file_abs) and os.path.isfile(file_abs):
                    os.remove(file_abs)
        except Exception:
            # ignore file deletion errors, DB record already removed
            pass

        return result > 0
    
    @staticmethod
    def get_media_count() -> int:
        """Get total number of media files"""
        query = 'SELECT COUNT(*) as count FROM media'
        result = db_manager.fetch_one(query)
        return result['count'] if result else 0
