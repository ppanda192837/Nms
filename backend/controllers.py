"""
Controllers - HTTP request handlers for news endpoints
"""
from models import News, ApiResponse
from services import NewsService, CategoryService, MediaService
from utils import parse_json, get_query_param
import json


class NewsController:
    """Controller for news-related endpoints"""
    
    @staticmethod
    def create_news(body: bytes, query_params: dict = None) -> tuple:
        """POST /api/news - Create a new news article"""
        try:
            data = parse_json(body)
            
            news = News(
                title=data.get('title'),
                content=data.get('content'),
                author=data.get('author'),
                category=data.get('category')
            )
            
            news_id = NewsService.create_news(news)
            
            response = ApiResponse(
                success=True,
                data={'id': news_id},
                message='News article created successfully'
            )
            return (201, response.to_dict())
            
        except ValueError as e:
            response = ApiResponse(success=False, error=str(e))
            return (400, response.to_dict())
        except Exception as e:
            response = ApiResponse(success=False, error=str(e))
            return (500, response.to_dict())
    
    @staticmethod
    def get_all_news(query_params: dict = None) -> tuple:
        """GET /api/news - Get all news articles with pagination"""
        try:
            page = int(get_query_param(query_params, 'page', 1))
            limit = int(get_query_param(query_params, 'limit', 10))
            
            result = NewsService.get_paginated_news(page, limit)
            
            response = ApiResponse(
                success=True,
                data=result['data']
            )
            # Attach pagination info
            response_dict = response.to_dict()
            response_dict['pagination'] = result['pagination']
            return (200, response_dict)
            
        except Exception as e:
            response = ApiResponse(success=False, error=str(e))
            return (500, response.to_dict())
    
    @staticmethod
    def get_news_by_id(news_id: int, query_params: dict = None) -> tuple:
        """GET /api/news/{id} - Get a specific news article"""
        try:
            news = NewsService.get_news_by_id(news_id)
            
            if not news:
                response = ApiResponse(success=False, error='News article not found')
                return (404, response.to_dict())
            
            response = ApiResponse(success=True, data=news.to_dict())
            return (200, response.to_dict())
            
        except Exception as e:
            response = ApiResponse(success=False, error=str(e))
            return (500, response.to_dict())
    
    @staticmethod
    def update_news(news_id: int, body: bytes, query_params: dict = None) -> tuple:
        """PUT /api/news/{id} - Update a news article"""
        try:
            data = parse_json(body)
            
            news = News(
                title=data.get('title'),
                content=data.get('content'),
                author=data.get('author'),
                category=data.get('category')
            )
            
            success = NewsService.update_news(news_id, news)
            
            if not success:
                response = ApiResponse(success=False, error='News article not found')
                return (404, response.to_dict())
            
            response = ApiResponse(
                success=True,
                message='News article updated successfully'
            )
            return (200, response.to_dict())
            
        except ValueError as e:
            response = ApiResponse(success=False, error=str(e))
            return (400, response.to_dict())
        except Exception as e:
            response = ApiResponse(success=False, error=str(e))
            return (500, response.to_dict())
    
    @staticmethod
    def delete_news(news_id: int, query_params: dict = None) -> tuple:
        """DELETE /api/news/{id} - Delete a news article"""
        try:
            success = NewsService.delete_news(news_id)
            
            if not success:
                response = ApiResponse(success=False, error='News article not found')
                return (404, response.to_dict())
            
            response = ApiResponse(
                success=True,
                message='News article deleted successfully'
            )
            return (200, response.to_dict())
            
        except Exception as e:
            response = ApiResponse(success=False, error=str(e))
            return (500, response.to_dict())
    
    @staticmethod
    def search_news(query_params: dict = None) -> tuple:
        """GET /api/news/search - Search news articles"""
        try:
            search_term = get_query_param(query_params, 'q', '')
            category = get_query_param(query_params, 'category', None)
            page = int(get_query_param(query_params, 'page', 1))
            limit = int(get_query_param(query_params, 'limit', 10))
            
            if not search_term and not category:
                response = ApiResponse(success=False, error='Search term or category required')
                return (400, response.to_dict())
            
            if search_term:
                results = NewsService.search_news(search_term)
            else:
                results = NewsService.get_news_by_category(category)
            
            response_data = [news.to_dict() for news in results]
            response = ApiResponse(success=True, data=response_data)
            return (200, response.to_dict())
            
        except Exception as e:
            response = ApiResponse(success=False, error=str(e))
            return (500, response.to_dict())
    
    @staticmethod
    def get_statistics(query_params: dict = None) -> tuple:
        """GET /api/statistics - Get news statistics"""
        try:
            stats = NewsService.get_statistics()
            response = ApiResponse(success=True, data=stats)
            return (200, response.to_dict())
            
        except Exception as e:
            response = ApiResponse(success=False, error=str(e))
            return (500, response.to_dict())


class CategoryController:
    """Controller for category endpoints"""
    
    @staticmethod
    def create_category(body: bytes, query_params: dict = None) -> tuple:
        """POST /api/categories - Create category"""
        try:
            from models import Category
            data = parse_json(body)
            
            category = Category(
                name=data.get('name'),
                description=data.get('description')
            )
            
            category_id = CategoryService.create_category(category)
            response = ApiResponse(success=True, data={'id': category_id}, message='Category created')
            return (201, response.to_dict())
            
        except ValueError as e:
            response = ApiResponse(success=False, error=str(e))
            return (400, response.to_dict())
        except Exception as e:
            response = ApiResponse(success=False, error=str(e))
            return (500, response.to_dict())
    
    @staticmethod
    def get_all_categories(query_params: dict = None) -> tuple:
        """GET /api/categories - Get all categories"""
        try:
            categories = CategoryService.get_all_categories()
            response = ApiResponse(success=True, data=[c.to_dict() for c in categories])
            return (200, response.to_dict())
            
        except Exception as e:
            response = ApiResponse(success=False, error=str(e))
            return (500, response.to_dict())
    
    @staticmethod
    def get_category(category_id: int, query_params: dict = None) -> tuple:
        """GET /api/categories/{id} - Get specific category"""
        try:
            category = CategoryService.get_category_by_id(category_id)
            
            if not category:
                response = ApiResponse(success=False, error='Category not found')
                return (404, response.to_dict())
            
            response = ApiResponse(success=True, data=category.to_dict())
            return (200, response.to_dict())
            
        except Exception as e:
            response = ApiResponse(success=False, error=str(e))
            return (500, response.to_dict())
    
    @staticmethod
    def update_category(category_id: int, body: bytes, query_params: dict = None) -> tuple:
        """PUT /api/categories/{id} - Update category"""
        try:
            from models import Category
            data = parse_json(body)
            
            category = Category(
                name=data.get('name'),
                description=data.get('description')
            )
            
            success = CategoryService.update_category(category_id, category)
            
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
            success = CategoryService.delete_category(category_id)
            
            if not success:
                response = ApiResponse(success=False, error='Category not found')
                return (404, response.to_dict())
            
            response = ApiResponse(success=True, message='Category deleted')
            return (200, response.to_dict())
            
        except Exception as e:
            response = ApiResponse(success=False, error=str(e))
            return (500, response.to_dict())


class MediaController:
    """Controller for media endpoints"""
    
    @staticmethod
    def get_all_media(query_params: dict = None) -> tuple:
        """GET /api/media - Get all media"""
        try:
            media_list = MediaService.get_all_media()
            response = ApiResponse(success=True, data=[m.to_dict() for m in media_list])
            return (200, response.to_dict())
            
        except Exception as e:
            response = ApiResponse(success=False, error=str(e))
            return (500, response.to_dict())
    
    @staticmethod
    def delete_media(media_id: int, query_params: dict = None) -> tuple:
        """DELETE /api/media/{id} - Delete media"""
        try:
            success = MediaService.delete_media(media_id)
            
            if not success:
                response = ApiResponse(success=False, error='Media not found')
                return (404, response.to_dict())
            
            response = ApiResponse(success=True, message='Media deleted')
            return (200, response.to_dict())
            
        except Exception as e:
            response = ApiResponse(success=False, error=str(e))
            return (500, response.to_dict())

    @staticmethod
    def upload_media(body: bytes, query_params: dict = None) -> tuple:
        """POST /api/media - Upload a file via multipart/form-data

        This parser expects the raw body bytes and will parse multipart parts.
        The file will be saved to the frontend/uploads directory and a DB entry created.
        """
        try:
            from models import Media
            from utils import parse_multipart
            import os

            parsed = parse_multipart(body)
            files = parsed.get('files', [])

            if not files:
                response = ApiResponse(success=False, error='No file uploaded')
                return (400, response.to_dict())

            # Ensure frontend uploads directory exists
            frontend_root = os.path.join(os.path.dirname(__file__), '..', 'frontend')
            uploads_dir = os.path.join(frontend_root, 'uploads')
            os.makedirs(uploads_dir, exist_ok=True)

            saved_items = []
            for f in files:
                filename = f.get('filename')
                content = f.get('content') or b''
                mime_type = f.get('content_type') or 'application/octet-stream'

                # make filename safe
                safe_name = filename.replace('..', '').replace('/', '').replace('\\', '')
                save_path = os.path.join(uploads_dir, safe_name)

                # Avoid overwriting: add numeric suffix if needed
                base, ext = os.path.splitext(safe_name)
                counter = 1
                while os.path.exists(save_path):
                    safe_name = f"{base}_{counter}{ext}"
                    save_path = os.path.join(uploads_dir, safe_name)
                    counter += 1

                with open(save_path, 'wb') as out_f:
                    out_f.write(content)

                # filepath exposed via frontend static serving
                web_path = f"/uploads/{safe_name}"
                media = Media(filename=safe_name, filepath=web_path, mime_type=mime_type, size=len(content))
                media_id = MediaService.create_media(media)

                saved_items.append({'id': media_id, 'filename': safe_name, 'url': web_path})

            response = ApiResponse(success=True, data=saved_items, message='Uploaded')
            return (201, response.to_dict())

        except Exception as e:
            response = ApiResponse(success=False, error=str(e))
            return (500, response.to_dict())


class PageController:
    """Controller for page-specific data endpoints"""
    
    @staticmethod
    def get_home_data(query_params: dict = None) -> tuple:
        """GET /api/pages/home - Get home page data"""
        try:
            # Get featured articles (latest 6)
            featured_news = NewsService.get_all_news(limit=6)
            stats = NewsService.get_statistics()
            
            data = {
                'featured_articles': [n.to_dict() for n in featured_news],
                'statistics': stats
            }
            
            response = ApiResponse(success=True, data=data)
            return (200, response.to_dict())
            
        except Exception as e:
            response = ApiResponse(success=False, error=str(e))
            return (500, response.to_dict())
    
    @staticmethod
    def get_articles_page(query_params: dict = None) -> tuple:
        """GET /api/pages/articles - Get articles page data"""
        try:
            page = int(get_query_param(query_params, 'page', 1))
            limit = int(get_query_param(query_params, 'limit', 12))
            
            result = NewsService.get_paginated_news(page, limit)
            categories = CategoryService.get_all_categories()
            
            data = {
                'articles': result['data'],
                'pagination': result['pagination'],
                'categories': [c.to_dict() for c in categories]
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
            latest_news = NewsService.get_all_news(limit=limit)
            
            data = {
                'latest_articles': [n.to_dict() for n in latest_news]
            }
            
            response = ApiResponse(success=True, data=data)
            return (200, response.to_dict())
            
        except Exception as e:
            response = ApiResponse(success=False, error=str(e))
            return (500, response.to_dict())
    
    @staticmethod
    def get_categories_page(query_params: dict = None) -> tuple:
        """GET /api/pages/categories - Get categories page data"""
        try:
            categories = CategoryService.get_all_categories()
            
            # Get article count for each category
            categories_with_counts = []
            for category in categories:
                articles = NewsService.get_news_by_category(category.name, limit=1)
                category_dict = category.to_dict()
                category_dict['article_count'] = len(NewsService.get_news_by_category(category.name))
                categories_with_counts.append(category_dict)
            
            data = {
                'categories': categories_with_counts
            }
            
            response = ApiResponse(success=True, data=data)
            return (200, response.to_dict())
            
        except Exception as e:
            response = ApiResponse(success=False, error=str(e))
            return (500, response.to_dict())
