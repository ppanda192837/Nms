"""
URL routing configuration
"""
from typing import Callable, Optional, Dict, Any
from urllib.parse import urlparse, parse_qs
import re

class Route:
    def __init__(self, method: str, pattern: str, handler: Callable):
        self.method = method.upper()
        self.pattern = pattern
        self.handler = handler
        self.regex = self._compile_pattern(pattern)
    
    def _compile_pattern(self, pattern: str) -> re.Pattern:
        regex_pattern = pattern
        regex_pattern = re.sub(r'\{(\w+)\}', r'(?P<\1>\\d+)', regex_pattern)
        regex_pattern = f'^{regex_pattern}$'
        return re.compile(regex_pattern)
    
    def matches(self, path: str) -> tuple[bool, Optional[Dict[str, Any]]]:
        match = self.regex.match(path)
        if match:
            return True, match.groupdict()
        return False, None

class Router:
    def __init__(self):
        self.routes = []
    
    def add_route(self, method: str, pattern: str, handler: Callable):
        route = Route(method, pattern, handler)
        self.routes.append(route)
    
    def add_get(self, pattern: str, handler: Callable):
        self.add_route('GET', pattern, handler)
    
    def add_post(self, pattern: str, handler: Callable):
        self.add_route('POST', pattern, handler)
    
    def add_put(self, pattern: str, handler: Callable):
        self.add_route('PUT', pattern, handler)
    
    def add_delete(self, pattern: str, handler: Callable):
        self.add_route('DELETE', pattern, handler)
    
    def dispatch(self, method: str, path: str) -> tuple[Optional[Callable], Optional[Dict[str, Any]]]:
        for route in self.routes:
            if route.method == method.upper():
                matches, params = route.matches(path)
                if matches:
                    return route.handler, params or {}
        return None, None

def create_router() -> Router:
    """Create and configure the application router"""
    from controllers.create_article import CreateArticleController
    from controllers.manage_article import ManageArticleController
    from controllers.manage_category import ManageCategoryController
    from controllers.manage_media import ManageMediaController
    
    router = Router()
    
    # Article creation endpoints
    router.add_post('/api/articles', CreateArticleController.create_article)
    
    # Article management endpoints
    router.add_get('/api/articles', ManageArticleController.get_all_articles)
    router.add_get('/api/articles/{id}', ManageArticleController.get_article)
    router.add_put('/api/articles/{id}', ManageArticleController.update_article)
    router.add_delete('/api/articles/{id}', ManageArticleController.delete_article)
    router.add_get('/api/articles/search', ManageArticleController.search_articles)
    
    # Category management endpoints
    router.add_get('/api/categories', ManageCategoryController.get_all_categories)
    router.add_post('/api/categories', ManageCategoryController.create_category)
    router.add_get('/api/categories/{id}', ManageCategoryController.get_category)
    router.add_put('/api/categories/{id}', ManageCategoryController.update_category)
    router.add_delete('/api/categories/{id}', ManageCategoryController.delete_category)
    
    # Media management endpoints
    router.add_get('/api/media', ManageMediaController.get_all_media)
    router.add_post('/api/media', ManageMediaController.upload_media)
    router.add_delete('/api/media/{id}', ManageMediaController.delete_media)
    
    # Page endpoints
    router.add_get('/api/pages/home', ManageArticleController.get_home_data)
    router.add_get('/api/pages/latest', ManageArticleController.get_latest_news)
    router.add_get('/api/statistics', ManageArticleController.get_statistics)
    
    # Health check
    router.add_get('/api/health', lambda query_params=None: (200, {'success': True, 'message': 'Server is running'}))
    
    return router

def parse_query_string(url: str) -> Dict[str, str]:
    parsed_url = urlparse(url)
    query_dict = {}
    if parsed_url.query:
        params = parse_qs(parsed_url.query)
        for key, value in params.items():
            query_dict[key] = value[0] if value else ''
    return query_dict

def extract_path(url: str) -> str:
    parsed_url = urlparse(url)
    return parsed_url.path