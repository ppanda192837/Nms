"""
Routing configuration - URL route mapping to controllers
"""
from typing import Callable, Optional, Dict, Any
from urllib.parse import urlparse, parse_qs
import re


class Route:
    """Represents a single route"""
    
    def __init__(self, method: str, pattern: str, handler: Callable):
        self.method = method.upper()
        self.pattern = pattern
        self.handler = handler
        self.regex = self._compile_pattern(pattern)
    
    def _compile_pattern(self, pattern: str) -> re.Pattern:
        """Convert URL pattern to regex"""
        regex_pattern = pattern
        # Replace {id} and other params with regex patterns
        regex_pattern = re.sub(r'\{(\w+)\}', r'(?P<\1>\\d+)', regex_pattern)
        regex_pattern = f'^{regex_pattern}$'
        return re.compile(regex_pattern)
    
    def matches(self, path: str) -> tuple[bool, Optional[Dict[str, Any]]]:
        """Check if path matches this route"""
        match = self.regex.match(path)
        if match:
            return True, match.groupdict()
        return False, None


class Router:
    """Handles URL routing"""
    
    def __init__(self):
        self.routes = []
    
    def add_route(self, method: str, pattern: str, handler: Callable):
        """Add a route"""
        route = Route(method, pattern, handler)
        self.routes.append(route)
    
    def add_get(self, pattern: str, handler: Callable):
        """Add GET route"""
        self.add_route('GET', pattern, handler)
    
    def add_post(self, pattern: str, handler: Callable):
        """Add POST route"""
        self.add_route('POST', pattern, handler)
    
    def add_put(self, pattern: str, handler: Callable):
        """Add PUT route"""
        self.add_route('PUT', pattern, handler)
    
    def add_delete(self, pattern: str, handler: Callable):
        """Add DELETE route"""
        self.add_route('DELETE', pattern, handler)
    
    def match(self, method: str, path: str) -> tuple[Optional[Callable], Optional[Dict[str, Any]]]:
        """Find matching route and extract parameters"""
        for route in self.routes:
            if route.method == method.upper():
                matches, params = route.matches(path)
                if matches:
                    return route.handler, params or {}
        return None, None
    
    def dispatch(self, method: str, path: str) -> tuple[Optional[Callable], Optional[Dict[str, Any]]]:
        """Dispatch request to appropriate handler"""
        handler, params = self.match(method, path)
        return handler, params


def create_router() -> Router:
    """Create and configure the application router"""
    from controllers import NewsController, CategoryController, MediaController, PageController
    
    router = Router()
    
    # Page endpoints
    router.add_get('/api/pages/home', PageController.get_home_data)
    router.add_get('/api/pages/articles', PageController.get_articles_page)
    router.add_get('/api/pages/latest', PageController.get_latest_news)
    router.add_get('/api/pages/categories', PageController.get_categories_page)
    
    # News endpoints
    router.add_get('/api/news', NewsController.get_all_news)
    router.add_post('/api/news', NewsController.create_news)
    router.add_get('/api/news/search', NewsController.search_news)
    router.add_get('/api/news/{id}', NewsController.get_news_by_id)
    router.add_put('/api/news/{id}', NewsController.update_news)
    router.add_delete('/api/news/{id}', NewsController.delete_news)
    
    # Category endpoints
    router.add_get('/api/categories', CategoryController.get_all_categories)
    router.add_post('/api/categories', CategoryController.create_category)
    router.add_get('/api/categories/{id}', CategoryController.get_category)
    router.add_put('/api/categories/{id}', CategoryController.update_category)
    router.add_delete('/api/categories/{id}', CategoryController.delete_category)
    
    # Media endpoints
    router.add_get('/api/media', MediaController.get_all_media)
    router.add_post('/api/media', MediaController.upload_media)
    router.add_delete('/api/media/{id}', MediaController.delete_media)
    
    # Statistics endpoint
    router.add_get('/api/statistics', NewsController.get_statistics)
    
    # Health check
    router.add_get('/api/health', lambda query_params=None: (200, {'success': True, 'message': 'Server is running'}))
    
    return router


def parse_query_string(url: str) -> Dict[str, str]:
    """Parse query string from URL"""
    parsed_url = urlparse(url)
    query_dict = {}
    if parsed_url.query:
        params = parse_qs(parsed_url.query)
        # Convert lists to single values
        for key, value in params.items():
            query_dict[key] = value[0] if value else ''
    return query_dict


def extract_path(url: str) -> str:
    """Extract path from URL"""
    parsed_url = urlparse(url)
    return parsed_url.path
