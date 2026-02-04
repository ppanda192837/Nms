"""
Utilities and helpers - Common utility functions
"""
import json
from typing import Any, Dict, Optional
from urllib.parse import unquote


def parse_json(body: bytes) -> Dict[str, Any]:
    """Parse JSON from request body"""
    try:
        if not body:
            return {}
        return json.loads(body.decode('utf-8'))
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON: {str(e)}")
    except Exception as e:
        raise ValueError(f"Error parsing request body: {str(e)}")


def to_json(data: Any) -> str:
    """Convert data to JSON string"""
    try:
        return json.dumps(data)
    except TypeError as e:
        raise ValueError(f"Data is not JSON serializable: {str(e)}")


def get_query_param(query_params: Optional[Dict[str, str]], key: str, default: Any = None) -> Any:
    """Get query parameter value"""
    if not query_params:
        return default
    
    value = query_params.get(key, default)
    
    # Handle type conversion for common types
    if value is not None and value != default:
        if isinstance(value, str):
            if value.lower() in ['true', 'false']:
                return value.lower() == 'true'
            try:
                return int(value)
            except ValueError:
                pass
    
    return value


def decode_url_param(param: str) -> str:
    """Decode URL-encoded parameter"""
    try:
        return unquote(param)
    except Exception:
        return param


def extract_resource_id(path: str) -> Optional[int]:
    """Extract resource ID from path like /api/news/123"""
    try:
        parts = path.rstrip('/').split('/')
        if parts:
            last_part = parts[-1]
            if last_part.isdigit():
                return int(last_part)
    except (ValueError, IndexError):
        pass
    return None


def is_valid_email(email: str) -> bool:
    """Validate email address"""
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def is_valid_url(url: str) -> bool:
    """Validate URL"""
    import re
    pattern = r'^https?://[^\s/$.?#].[^\s]*$'
    return re.match(pattern, url) is not None


def sanitize_string(text: str) -> str:
    """Sanitize string input"""
    if not isinstance(text, str):
        return str(text)
    
    # Remove leading/trailing whitespace
    text = text.strip()
    
    # Limit length
    max_length = 10000
    if len(text) > max_length:
        text = text[:max_length]
    
    return text


def format_response_headers(status_code: int, content_type: str = 'application/json') -> Dict[str, str]:
    """Format standard response headers"""
    headers = {
        'Content-Type': content_type,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
    }
    return headers


def get_status_message(status_code: int) -> str:
    """Get HTTP status message for status code"""
    status_messages = {
        200: 'OK',
        201: 'Created',
        204: 'No Content',
        400: 'Bad Request',
        401: 'Unauthorized',
        403: 'Forbidden',
        404: 'Not Found',
        405: 'Method Not Allowed',
        409: 'Conflict',
        429: 'Too Many Requests',
        500: 'Internal Server Error',
        502: 'Bad Gateway',
        503: 'Service Unavailable'
    }
    return status_messages.get(status_code, 'Unknown')


def calculate_duration(start_time: float, end_time: float) -> float:
    """Calculate duration in milliseconds"""
    return (end_time - start_time) * 1000


def paginate_list(items: list, page: int, limit: int) -> tuple:
    """Paginate a list of items"""
    total = len(items)
    
    if page < 1:
        page = 1
    if limit < 1:
        limit = 10
    
    start = (page - 1) * limit
    end = start + limit
    
    paginated_items = items[start:end]
    pages = (total + limit - 1) // limit  # Ceiling division
    
    return paginated_items, {
        'total': total,
        'page': page,
        'limit': limit,
        'pages': pages
    }


def merge_dicts(*dicts) -> Dict[str, Any]:
    """Merge multiple dictionaries"""
    result = {}
    for d in dicts:
        if isinstance(d, dict):
            result.update(d)
    return result


def filter_dict(data: Dict[str, Any], keys: list) -> Dict[str, Any]:
    """Filter dictionary to only include specified keys"""
    return {k: v for k, v in data.items() if k in keys}


def pick_dict(data: Dict[str, Any], keys: list) -> Dict[str, Any]:
    """Pick specific keys from dictionary"""
    return {k: data.get(k) for k in keys if k in data}


def omit_dict(data: Dict[str, Any], keys: list) -> Dict[str, Any]:
    """Omit specified keys from dictionary"""
    return {k: v for k, v in data.items() if k not in keys}


def parse_multipart(body: bytes) -> Dict[str, Any]:
    """A very small multipart/form-data parser.

    Returns a dict with 'fields' and 'files'. Each file entry is a dict with
    keys: filename, content_type, content (bytes).
    Note: This implementation assumes the body starts with the boundary line
    and uses CRLF (\r\n) separators. It's sufficient for simple uploads.
    """
    result = {'fields': {}, 'files': []}
    if not body:
        return result

    # Try to detect boundary from the first line
    try:
        # Find first line
        first_crlf = body.find(b"\r\n")
        if first_crlf == -1:
            return result
        first_line = body[:first_crlf]
        if not first_line.startswith(b'--'):
            # fallback: attempt to read until newline
            boundary = first_line
        else:
            boundary = first_line[2:]

        parts = body.split(b'--' + boundary)
        for part in parts:
            part = part.strip(b'\r\n')
            if not part or part == b'--':
                continue

            # Split headers and content
            header_end = part.find(b"\r\n\r\n")
            if header_end == -1:
                continue
            headers_block = part[:header_end].decode('utf-8', errors='ignore')
            content = part[header_end+4:]

            # Parse headers
            headers = {}
            for hline in headers_block.split('\r\n'):
                if ':' in hline:
                    k, v = hline.split(':', 1)
                    headers[k.strip().lower()] = v.strip()

            disposition = headers.get('content-disposition', '')
            # parse disposition parameters
            params = {}
            for token in disposition.split(';'):
                if '=' in token:
                    k, v = token.strip().split('=', 1)
                    params[k.strip()] = v.strip().strip('"')

            name = params.get('name')
            filename = params.get('filename')
            content_type = headers.get('content-type')

            if filename:
                result['files'].append({
                    'name': name,
                    'filename': filename,
                    'content_type': content_type,
                    'content': content
                })
            else:
                # treat as regular field
                try:
                    value = content.decode('utf-8')
                except Exception:
                    value = ''
                if name:
                    result['fields'][name] = value

    except Exception:
        return result

    return result
