"""
Request parsing utilities
"""
import json
import re

def parse_json(body: bytes) -> dict:
    """Parse JSON from request body"""
    try:
        return json.loads(body.decode('utf-8'))
    except (json.JSONDecodeError, UnicodeDecodeError) as e:
        raise ValueError(f'Invalid JSON: {str(e)}')

def get_query_param(query_params: dict, key: str, default=None):
    """Get query parameter with default"""
    return query_params.get(key, default) if query_params else default

def parse_multipart(body: bytes) -> dict:
    """Parse multipart/form-data"""
    if not body:
        return {'files': []}
    
    # Simple multipart parser
    boundary_match = re.search(rb'boundary=([^;]+)', body[:200])
    if not boundary_match:
        return {'files': []}
    
    boundary = boundary_match.group(1)
    parts = body.split(b'--' + boundary)
    
    files = []
    for part in parts[1:-1]:  # Skip first empty and last closing parts
        if b'Content-Disposition' in part:
            # Extract filename
            filename_match = re.search(rb'filename="([^"]*)"', part)
            if filename_match:
                filename = filename_match.group(1).decode('utf-8')
                
                # Extract content type
                content_type_match = re.search(rb'Content-Type: ([^\r\n]+)', part)
                content_type = content_type_match.group(1).decode('utf-8') if content_type_match else 'application/octet-stream'
                
                # Extract file content
                content_start = part.find(b'\r\n\r\n') + 4
                content = part[content_start:].rstrip(b'\r\n')
                
                files.append({
                    'filename': filename,
                    'content_type': content_type,
                    'content': content
                })
    
    return {'files': files}