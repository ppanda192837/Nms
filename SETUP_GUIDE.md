# Setup and Deployment Guide

## Quick Start

### 1. Start the Backend Server

```bash
cd /workspaces/Nms/backend
python3 server.py
```

Expected output:
```
Initializing database...
Database initialized
Router configured

============================================================
News Management Server
============================================================
Server running on https://localhost:8443
API Documentation:
  GET    /api/news              - Get all news
  GET    /api/news/{id}         - Get specific news
  GET    /api/news/search       - Search news
  GET    /api/statistics        - Get statistics
  POST   /api/news              - Create news
  PUT    /api/news/{id}         - Update news
  DELETE /api/news/{id}         - Delete news
  GET    /api/health            - Health check
============================================================
Press Ctrl+C to stop the server
```

### 2. Open Frontend

Navigate to: `https://localhost:8443`

Accept the self-signed certificate warning.

## Architecture Overview

The backend uses a **modular, layered architecture** with complete separation of concerns:

```
┌─────────────────────────────────────────────────┐
│         HTTP Server (RequestHandler)             │
├─────────────────────────────────────────────────┤
│              Middleware Pipeline                 │
│  - Logging  - CORS  - Validation - Rate Limit   │
├─────────────────────────────────────────────────┤
│         Routes & URL Dispatcher                  │
├─────────────────────────────────────────────────┤
│          Controllers (Request Handlers)          │
│         NewsController                          │
├─────────────────────────────────────────────────┤
│         Services (Business Logic)               │
│         NewsService                             │
├─────────────────────────────────────────────────┤
│        Database Layer                           │
│    DatabaseManager (SQLite Operations)          │
└─────────────────────────────────────────────────┘
```

## Project Structure

```
backend/
├── server.py              # Main HTTP server & orchestration
├── database.py            # Database connection & queries
├── models.py              # Data models & validation
├── services.py            # Business logic layer
├── controllers.py         # HTTP request handlers
├── routes.py              # URL routing configuration
├── middleware.py          # Cross-cutting concerns
├── utils.py               # Helper functions
├── ARCHITECTURE.md        # Detailed architecture docs
├── news.db                # SQLite database (auto-created)
├── cert.pem               # SSL certificate (auto-created)
└── key.pem                # SSL private key (auto-created)
```

## Layer Responsibilities

### 1. Server Layer (`server.py`)
- HTTP server lifecycle management
- Request/response orchestration
- SSL/TLS configuration
- Request pipeline execution
- Error handling at HTTP level

### 2. Routing Layer (`routes.py`)
- URL pattern matching
- Parameter extraction
- Route-to-controller mapping
- Query string parsing

### 3. Middleware Layer (`middleware.py`)
- CORS header handling
- Request logging
- Rate limiting
- Input validation
- Error formatting

### 4. Controller Layer (`controllers.py`)
- HTTP request parsing
- Request validation
- Service orchestration
- Response formatting
- Status code management

### 5. Service Layer (`services.py`)
- Business logic implementation
- Data validation
- Query orchestration
- Pagination
- Search & filtering

### 6. Database Layer (`database.py`)
- SQLite connection management
- Query execution
- Transaction management
- Connection pooling (singleton)

### 7. Model Layer (`models.py`)
- Data structure definition
- Validation rules
- Serialization/deserialization
- Type definitions

### 8. Utilities Layer (`utils.py`)
- JSON parsing/serialization
- String sanitization
- Dictionary utilities
- Validation helpers
- Response formatting

## API Endpoints

### News Management

#### GET /api/news
Get all news articles with pagination
```bash
curl https://localhost:8443/api/news?page=1&limit=10 \
  --insecure
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Article Title",
      "content": "Article content...",
      "author": "John Doe",
      "category": "Technology",
      "created_at": "2024-01-15 10:30:00",
      "updated_at": "2024-01-15 10:30:00"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

#### POST /api/news
Create a new news article
```bash
curl -X POST https://localhost:8443/api/news \
  --insecure \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Article",
    "content": "Article content here...",
    "author": "John Doe",
    "category": "Technology"
  }'
```

#### GET /api/news/{id}
Get specific news article
```bash
curl https://localhost:8443/api/news/1 \
  --insecure
```

#### PUT /api/news/{id}
Update news article
```bash
curl -X PUT https://localhost:8443/api/news/1 \
  --insecure \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "content": "Updated content...",
    "author": "Jane Doe",
    "category": "Business"
  }'
```

#### DELETE /api/news/{id}
Delete news article
```bash
curl -X DELETE https://localhost:8443/api/news/1 \
  --insecure
```

#### GET /api/news/search
Search news articles
```bash
curl 'https://localhost:8443/api/news/search?q=technology' \
  --insecure
```

Filter by category:
```bash
curl 'https://localhost:8443/api/news/search?category=Technology' \
  --insecure
```

#### GET /api/statistics
Get news statistics
```bash
curl https://localhost:8443/api/statistics \
  --insecure
```

Response:
```json
{
  "success": true,
  "data": {
    "total_articles": 5,
    "categories": {
      "Technology": 2,
      "Business": 1,
      "Other": 2
    }
  }
}
```

#### GET /api/health
Health check endpoint
```bash
curl https://localhost:8443/api/health \
  --insecure
```

## Configuration Guide

### Change Port
Edit `server.py` last line:
```python
if __name__ == '__main__':
    run_server(port=9000)  # Change from 8443 to desired port
```

### Disable HTTPS
Edit `server.py` last line:
```python
if __name__ == '__main__':
    run_server(use_ssl=False)
```

### Configure CORS
Edit `middleware.py`:
```python
class CORSMiddleware:
    ALLOWED_ORIGINS = ['http://localhost:3000', 'https://example.com']
    ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    ALLOWED_HEADERS = ['Content-Type', 'Authorization']
```

### Configure Rate Limiting
Edit `middleware.py`:
```python
class RateLimitMiddleware:
    def __init__(self):
        self.max_requests = 100  # requests per minute
        self.window = 60  # seconds
```

## Development Guide

### Adding a New Endpoint

1. **Add route in `routes.py`**:
```python
def create_router() -> Router:
    router = Router()
    router.add_get('/api/custom', CustomController.get_custom)
    return router
```

2. **Create controller in `controllers.py`**:
```python
class CustomController:
    @staticmethod
    def get_custom(query_params=None):
        # Handle request
        return (200, {'success': True, 'data': []})
```

3. **Add service logic in `services.py`** (if needed):
```python
class CustomService:
    @staticmethod
    def get_data():
        # Business logic
        pass
```

### Adding Middleware

1. Create middleware class in `middleware.py`:
```python
class CustomMiddleware:
    @staticmethod
    def process(request_data):
        # Process request
        return request_data
```

2. Call in `RequestHandler._handle_request()`:
```python
custom_middleware.process(...)
```

### Adding Database Operations

1. Add method to `NewsService` in `services.py`:
```python
@staticmethod
def new_operation():
    query = 'SELECT * FROM news WHERE condition'
    return db_manager.execute_query(query)
```

## Performance Optimization Tips

1. **Database Indexing**: Already added for `category` and `created_at`
2. **Pagination**: Always use pagination for large datasets
3. **Connection Pooling**: Handled by singleton DatabaseManager
4. **Query Optimization**: Use indexes in WHERE clauses
5. **Caching**: Can be added to service layer

## Security Best Practices

✓ All inputs are validated before use
✓ SQL injection prevented with parameterized queries
✓ HTTPS/SSL enabled by default
✓ CORS headers properly configured
✓ Rate limiting prevents abuse
✓ Error messages don't expose sensitive info

## Troubleshooting

### Certificate Warning
This is normal with self-signed certificates. Click "Advanced" and proceed.

### Port Already in Use
```bash
# Find process using port 8443
lsof -i :8443
# Kill process
kill -9 <PID>
```

### Database Locked
```bash
# Delete database and restart
rm backend/news.db
python3 backend/server.py
```

### Import Errors
Ensure all files are in the same directory:
```bash
ls backend/*.py
```

## Testing the API

### Create Test Data
```bash
curl -X POST https://localhost:8443/api/news \
  --insecure \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Article",
    "content": "This is a test article with sufficient content length",
    "author": "Test Author",
    "category": "Technology"
  }'
```

### Search Test Data
```bash
curl 'https://localhost:8443/api/news/search?q=test' \
  --insecure
```

### Check Statistics
```bash
curl https://localhost:8443/api/statistics \
  --insecure
```

## Deployment Considerations

### Production Deployment
1. Use proper SSL certificates (Let's Encrypt, etc.)
2. Configure firewall rules
3. Use environment variables for configuration
4. Set up monitoring and logging
5. Use process manager (systemd, supervisor)
6. Configure auto-restart on failure

### Docker Deployment
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY backend/ .
EXPOSE 8443
CMD ["python3", "server.py"]
```

### Systemd Service
Create `/etc/systemd/system/news-app.service`:
```ini
[Unit]
Description=News Management Application
After=network.target

[Service]
Type=simple
WorkingDirectory=/workspaces/Nms/backend
ExecStart=/usr/bin/python3 /workspaces/Nms/backend/server.py
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

## Monitoring

### Log Output
Server outputs logs to stdout:
```
[2026-02-04 14:29:16] GET    /api/news              - 127.0.0.1
[2026-02-04 14:29:16] GET    /api/news              -> 200 (5.23ms)
```

### Health Check
```bash
curl https://localhost:8443/api/health --insecure
```

## Next Steps

1. Implement authentication (JWT tokens)
2. Add database migrations
3. Create comprehensive test suite
4. Set up CI/CD pipeline
5. Add API documentation (Swagger/OpenAPI)
6. Implement caching layer
7. Add monitoring and alerting
8. Set up database backups
