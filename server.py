#!/usr/bin/env python3
"""
Main application entry point
"""
import http.server
import ssl
import os
import sys
from router import create_router
from database.connection import init_db, close_db
from core.middleware import RequestHandler

def setup_ssl_certificates(cert_path: str, key_path: str):
    """Setup SSL certificates"""
    if not os.path.exists(cert_path) or not os.path.exists(key_path):
        print("Generating self-signed certificate...")
        cmd = f'openssl req -new -x509 -keyout {key_path} -out {cert_path} -days 365 -nodes -subj "/CN=localhost"'
        result = os.system(cmd)
        if result != 0:
            print("Failed to generate certificate")
            sys.exit(1)
        print("Certificate generated successfully")
    return cert_path, key_path

def run_server(host: str = '', port: int = 8443, use_ssl: bool = True):
    """Run the HTTPS server"""
    print("Initializing database...")
    init_db()
    print("Database initialized")
    
    RequestHandler.router = create_router()
    print("Router configured")
    
    server_address = (host, port)
    httpd = http.server.HTTPServer(server_address, RequestHandler)
    
    if use_ssl:
        cert_path = os.path.join(os.path.dirname(__file__), 'backend', 'cert.pem')
        key_path = os.path.join(os.path.dirname(__file__), 'backend', 'key.pem')
        cert_path, key_path = setup_ssl_certificates(cert_path, key_path)
        
        context = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
        context.load_cert_chain(cert_path, key_path)
        httpd.socket = context.wrap_socket(httpd.socket, server_side=True)
        protocol = 'https'
    else:
        protocol = 'http'
    
    print(f"\nNews Management Server running on {protocol}://{host or 'localhost'}:{port}")
    print("Press Ctrl+C to stop the server\n")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        httpd.server_close()
        close_db()
        print("Server stopped")
        sys.exit(0)

if __name__ == '__main__':
    run_server()