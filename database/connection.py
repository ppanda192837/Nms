"""
Database connection and initialization
"""
import sqlite3
import os
from datetime import datetime
from typing import Optional

class DatabaseConnection:
    _instance: Optional['DatabaseConnection'] = None
    _connection: Optional[sqlite3.Connection] = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def connect(self, db_path: str = None):
        """Connect to database"""
        if not db_path:
            db_path = os.path.join(os.path.dirname(__file__), '..', 'backend', 'news.db')
        
        self._connection = sqlite3.connect(db_path, check_same_thread=False)
        self._connection.row_factory = sqlite3.Row
        return self._connection
    
    def get_connection(self) -> sqlite3.Connection:
        """Get current connection"""
        if not self._connection:
            self.connect()
        return self._connection
    
    def close(self):
        """Close connection"""
        if self._connection:
            self._connection.close()
            self._connection = None

# Global instance
db_connection = DatabaseConnection()

def init_db():
    """Initialize database with tables"""
    conn = db_connection.get_connection()
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
    
    # Insert default categories if none exist
    cursor.execute('SELECT COUNT(*) FROM categories')
    if cursor.fetchone()[0] == 0:
        default_categories = [
            ('General', 'General news and updates'),
            ('Technology', 'Technology and innovation news'),
            ('Business', 'Business and finance news'),
            ('Sports', 'Sports news and updates'),
            ('Health', 'Health and wellness news')
        ]
        
        for name, description in default_categories:
            cursor.execute('''
                INSERT INTO categories (name, description, created_at)
                VALUES (?, ?, ?)
            ''', (name, description, datetime.now()))
    
    conn.commit()

def close_db():
    """Close database connection"""
    db_connection.close()