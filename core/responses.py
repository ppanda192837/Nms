"""
Response utilities
"""

class ApiResponse:
    """Standard API response format"""
    
    def __init__(self, success: bool = True, data=None, message: str = None, error: str = None):
        self.success = success
        self.data = data
        self.message = message
        self.error = error
    
    def to_dict(self) -> dict:
        """Convert to dictionary"""
        result = {'success': self.success}
        
        if self.data is not None:
            result['data'] = self.data
        if self.message:
            result['message'] = self.message
        if self.error:
            result['error'] = self.error
        
        return result

def format_response_headers(status_code: int, content_type: str = 'application/json') -> dict:
    """Format response headers"""
    return {
        'Content-Type': content_type,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }