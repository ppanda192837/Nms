# Backend Architecture Documentation

## Overview

The backend is built using a modular, layered architecture that separates concerns and promotes maintainability, scalability, and testability. The application follows industry best practices with clear separation of concerns across multiple layers.

## Architecture Layers

### 1. **Database Layer** (`database.py`)
Manages all SQLite database operations with connection pooling and singleton pattern.

**Key Features:**
- Singleton pattern for database manager
- Context manager for connection management
- Thread-safe operations
- Indexed queries for performance
- Connection pooling and resource management

**Main Classes:**
- `DatabaseManager`: Singleton instance managing all DB operations
  - `init_db()`: Initialize database tables and indexes
  - `get_connection()`: Context manager for DB connections
  - `execute_query()`: Execute SELECT queries
  - `execute_update()`: Execute INSERT/UPDATE/DELETE queries
  - `execute_insert()`: Execute INSERT and return last ID
  - `fetch_one()`: Fetch single row

**Database Schema:**
```sql
CREATE TABLE news (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT,
  category TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

### 2. **Models Layer** (`models.py`)
Defines data structures and response formats using dataclasses.

**Key Classes:**
- `News`: Data model for news articles
  - Methods: `to_dict()`, `from_dict()`, `validate()`
  - Fields: id, title, content, author, category, created_at, updated_at

- `ApiResponse`: Standard API response format
  - Fields: success, data, error, message
  - Method: `to_dict()`

- `PaginatedResponse`: Paginated data response
  - Includes pagination metadata

### 3. **Service Layer** (`services.py`)
Contains business logic and data operations. Implements repository pattern.

**Key Features:**
- Complete CRUD operations
- Search and filtering functionality
- Pagination support
- Statistics generation
- Data validation

**Main Class: `NewsService`**
Methods:
- `create_news()`: Create new article with validation
- `get_news_by_id()`: Retrieve single article
- `get_all_news()`: Get all articles with pagination
- `get_news_by_category()`: Filter by category
- `search_news()`: Full-text search
- `update_news()`: Update article
- `delete_news()`: Delete article
- `get_paginated_news()`: Paginated results
- `get_statistics()`: Generate statistics

### 4. **Controllers Layer** (`controllers.py`)
HTTP request handlers that orchestrate service layer calls.

**Key Features:**
- Request parsing and validation
- HTTP status code management
- Error handling and responses
- Response formatting

**Main Class: `NewsController`**
Methods:
- `create_news()`: POST handler
- `get_all_news()`: GET all with pagination
- `get_news_by_id()`: GET single
- `update_news()`: PUT handler
- `delete_news()`: DELETE handler
- `search_news()`: Search handler
- `get_statistics()`: Statistics handler

### 5. **Routing Layer** (`routes.py`)
URL route mapping and request dispatching.

**Key Features:**
- Pattern-based routing with parameter extraction
- Regex-based route matching
- Query string parsing
- RESTful endpoint configuration

**Main Classes:**
- `Route`: Individual route definition
- `Router`: Route registry and dispatcher
- `create_router()`: Factory function to configure routes

**Configured Routes:**
```
GET    /api/news                - Get all articles
POST   /api/news                - Create article
GET    /api/news/search         - Search articles
GET    /api/news/{id}           - Get specific article
PUT    /api/news/{id}           - Update article
DELETE /api/news/{id}           - Delete article
GET    /api/statistics          - Get statistics
GET    /api/health              - Health check
GET    /                        - Serve frontend
```

### 6. **Middleware Layer** (`middleware.py`)
Cross-cutting concerns and request/response processing.

**Components:**

**LoggingMiddleware**
- Logs all HTTP requests and responses
- Includes timing information
- Formats: `[TIMESTAMP] METHOD PATH - CLIENT`

**CORSMiddleware**
- Handles CORS headers
- Configurable allowed origins and methods
- Processes OPTIONS preflight requests

**ErrorMiddleware**
- Centralized error handling
- HTTP status code responses
- Error message formatting

**ValidationMiddleware**
- Content-Type validation
- Content-Length validation
- Request size limits

**RateLimitMiddleware**
- Per-client rate limiting
- Configurable request windows
- 429 Too Many Requests responses

**AuthenticationMiddleware**
- Placeholder for future authentication
- Token validation hooks
- Route protection mechanisms

### 7. **Utilities Layer** (`utils.py`)
Common helper functions and utilities.

**Key Functions:**
- `parse_json()`: JSON parsing with error handling
- `to_json()`: JSON serialization
- `get_query_param()`: Query parameter extraction
- `sanitize_string()`: Input sanitization
- `format_response_headers()`: HTTP header formatting
- `paginate_list()`: List pagination
- `is_valid_email()`, `is_valid_url()`: Validation helpers
- `merge_dicts()`, `filter_dict()`: Dictionary utilities

### 8. **Main Server** (`server.py`)
Orchestrates all layers and handles HTTP server lifecycle.

**Key Features:**
- RequestHandler class extending BaseHTTPRequestHandler
- Modular request handling pipeline
- SSL/TLS configuration
- Database initialization
- Router initialization
- Comprehensive logging
- Error handling at HTTP level

**Request Pipeline:**
1. Log incoming request
2. Check rate limiting
3. Extract path and query params
4. Route dispatch
5. Validate content
6. Read request body
7. Call appropriate handler
8. Send formatted response
9. Log response

## Request Flow Diagram

```
HTTP Request
    ↓
[Server] - Logging Middleware
    ↓
[Server] - Rate Limiting Check
    ↓
[Routes] - Route Matching
    ↓
[Controllers] - Request Handler
    ↓
[Services] - Business Logic
    ↓
[Database] - Data Operations
    ↓
[Models] - Response Formatting
    ↓
[Middleware] - Response Processing (CORS, etc.)
    ↓
HTTP Response
```

## Data Flow Example: Create News

```
POST /api/news { title, content, author, category }
    ↓
[RequestHandler._handle_request()]
    - Parse body
    - Route dispatch
    ↓
[NewsController.create_news()]
    - Parse JSON
    - Create News model
    - Validate data
    ↓
[NewsService.create_news()]
    - Validate news object
    - Execute INSERT query
    - Return news ID
    ↓
[RequestHandler._send_response()]
    - Format response
    - Add CORS headers
    - Send JSON
    ↓
{ success: true, data: { id: 1 }, message: "..." }
```

## Key Design Patterns

1. **Singleton Pattern**: DatabaseManager ensures single database connection pool
2. **Factory Pattern**: `create_router()` factory creates and configures routes
3. **Repository Pattern**: NewsService acts as data access abstraction
4. **Middleware Pipeline**: Layered request/response processing
5. **Context Manager**: Database connections managed with context managers

## Configuration

### Database
- File: `news.db` (SQLite)
- Location: Backend directory
- Auto-initialization on server startup
- Indexed on category and created_at for performance

### Server
- Default port: 8443 (HTTPS)
- Host: localhost
- SSL: Self-signed certificates auto-generated
- Request timeout: Default HTTP server settings

### CORS
- Allowed origins: `*` (all origins)
- Allowed methods: GET, POST, PUT, DELETE, OPTIONS
- Allowed headers: Content-Type, Authorization

### Rate Limiting
- Max requests: 100 per minute per client
- Window: 60 seconds
- Response: 429 Too Many Requests

### Validation
- Max content length: 10 MB
- JSON parsing: UTF-8 encoded
- Input sanitization: Whitespace trimming, length limiting

## Error Handling

### HTTP Status Codes
- 200: OK - Successful GET/PUT
- 201: Created - Successful POST
- 400: Bad Request - Invalid input
- 404: Not Found - Resource not found
- 405: Method Not Allowed - Invalid HTTP method
- 429: Too Many Requests - Rate limited
- 500: Internal Server Error - Unexpected error

### Response Format
```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2024-01-15T10:30:00"
}
```

## Extension Points

### Adding New Controllers
1. Create new class in `controllers.py`
2. Implement handler methods
3. Register routes in `create_router()`

### Adding New Middleware
1. Create middleware class in `middleware.py`
2. Implement processing logic
3. Call in `RequestHandler._handle_request()`

### Adding New Services
1. Create new class in `services.py`
2. Implement business logic
3. Call from controllers

### Adding Database Tables
1. Add table creation to `DatabaseManager.init_db()`
2. Create corresponding model in `models.py`
3. Implement service layer methods

## Testing Strategy

### Unit Tests
- Test individual service methods
- Test model validation
- Test utility functions

### Integration Tests
- Test controller-service interaction
- Test database operations
- Test routing

### End-to-End Tests
- Test HTTP endpoints
- Test complete workflows
- Test error scenarios

## Performance Considerations

1. **Database Indexing**: Indexes on frequently queried columns
2. **Connection Pooling**: Single database manager instance
3. **Pagination**: Limit results for large datasets
4. **Caching**: Can be added to service layer
5. **Query Optimization**: Prepared statements via tuple params

## Security Considerations

1. **HTTPS**: SSL/TLS encryption
2. **Input Validation**: All inputs validated
3. **SQL Injection**: Prepared statements prevent injection
4. **CORS**: Configurable origin restrictions
5. **Rate Limiting**: Prevents abuse
6. **Error Messages**: Sanitized error responses

## Future Enhancements

1. **Authentication**: JWT token support
2. **Authorization**: Role-based access control
3. **Caching**: Redis/Memcached integration
4. **Logging**: File-based logging with rotation
5. **Monitoring**: Prometheus metrics
6. **API Documentation**: OpenAPI/Swagger specs
7. **Database Migrations**: Version control for schema
8. **Testing**: Comprehensive test suite
9. **Docker**: Containerization
10. **Async Operations**: Async request handling

## File Organization

```
backend/
├── server.py           # Main server and HTTP handler
├── database.py         # Database layer
├── models.py           # Data models
├── services.py         # Business logic
├── controllers.py      # Request handlers
├── routes.py           # URL routing
├── middleware.py       # Cross-cutting concerns
├── utils.py            # Utility functions
├── news.db             # SQLite database (auto-created)
├── cert.pem            # SSL certificate (auto-created)
└── key.pem             # SSL private key (auto-created)
```

## Dependencies

- Python 3.7+
- Built-in libraries only:
  - http.server
  - ssl
  - sqlite3
  - json
  - re
  - threading
  - dataclasses
  - contextlib

No external dependencies required!
