#!/usr/bin/env python3
"""
Database Basic Tests - Test database operations
"""
import sys
import os
import sqlite3
from datetime import datetime

# Add parent directory to path to import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.connection import init_db, close_db, db_connection
from database.queries import ArticleQueries, CategoryQueries, MediaQueries

class DatabaseBasicTest:
    def __init__(self):
        self.test_db_path = 'test_news.db'
        
    def setup(self):
        """Setup test database"""
        try:
            # Use test database
            db_connection.connect(self.test_db_path)
            init_db()
            print("✓ Test database setup completed")
            return True
        except Exception as e:
            print(f"✗ Database setup failed: {e}")
            return False
    
    def test_article_operations(self):
        """Test article CRUD operations"""
        try:
            # Create article
            article_data = {
                'title': 'Test Article',
                'content': 'This is test content',
                'author': 'Test Author',
                'category': 'Test Category'
            }
            
            article_id = ArticleQueries.create_article(article_data)
            assert article_id is not None
            print("✓ Article creation passed")
            
            # Read article
            article = ArticleQueries.get_article_by_id(article_id)
            assert article is not None
            assert article['title'] == 'Test Article'
            print("✓ Article read passed")
            
            # Update article
            updated_data = {
                'title': 'Updated Test Article',
                'content': 'Updated content',
                'author': 'Updated Author',
                'category': 'Updated Category'
            }
            
            success = ArticleQueries.update_article(article_id, updated_data)
            assert success == True
            
            # Verify update
            updated_article = ArticleQueries.get_article_by_id(article_id)
            assert updated_article['title'] == 'Updated Test Article'
            print("✓ Article update passed")
            
            # Delete article
            success = ArticleQueries.delete_article(article_id)
            assert success == True
            
            # Verify deletion
            deleted_article = ArticleQueries.get_article_by_id(article_id)
            assert deleted_article is None
            print("✓ Article deletion passed")
            
            return True
            
        except Exception as e:
            print(f"✗ Article operations failed: {e}")
            return False
    
    def test_category_operations(self):
        """Test category CRUD operations"""
        try:
            # Create category
            category_data = {
                'name': 'Test Category',
                'description': 'Test description'
            }
            
            category_id = CategoryQueries.create_category(category_data)
            assert category_id is not None
            print("✓ Category creation passed")
            
            # Read category
            category = CategoryQueries.get_category_by_id(category_id)
            assert category is not None
            assert category['name'] == 'Test Category'
            print("✓ Category read passed")
            
            # Update category
            updated_data = {
                'name': 'Updated Category',
                'description': 'Updated description'
            }
            
            success = CategoryQueries.update_category(category_id, updated_data)
            assert success == True
            print("✓ Category update passed")
            
            # Delete category
            success = CategoryQueries.delete_category(category_id)
            assert success == True
            print("✓ Category deletion passed")
            
            return True
            
        except Exception as e:
            print(f"✗ Category operations failed: {e}")
            return False
    
    def test_media_operations(self):
        """Test media operations"""
        try:
            # Create media
            media_data = {
                'filename': 'test.jpg',
                'filepath': '/uploads/test.jpg',
                'mime_type': 'image/jpeg',
                'size': 1024
            }
            
            media_id = MediaQueries.create_media(media_data)
            assert media_id is not None
            print("✓ Media creation passed")
            
            # Get all media
            media_list = MediaQueries.get_all_media()
            assert len(media_list) > 0
            print("✓ Media retrieval passed")
            
            # Delete media
            success = MediaQueries.delete_media(media_id)
            assert success == True
            print("✓ Media deletion passed")
            
            return True
            
        except Exception as e:
            print(f"✗ Media operations failed: {e}")
            return False
    
    def test_search_operations(self):
        """Test search functionality"""
        try:
            # Create test articles
            articles = [
                {
                    'title': 'Python Programming',
                    'content': 'Learn Python programming',
                    'author': 'John Doe',
                    'category': 'Technology'
                },
                {
                    'title': 'Web Development',
                    'content': 'Modern web development techniques',
                    'author': 'Jane Smith',
                    'category': 'Technology'
                }
            ]
            
            article_ids = []
            for article in articles:
                article_id = ArticleQueries.create_article(article)
                article_ids.append(article_id)
            
            # Test search
            results = ArticleQueries.search_articles('Python')
            assert len(results) >= 1
            print("✓ Article search passed")
            
            # Test category filter
            results = ArticleQueries.get_articles_by_category('Technology')
            assert len(results) >= 2
            print("✓ Category filter passed")
            
            # Cleanup
            for article_id in article_ids:
                ArticleQueries.delete_article(article_id)
            
            return True
            
        except Exception as e:
            print(f"✗ Search operations failed: {e}")
            return False
    
    def test_statistics(self):
        """Test statistics functionality"""
        try:
            stats = ArticleQueries.get_statistics()
            assert 'total_articles' in stats
            assert 'total_categories' in stats
            assert 'total_authors' in stats
            print("✓ Statistics retrieval passed")
            return True
            
        except Exception as e:
            print(f"✗ Statistics test failed: {e}")
            return False
    
    def cleanup(self):
        """Clean up test database"""
        try:
            close_db()
            if os.path.exists(self.test_db_path):
                os.remove(self.test_db_path)
            print("✓ Test database cleaned up")
        except Exception as e:
            print(f"✗ Cleanup failed: {e}")
    
    def run_all_tests(self):
        """Run all database tests"""
        print("Running Database Basic Tests...")
        print("-" * 40)
        
        if not self.setup():
            return False
        
        tests = [
            self.test_article_operations,
            self.test_category_operations,
            self.test_media_operations,
            self.test_search_operations,
            self.test_statistics
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            if test():
                passed += 1
        
        print("-" * 40)
        print(f"Results: {passed}/{total} tests passed")
        
        # Cleanup
        self.cleanup()
        
        return passed == total

if __name__ == '__main__':
    tester = DatabaseBasicTest()
    success = tester.run_all_tests()
    
    sys.exit(0 if success else 1)