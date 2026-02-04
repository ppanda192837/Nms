"""
Database Media Management - Additional media operations
"""
from database.connection import db_connection
import os

class MediaManager:
    @staticmethod
    def cleanup_orphaned_files(upload_dir: str):
        """Remove files that exist on disk but not in database"""
        try:
            conn = db_connection.get_connection()
            cursor = conn.cursor()
            
            # Get all media files from database
            cursor.execute('SELECT filepath FROM media')
            db_files = {row[0] for row in cursor.fetchall()}
            
            # Get all files from upload directory
            if os.path.exists(upload_dir):
                disk_files = set()
                for filename in os.listdir(upload_dir):
                    filepath = f"/uploads/{filename}"
                    disk_files.add(filepath)
                
                # Find orphaned files
                orphaned = disk_files - db_files
                
                # Remove orphaned files
                for filepath in orphaned:
                    full_path = os.path.join(upload_dir, os.path.basename(filepath))
                    if os.path.exists(full_path):
                        os.remove(full_path)
                
                return len(orphaned)
            
            return 0
            
        except Exception as e:
            print(f"Error cleaning up orphaned files: {e}")
            return 0
    
    @staticmethod
    def get_storage_stats(upload_dir: str) -> dict:
        """Get storage statistics"""
        try:
            conn = db_connection.get_connection()
            cursor = conn.cursor()
            
            # Get total size from database
            cursor.execute('SELECT COUNT(*), SUM(size) FROM media')
            count, total_size = cursor.fetchone()
            
            # Get disk usage
            disk_usage = 0
            if os.path.exists(upload_dir):
                for filename in os.listdir(upload_dir):
                    filepath = os.path.join(upload_dir, filename)
                    if os.path.isfile(filepath):
                        disk_usage += os.path.getsize(filepath)
            
            return {
                'file_count': count or 0,
                'total_size': total_size or 0,
                'disk_usage': disk_usage
            }
            
        except Exception as e:
            print(f"Error getting storage stats: {e}")
            return {'file_count': 0, 'total_size': 0, 'disk_usage': 0}