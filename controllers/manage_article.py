"""
Manage Article Controller - Handles article management operations
"""
from services.manage_article_service import ManageArticleService
from core.request import parse_json, get_query_param
from core.responses import ApiResponse

class ManageArticleController:
    @staticmethod
    def get_all_articles(query_params: dict = None) -> tuple:
        """GET /api/articles - Get all articles with pagination"""
        try:
            page = int(get_query_param(query_params, 'page', 1))
            limit = int(get_query_param(query_params, 'limit', 10))
            
            result = ManageArticleService.get_paginated_articles(page, limit)
            
            response = ApiResponse(success=True, data=result['data'])
            response_dict = response.to_dict()
            response_dict['pagination'] = result['pagination']
            return (200, response_dict)
            
        except Exception as e:
            response = ApiResponse(success=False, error=str(e))
            return (500, response.to_dict())
    
    @staticmethod
    def get_article(article_id: int, query_params: dict = None) -> tuple:
        """GET /api/articles/{id} - Get specific article"""
        try:
            article = ManageArticleService.get_article_by_id(article_id)
            
            if not article:
                response = ApiResponse(success=False, error='Article not found')
                return (404, response.to_dict())
            
            response = ApiResponse(success=True, data=article)
            return (200, response.to_dict())
            
        except Exception as e:
            response = ApiResponse(success=False, error=str(e))
            return (500, response.to_dict())
    
    @staticmethod
    def update_article(article_id: int, body: bytes, query_params: dict = None) -> tuple:
        """PUT /api/articles/{id} - Update article"""
        try:
            data = parse_json(body)
            
            article_data = {
                'title': data.get('title'),
                'content': data.get('content'),
                'author': data.get('author'),
                'category': data.get('category')
            }
            
            success = ManageArticleService.update_article(article_id, article_data)
            
            if not success:
                response = ApiResponse(success=False, error='Article not found')
                return (404, response.to_dict())
            
            response = ApiResponse(success=True, message='Article updated successfully')
            return (200, response.to_dict())
            
        except ValueError as e:
            response = ApiResponse(success=False, error=str(e))
            return (400, response.to_dict())
        except Exception as e:
            response = ApiResponse(success=False, error=str(e))
            return (500, response.to_dict())
    
    @staticmethod
    def delete_article(article_id: int, query_params: dict = None) -> tuple:
        """DELETE /api/articles/{id} - Delete article"""
        try:
            success = ManageArticleService.delete_article(article_id)
            
            if not success:
                response = ApiResponse(success=False, error='Article not found')
                return (404, response.to_dict())
            
            response = ApiResponse(success=True, message='Article deleted successfully')
            return (200, response.to_dict())
            
        except Exception as e:
            response = ApiResponse(success=False, error=str(e))
            return (500, response.to_dict())
    
    @staticmethod
    def search_articles(query_params: dict = None) -> tuple:
        """GET /api/articles/search - Search articles"""
        try:
            search_term = get_query_param(query_params, 'q', '')
            category = get_query_param(query_params, 'category', None)
            
            if not search_term and not category:
                response = ApiResponse(success=False, error='Search term or category required')
                return (400, response.to_dict())
            
            results = ManageArticleService.search_articles(search_term, category)
            response = ApiResponse(success=True, data=results)
            return (200, response.to_dict())
            
        except Exception as e:
            response = ApiResponse(success=False, error=str(e))
            return (500, response.to_dict())
    
    @staticmethod
    def get_home_data(query_params: dict = None) -> tuple:
        """GET /api/pages/home - Get home page data"""
        try:
            featured_articles = ManageArticleService.get_featured_articles(6)
            stats = ManageArticleService.get_statistics()
            
            data = {
                'featured_articles': featured_articles,
                'statistics': stats
            }
            
            response = ApiResponse(success=True, data=data)
            return (200, response.to_dict())
            
        except Exception as e:
            response = ApiResponse(success=False, error=str(e))
            return (500, response.to_dict())
    
    @staticmethod
    def get_latest_news(query_params: dict = None) -> tuple:
        """GET /api/pages/latest - Get latest news"""
        try:
            limit = int(get_query_param(query_params, 'limit', 20))
            latest_articles = ManageArticleService.get_latest_articles(limit)
            
            data = {'latest_articles': latest_articles}
            response = ApiResponse(success=True, data=data)
            return (200, response.to_dict())
            
        except Exception as e:
            response = ApiResponse(success=False, error=str(e))
            return (500, response.to_dict())
    
    @staticmethod
    def get_statistics(query_params: dict = None) -> tuple:
        """GET /api/statistics - Get statistics"""
        try:
            stats = ManageArticleService.get_statistics()
            response = ApiResponse(success=True, data=stats)
            return (200, response.to_dict())
            
        except Exception as e:
            response = ApiResponse(success=False, error=str(e))
            return (500, response.to_dict())