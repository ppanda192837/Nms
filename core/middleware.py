"""
Core middleware and request handler
"""
import http.server
import mimetypes
import os
import time
from urllib.parse import urlparse, parse_qs
from router import parse_query_string, extract_path
from core.responses import format_response_headers
from core.static import serve_static_file

class RequestHandler(http.server.BaseHTTPRequestHandler):
    """Main HTTP request handler"""
    
    router = None
    
    def do_GET(self):
        self._handle_request('GET')
    
    def do_POST(self):
        self._handle_request('POST')
    
    def do_PUT(self):
        self._handle_request('PUT')
    
    def do_DELETE(self):
        self._handle_request('DELETE')
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
    
    def _handle_request(self, method: str):
        """Central request handling logic"""
        path = extract_path(self.path)
        query_params = parse_query_string(self.path)
        
        try:
            # Serve frontend files
            if path == '/' or path == '':
                self._serve_frontend()
                return
            
            # Serve static files
            if self._serve_static_file(path):
                return
            
            # Handle API routes
            handler, params = self.router.dispatch(method, path)
            
            if handler is None:
                self._send_response(404, {'success': False, 'error': 'Not found'})
                return
            
            # Read request body
            body = b''
            content_length = self.headers.get('Content-Length')
            if content_length:
                body = self.rfile.read(int(content_length))
            
            # Call handler
            if params:
                handler_params = {}
                for key, value in params.items():
                    try:
                        handler_params[key] = int(value)
                    except (ValueError, TypeError):
                        handler_params[key] = value
                
                if body:
                    status_code, response_data = handler(handler_params.get('id'), body, query_params)
                else:
                    status_code, response_data = handler(handler_params.get('id'), query_params)
            else:
                if body:
                    status_code, response_data = handler(body, query_params)
                else:
                    status_code, response_data = handler(query_params)
            
            self._send_response(status_code, response_data)
            
        except Exception as e:
            self._send_response(500, {'success': False, 'error': str(e)})
    
    def _send_response(self, status_code: int, data: dict):
        """Send JSON response"""
        import json
        
        response_body = json.dumps(data)
        
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-Length', str(len(response_body)))
        self.end_headers()
        self.wfile.write(response_body.encode('utf-8'))
    
    def _serve_frontend(self):
        """Serve frontend HTML"""
        frontend_path = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'pages', 'index.html')
        
        try:
            with open(frontend_path, 'r') as f:
                content = f.read()
            
            self.send_response(200)
            self.send_header('Content-Type', 'text/html')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(content.encode('utf-8'))
            
        except FileNotFoundError:
            self._send_response(404, {'success': False, 'error': 'Frontend not found'})
    
    def _serve_static_file(self, path: str) -> bool:
        """Serve static files"""
        return serve_static_file(self, path)
    
    def log_message(self, format, *args):
        """Suppress default logging"""
        pass