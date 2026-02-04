"""
Manage Category Service - Business logic for category management
"""
from database.queries import CategoryQueries

class ManageCategoryService:
    @staticmethod
    def get_all_categories() -> list:
        """Get all categories"""
        return CategoryQueries.get_all_categories()
    
    @staticmethod
    def create_category(category_data: dict) -> int:
        """Create a new category"""
        if not category_data.get('name'):
            raise ValueError('Category name is required')
        
        category_data.setdefault('description', '')
        return CategoryQueries.create_category(category_data)
    
    @staticmethod
    def get_category_by_id(category_id: int) -> dict:
        """Get category by ID"""
        return CategoryQueries.get_category_by_id(category_id)
    
    @staticmethod
    def update_category(category_id: int, category_data: dict) -> bool:
        """Update category"""
        if not category_data.get('name'):
            raise ValueError('Category name is required')
        
        return CategoryQueries.update_category(category_id, category_data)
    
    @staticmethod
    def delete_category(category_id: int) -> bool:
        """Delete category"""
        return CategoryQueries.delete_category(category_id)