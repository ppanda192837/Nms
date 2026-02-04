# News Management Web App

A full-stack news management application built with modular Python backend and modern JavaScript frontend architecture.

## Features

✨ **Complete CRUD Operations**
- Create, Read, Update, and Delete news articles
- Category and media management
- SQLite database with organized queries

🎨 **Modern UI**
- Responsive design with Tailwind CSS
- Dark/Light theme support
- Grid and List view modes
- Single Page Application (SPA) architecture

🔍 **Advanced Functionality**
- Real-time search and filtering
- Pagination support
- Media upload and management
- Export functionality

🏗️ **Modular Architecture**
- Layered backend (Controllers, Services, Database)
- Component-based frontend
- Separation of concerns
- Easy to maintain and extend

## Project Structure

```
Nms/
├── server.py                    # Main application entry point
├── router.py                    # URL routing configuration
├── controllers/                 # Business logic controllers
│   ├── create_article.py
│   ├── manage_article.py
│   ├── manage_category.py
│   └── manage_media.py
├── services/                    # Service layer for data operations
│   ├── create_article_service.py
│   ├── manage_article_service.py
│   ├── manage_category_service.py
│   └── manage_media_service.py
├── database/                    # Database connection and queries
│   ├── connection.py
│   └── queries.py
├── core/                        # Core utilities and middleware
│   ├── middleware.py
│   ├── request.py
│   ├── responses.py
│   └── static.py
├── frontend/                    # Frontend application
│   ├── pages/                   # HTML pages
│   │   ├── index.html          # Main layout with navigation
│   │   ├── home.html           # Dashboard with statistics
│   │   ├── admin.html          # Admin management
│   │   ├── articles.html       # Article management
│   │   ├── latest news.html    # Latest news feed
│   │   ├── categories.html     # Category management
│   │   └── 404.html           # Error page
│   ├── assets/
│   │   ├── css/
│   │   │   └── style.css       # Dark and light theme with animations
│   │   └── js/
│   │       ├── app.js          # Main application entry
│   │       ├── components/     # Reusable UI components
│   │       ├── controllers/    # Page controllers
│   │       ├── router/         # Frontend routing
│   │       ├── services/       # API services
│   │       ├── state/          # State management
│   │       └── utils/          # Utilities (theme, toast, export, etc.)
│   └── env.js                  # Environment configuration
├── tests/                      # Unit and integration tests
│   ├── test_api_smoke.py
│   └── test_db_basic.py
└── README.md
```

## Requirements

- Python 3.7+
- OpenSSL (for generating SSL certificates)
- Modern web browser (Chrome, Firefox, Safari, Edge)

## Installation & Setup

### 1. Generate SSL Certificates

The server will auto-generate self-signed certificates if they don't exist:

```bash
cd backend
openssl req -new -x509 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/CN=localhost"
```

### 2. Start the Server

```bash
python3 server.py
```

The server will start on `https://localhost:8443` and display:
```
News Management Server running on https://localhost:8443
Press Ctrl+C to stop the server
```

### 3. Access the Application

Open your web browser and navigate to:
```
https://localhost:8443
```

**Note:** You may see a security warning because we're using a self-signed certificate. Click "Advanced" and proceed to the site.

## Architecture Overview

### Backend Architecture

**Layered Architecture Pattern:**

1. **Controllers Layer** (`controllers/`)
   - Handle HTTP requests and responses
   - Input validation and error handling
   - Delegate business logic to services

2. **Services Layer** (`services/`)
   - Business logic implementation
   - Data validation and processing
   - Coordinate between controllers and database

3. **Database Layer** (`database/`)
   - Database connection management
   - SQL queries and data access
   - Data persistence operations

4. **Core Layer** (`core/`)
   - Middleware and request handling
   - Response formatting
   - Static file serving
   - Common utilities

### Frontend Architecture

**Single Page Application (SPA) with Module Pattern:**

1. **Router** (`router/`)
   - Client-side routing
   - Dynamic page loading
   - Navigation management

2. **Controllers** (`controllers/`)
   - Page-specific logic
   - Event handling
   - Data binding

3. **Services** (`services/`)
   - API communication
   - Data fetching and caching
   - Error handling

4. **State Management** (`state/`)
   - Application state
   - Data synchronization
   - Event-driven updates

5. **Utilities** (`utils/`)
   - Theme management
   - Toast notifications
   - Export functionality
   - Skeleton loading

## API Endpoints

### Articles
- `GET /api/articles` - Get all articles (paginated)
- `GET /api/articles/{id}` - Get specific article
- `POST /api/articles` - Create new article
- `PUT /api/articles/{id}` - Update article
- `DELETE /api/articles/{id}` - Delete article
- `GET /api/articles/search` - Search articles

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category
- `GET /api/categories/{id}` - Get specific category
- `PUT /api/categories/{id}` - Update category
- `DELETE /api/categories/{id}` - Delete category

### Media
- `GET /api/media` - Get all media files
- `POST /api/media` - Upload media files
- `DELETE /api/media/{id}` - Delete media file

### Statistics & Pages
- `GET /api/statistics` - Get system statistics
- `GET /api/pages/home` - Get home page data
- `GET /api/pages/latest` - Get latest news
- `GET /api/health` - Health check

## Database Schema

```sql
-- Articles table
CREATE TABLE news (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT,
  category TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Media table
CREATE TABLE media (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL,
  filepath TEXT NOT NULL,
  mime_type TEXT,
  size INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Features Details

### Frontend Features
- **Dark/Light Theme**: Toggle between themes with persistence
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Search**: Instant search with debouncing
- **Pagination**: Efficient data loading with pagination
- **Modal Forms**: Create and edit articles/categories
- **Toast Notifications**: User feedback for actions
- **Export Functionality**: Export data as JSON/CSV
- **Skeleton Loading**: Smooth loading states

### Backend Features
- **Modular Architecture**: Clean separation of concerns
- **Error Handling**: Comprehensive error handling and logging
- **CORS Support**: Cross-origin request support
- **File Upload**: Multipart form data handling
- **Search**: Full-text search across articles
- **Statistics**: Real-time system statistics

## Testing

### Run Database Tests
```bash
cd tests
python3 test_db_basic.py
```

### Run API Smoke Tests
```bash
# Start the server first
python3 server.py

# In another terminal
cd tests
python3 test_api_smoke.py
```

## Development

### Adding New Features

1. **Backend**: Add controller → service → database query
2. **Frontend**: Add page → controller → service call
3. **Update router**: Add new routes in both backend and frontend

### Customization

- **Themes**: Modify `frontend/assets/css/style.css`
- **Configuration**: Update `frontend/env.js`
- **Database**: Extend queries in `database/queries.py`
- **API**: Add endpoints in controllers and router

## Browser Compatibility

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Security Features

- HTTPS with SSL certificates
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CORS configuration
- File upload security

## Performance Features

- Pagination for large datasets
- Debounced search
- Lazy loading
- Efficient database queries
- Static file caching
- Minimal JavaScript bundles

## Troubleshooting

### Server Issues
- Ensure Python 3.7+ is installed
- Check if port 8443 is available
- Verify SSL certificates are generated

### Database Issues
- Check file permissions for SQLite database
- Ensure database directory is writable
- Run database tests to verify functionality

### Frontend Issues
- Clear browser cache
- Check browser console for JavaScript errors
- Verify all static files are loading correctly

## License

MIT License - Feel free to use and modify as needed.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## Support

For issues and questions, please check the troubleshooting section or create an issue in the repository.