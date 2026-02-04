"""
Database layer - SQLite connection management and initialization
"""
import sqlite3
import os
from typing import Optional, List, Dict, Any
from contextlib import contextmanager
import threading

class DatabaseManager:
    """Manages SQLite database connections and operations"""
    
    _instance = None
    _lock = threading.Lock()
    
    def __new__(cls):
        """Singleton pattern for database manager"""
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        """Initialize database manager"""
        if not hasattr(self, 'initialized'):
            self.db_path = os.path.join(os.path.dirname(__file__), 'news.db')
            self.initialized = False
    
    def init_db(self):
        """Initialize database tables"""
        if self.initialized:
            return
        
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                
                # Create news table
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS news (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        title TEXT NOT NULL,
                        content TEXT NOT NULL,
                        author TEXT,
                        category TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                ''')
                
                # Create categories table
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS categories (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        name TEXT NOT NULL UNIQUE,
                        description TEXT,
                        slug TEXT UNIQUE,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                ''')
                
                # Create media table
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS media (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        filename TEXT NOT NULL,
                        filepath TEXT NOT NULL,
                        mime_type TEXT,
                        size INTEGER,
                        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                ''')
                
                # Create index for faster queries
                cursor.execute('''
                    CREATE INDEX IF NOT EXISTS idx_category 
                    ON news(category)
                ''')
                
                cursor.execute('''
                    CREATE INDEX IF NOT EXISTS idx_created_at 
                    ON news(created_at DESC)
                ''')
                
                cursor.execute('''
                    CREATE INDEX IF NOT EXISTS idx_category_slug 
                    ON categories(slug)
                ''')
                
                conn.commit()
                self.initialized = True
        except sqlite3.Error as e:
            raise Exception(f"Database initialization error: {str(e)}")
    
    @contextmanager
    def get_connection(self):
        """Get database connection context manager"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        try:
            yield conn
        finally:
            conn.close()
    
    def execute_query(self, query: str, params: tuple = ()) -> List[Dict[str, Any]]:
        """Execute SELECT query and return results"""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(query, params)
                rows = cursor.fetchall()
                return [dict(row) for row in rows]
        except sqlite3.Error as e:
            raise Exception(f"Query execution error: {str(e)}")
    
    def execute_update(self, query: str, params: tuple = ()) -> int:
        """Execute INSERT/UPDATE/DELETE query and return affected rows"""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(query, params)
                conn.commit()
                return cursor.rowcount
        except sqlite3.Error as e:
            raise Exception(f"Update execution error: {str(e)}")
    
    def execute_insert(self, query: str, params: tuple = ()) -> int:
        """Execute INSERT query and return last inserted ID"""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(query, params)
                conn.commit()
                return cursor.lastrowid
        except sqlite3.Error as e:
            raise Exception(f"Insert execution error: {str(e)}")
    
    def fetch_one(self, query: str, params: tuple = ()) -> Optional[Dict[str, Any]]:
        """Fetch single row"""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(query, params)
                row = cursor.fetchone()
                return dict(row) if row else None
        except sqlite3.Error as e:
            raise Exception(f"Fetch execution error: {str(e)}")
    
    def close(self):
        """Close database connection"""
        self.initialized = False


# Singleton instance
db_manager = DatabaseManager()
