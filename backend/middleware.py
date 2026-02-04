"""
Middleware - Cross-cutting concerns like CORS, error handling, logging
"""
from datetime import datetime
from typing import Callable, Optional, Dict, Any
import json


class LoggingMiddleware:
    """Middleware for logging HTTP requests and responses"""
    
    @staticmethod
    def log_request(method: str, path: str, client_address: str = None):
        """Log incoming request"""
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        client = client_address or 'Unknown'
        print(f"[{timestamp}] {method:6} {path:30} - {client}")
    
    @staticmethod
    def log_response(method: str, path: str, status_code: int, duration_ms: float = None):
        """Log outgoing response"""
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        status_msg = f"{status_code}"
        duration_str = f" ({duration_ms:.2f}ms)" if duration_ms else ""
        print(f"[{timestamp}] {method:6} {path:30} -> {status_msg}{duration_str}")


class CORSMiddleware:
    """Middleware for handling CORS headers"""
    
    ALLOWED_ORIGINS = ['*']
    ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    ALLOWED_HEADERS = ['Content-Type', 'Authorization']
    
    @staticmethod
    def add_cors_headers(headers_dict: Dict[str, str]) -> Dict[str, str]:
        """Add CORS headers to response"""
        headers_dict['Access-Control-Allow-Origin'] = ', '.join(CORSMiddleware.ALLOWED_ORIGINS)
        headers_dict['Access-Control-Allow-Methods'] = ', '.join(CORSMiddleware.ALLOWED_METHODS)
        headers_dict['Access-Control-Allow-Headers'] = ', '.join(CORSMiddleware.ALLOWED_HEADERS)
        return headers_dict
    
    @staticmethod
    def handle_preflight(method: str) -> tuple[bool, Optional[int]]:
        """Handle OPTIONS preflight requests"""
        if method == 'OPTIONS':
            return True, 200
        return False, None


class ErrorMiddleware:
    """Middleware for error handling"""
    
    @staticmethod
    def handle_error(error: Exception, status_code: int = 500) -> Dict[str, Any]:
        """Convert exception to error response"""
        error_response = {
            'success': False,
            'error': str(error),
            'timestamp': datetime.now().isoformat()
        }
        return error_response
    
    @staticmethod
    def handle_404() -> Dict[str, Any]:
        """Handle 404 Not Found"""
        return {
            'success': False,
            'error': 'Endpoint not found',
            'timestamp': datetime.now().isoformat()
        }
    
    @staticmethod
    def handle_method_not_allowed() -> Dict[str, Any]:
        """Handle 405 Method Not Allowed"""
        return {
            'success': False,
            'error': 'Method not allowed',
            'timestamp': datetime.now().isoformat()
        }


class AuthenticationMiddleware:
    """Middleware for authentication (can be extended for token validation)"""
    
    PROTECTED_ROUTES = []
    
    @staticmethod
    def is_route_protected(path: str) -> bool:
        """Check if route requires authentication"""
        return any(route in path for route in AuthenticationMiddleware.PROTECTED_ROUTES)
    
    @staticmethod
    def validate_token(token: Optional[str]) -> bool:
        """Validate authentication token"""
        # Placeholder for token validation logic
        # Can be extended with JWT or other token schemes
        if not token:
            return False
        return True


class RateLimitMiddleware:
    """Middleware for rate limiting"""
    
    def __init__(self):
        self.requests = {}
        self.max_requests = 100  # requests per minute
        self.window = 60  # seconds
    
    def is_rate_limited(self, client_ip: str) -> bool:
        """Check if client has exceeded rate limit"""
        current_time = datetime.now().timestamp()
        
        if client_ip not in self.requests:
            self.requests[client_ip] = []
        
        # Remove old requests outside the window
        self.requests[client_ip] = [
            req_time for req_time in self.requests[client_ip]
            if current_time - req_time < self.window
        ]
        
        # Check if limit exceeded
        if len(self.requests[client_ip]) >= self.max_requests:
            return True
        
        # Add current request
        self.requests[client_ip].append(current_time)
        return False


class ValidationMiddleware:
    """Middleware for input validation"""
    
    @staticmethod
    def validate_json_content_type(content_type: Optional[str]) -> bool:
        """Validate Content-Type is application/json"""
        if not content_type:
            return False
        return 'application/json' in content_type.lower()
    
    @staticmethod
    def validate_content_length(content_length: Optional[str], max_size: int = 10 * 1024 * 1024) -> tuple[bool, Optional[str]]:
        """Validate Content-Length"""
        try:
            if content_length is None:
                return True, None
            
            size = int(content_length)
            if size > max_size:
                return False, f'Request body too large. Max size: {max_size} bytes'
            return True, None
        except ValueError:
            return False, 'Invalid Content-Length'


# Middleware instances
logging_middleware = LoggingMiddleware()
cors_middleware = CORSMiddleware()
error_middleware = ErrorMiddleware()
auth_middleware = AuthenticationMiddleware()
rate_limit_middleware = RateLimitMiddleware()
validation_middleware = ValidationMiddleware()
