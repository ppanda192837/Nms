"""
Manage Media Service - Business logic for media management
"""
from database.queries import MediaQueries

class ManageMediaService:
    @staticmethod
    def get_all_media() -> list:
        """Get all media"""
        return MediaQueries.get_all_media()
    
    @staticmethod
    def create_media(media_data: dict) -> int:
        """Create media record"""
        if not media_data.get('filename'):
            raise ValueError('Filename is required')
        
        return MediaQueries.create_media(media_data)
    
    @staticmethod
    def delete_media(media_id: int) -> bool:
        """Delete media"""
        return MediaQueries.delete_media(media_id)