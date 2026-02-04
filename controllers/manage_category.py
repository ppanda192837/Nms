"""
Manage Category Controller - Handles category management operations
"""
from services.manage_category_service import ManageCategoryService
from core.request import parse_json
from core.responses import ApiResponse

class ManageCategoryController:
    @staticmethod
    def get_all_categories(query_params: dict = None) -> tuple:
        """GET /api/categories - Get all categories"""
        try:
            categories = ManageCategoryService.get_all_categories()
            response = ApiResponse(success=True, data=categories)
            return (200, response.to_dict())
            
        except Exception as e:
            response = ApiResponse(success=False, error=str(e))
            return (500, response.to_dict())
    
    @staticmethod
    def create_category(body: bytes, query_params: dict = None) -> tuple:
        """POST /api/categories - Create category"""
        try:
            data = parse_json(body)
            
            category_data = {
                'name': data.get('name'),
                'description': data.get('description')
            }
            
            category_id = ManageCategoryService.create_category(category_data)
            response = ApiResponse(success=True, data={'id': category_id}, message='Category created')
            return (201, response.to_dict())
            
        except ValueError as e:
            response = ApiResponse(success=False, error=str(e))
            return (400, response.to_dict())
        except Exception as e:
            response = ApiResponse(success=False, error=str(e))
            return (500, response.to_dict())
    
    @staticmethod
    def get_category(category_id: int, query_params: dict = None) -> tuple:
        """GET /api/categories/{id} - Get specific category"""
        try:
            category = ManageCategoryService.get_category_by_id(category_id)
            
            if not category:
                response = ApiResponse(success=False, error='Category not found')
                return (404, response.to_dict())
            
            response = ApiResponse(success=True, data=category)
            return (200, response.to_dict())
            
        except Exception as e:
            response = ApiResponse(success=False, error=str(e))
            return (500, response.to_dict())
    
    @staticmethod
    def update_category(category_id: int, body: bytes, query_params: dict = None) -> tuple:
        """PUT /api/categories/{id} - Update category"""
        try:
            data = parse_json(body)
            
            category_data = {
                'name': data.get('name'),
                'description': data.get('description')
            }
            
            success = ManageCategoryService.update_category(category_id, category_data)
            
            if not success:
                response = ApiResponse(success=False, error='Category not found')
                return (404, response.to_dict())
            
            response = ApiResponse(success=True, message='Category updated')
            return (200, response.to_dict())
            
        except ValueError as e:
            response = ApiResponse(success=False, error=str(e))
            return (400, response.to_dict())
        except Exception as e:
            response = ApiResponse(success=False, error=str(e))
            return (500, response.to_dict())
    
    @staticmethod
    def delete_category(category_id: int, query_params: dict = None) -> tuple:
        """DELETE /api/categories/{id} - Delete category"""
        try:
            success = ManageCategoryService.delete_category(category_id)
            
            if not success:
                response = ApiResponse(success=False, error='Category not found')
                return (404, response.to_dict())
            
            response = ApiResponse(success=True, message='Category deleted')
            return (200, response.to_dict())
            
        except Exception as e:
            response = ApiResponse(success=False, error=str(e))
            return (500, response.to_dict())