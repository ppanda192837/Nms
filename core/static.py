"""
Static file serving utilities
"""
import os
import mimetypes

def serve_static_file(request_handler, path: str) -> bool:
    """Serve static files from frontend directory"""
    frontend_root = os.path.join(os.path.dirname(__file__), '..', 'frontend')
    
    # Remove leading slash and prevent directory traversal
    rel_path = path.lstrip('/')
    if not rel_path:
        return False
    
    static_file_path = os.path.normpath(os.path.join(frontend_root, rel_path))
    frontend_root_abs = os.path.abspath(frontend_root)
    static_file_abs = os.path.abspath(static_file_path)
    
    # Security check: ensure file is within frontend directory
    if not static_file_abs.startswith(frontend_root_abs):
        return False
    
    if os.path.exists(static_file_abs) and os.path.isfile(static_file_abs):
        try:
            content_type, _ = mimetypes.guess_type(static_file_abs)
            if not content_type:
                content_type = 'application/octet-stream'
            
            with open(static_file_abs, 'rb') as f:
                content = f.read()
            
            request_handler.send_response(200)
            request_handler.send_header('Content-Type', content_type)
            request_handler.send_header('Access-Control-Allow-Origin', '*')
            request_handler.send_header('Content-Length', str(len(content)))
            request_handler.end_headers()
            request_handler.wfile.write(content)
            
            return True
        except Exception:
            return False
    
    return False