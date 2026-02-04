"""
Database queries for all entities
"""
from database.connection import db_connection
from datetime import datetime

class ArticleQueries:
    @staticmethod
    def create_article(article_data: dict) -> int:
        """Create new article"""
        conn = db_connection.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO news (title, content, author, category, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            article_data['title'],
            article_data['content'],
            article_data['author'],
            article_data['category'],
            datetime.now(),
            datetime.now()
        ))
        
        conn.commit()
        return cursor.lastrowid
    
    @staticmethod
    def get_articles_paginated(limit: int, offset: int) -> list:
        """Get paginated articles"""
        conn = db_connection.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM news 
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?
        ''', (limit, offset))
        
        return [dict(row) for row in cursor.fetchall()]
    
    @staticmethod
    def get_articles_count() -> int:
        """Get total articles count"""
        conn = db_connection.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT COUNT(*) FROM news')
        return cursor.fetchone()[0]
    
    @staticmethod
    def get_article_by_id(article_id: int) -> dict:
        """Get article by ID"""
        conn = db_connection.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM news WHERE id = ?', (article_id,))
        row = cursor.fetchone()
        return dict(row) if row else None
    
    @staticmethod
    def update_article(article_id: int, article_data: dict) -> bool:
        """Update article"""
        conn = db_connection.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE news 
            SET title = ?, content = ?, author = ?, category = ?, updated_at = ?
            WHERE id = ?
        ''', (
            article_data['title'],
            article_data['content'],
            article_data['author'],
            article_data['category'],
            datetime.now(),
            article_id
        ))
        
        conn.commit()
        return cursor.rowcount > 0
    
    @staticmethod
    def delete_article(article_id: int) -> bool:
        """Delete article"""
        conn = db_connection.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('DELETE FROM news WHERE id = ?', (article_id,))
        conn.commit()
        return cursor.rowcount > 0
    
    @staticmethod
    def search_articles(search_term: str) -> list:
        """Search articles"""
        conn = db_connection.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM news 
            WHERE title LIKE ? OR content LIKE ? OR author LIKE ?
            ORDER BY created_at DESC
        ''', (f'%{search_term}%', f'%{search_term}%', f'%{search_term}%'))
        
        return [dict(row) for row in cursor.fetchall()]
    
    @staticmethod
    def get_articles_by_category(category: str) -> list:
        """Get articles by category"""
        conn = db_connection.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM news 
            WHERE category = ?
            ORDER BY created_at DESC
        ''', (category,))
        
        return [dict(row) for row in cursor.fetchall()]
    
    @staticmethod
    def get_latest_articles(limit: int) -> list:
        """Get latest articles"""
        conn = db_connection.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM news 
            ORDER BY created_at DESC 
            LIMIT ?
        ''', (limit,))
        
        return [dict(row) for row in cursor.fetchall()]
    
    @staticmethod
    def get_statistics() -> dict:
        """Get article statistics"""
        conn = db_connection.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT COUNT(*) FROM news')
        total_articles = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(DISTINCT category) FROM news')
        total_categories = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(DISTINCT author) FROM news')
        total_authors = cursor.fetchone()[0]
        
        return {
            'total_articles': total_articles,
            'total_categories': total_categories,
            'total_authors': total_authors
        }

class CategoryQueries:
    @staticmethod
    def get_all_categories() -> list:
        """Get all categories"""
        conn = db_connection.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM categories ORDER BY name')
        return [dict(row) for row in cursor.fetchall()]
    
    @staticmethod
    def create_category(category_data: dict) -> int:
        """Create new category"""
        conn = db_connection.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO categories (name, description, created_at)
            VALUES (?, ?, ?)
        ''', (
            category_data['name'],
            category_data['description'],
            datetime.now()
        ))
        
        conn.commit()
        return cursor.lastrowid
    
    @staticmethod
    def get_category_by_id(category_id: int) -> dict:
        """Get category by ID"""
        conn = db_connection.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM categories WHERE id = ?', (category_id,))
        row = cursor.fetchone()
        return dict(row) if row else None
    
    @staticmethod
    def update_category(category_id: int, category_data: dict) -> bool:
        """Update category"""
        conn = db_connection.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE categories 
            SET name = ?, description = ?
            WHERE id = ?
        ''', (
            category_data['name'],
            category_data['description'],
            category_id
        ))
        
        conn.commit()
        return cursor.rowcount > 0
    
    @staticmethod
    def delete_category(category_id: int) -> bool:
        """Delete category"""
        conn = db_connection.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('DELETE FROM categories WHERE id = ?', (category_id,))
        conn.commit()
        return cursor.rowcount > 0

class MediaQueries:
    @staticmethod
    def get_all_media() -> list:
        """Get all media"""
        conn = db_connection.get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('SELECT * FROM media ORDER BY uploaded_at DESC')
            return [dict(row) for row in cursor.fetchall()]
        except Exception:
            return []
    
    @staticmethod
    def create_media(media_data: dict) -> int:
        """Create media record"""
        conn = db_connection.get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                INSERT INTO media (filename, filepath, mime_type, size, uploaded_at)
                VALUES (?, ?, ?, ?, ?)
            ''', (
                media_data['filename'],
                media_data['filepath'],
                media_data['mime_type'],
                media_data['size'],
                datetime.now()
            ))
            
            conn.commit()
            return cursor.lastrowid
        except Exception:
            return 0
    
    @staticmethod
    def delete_media(media_id: int) -> bool:
        """Delete media"""
        conn = db_connection.get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('DELETE FROM media WHERE id = ?', (media_id,))
            conn.commit()
            return cursor.rowcount > 0
        except Exception:
            return False