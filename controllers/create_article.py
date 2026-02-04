"""
Create Article Controller - Handles article creation
"""
from services.create_article_service import CreateArticleService
from core.request import parse_json
from core.responses import ApiResponse

class CreateArticleController:
    @staticmethod
    def create_article(body: bytes, query_params: dict = None) -> tuple:
        """POST /api/articles - Create a new article"""
        try:
            data = parse_json(body)
            
            article_data = {
                'title': data.get('title'),
                'content': data.get('content'),
                'author': data.get('author'),
                'category': data.get('category')
            }
            
            article_id = CreateArticleService.create_article(article_data)
            
            response = ApiResponse(
                success=True,
                data={'id': article_id},
                message='Article created successfully'
            )
            return (201, response.to_dict())
            
        except ValueError as e:
            response = ApiResponse(success=False, error=str(e))
            return (400, response.to_dict())
        except Exception as e:
            response = ApiResponse(success=False, error=str(e))
            return (500, response.to_dict())