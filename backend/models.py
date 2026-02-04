"""
Models - Data models for the application
"""
from typing import Optional, Dict, Any
from dataclasses import dataclass, asdict
from datetime import datetime


@dataclass
class News:
    """News article model"""
    title: str
    content: str
    author: Optional[str] = None
    category: Optional[str] = None
    id: Optional[int] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert model to dictionary"""
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'author': self.author,
            'category': self.category,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }
    
    @staticmethod
    def from_dict(data: Dict[str, Any]) -> 'News':
        """Create model from dictionary"""
        return News(
            id=data.get('id'),
            title=data.get('title'),
            content=data.get('content'),
            author=data.get('author'),
            category=data.get('category'),
            created_at=data.get('created_at'),
            updated_at=data.get('updated_at')
        )
    
    def validate(self) -> tuple[bool, Optional[str]]:
        """Validate news article"""
        if not self.title or not self.title.strip():
            return False, "Title is required"
        
        if not self.content or not self.content.strip():
            return False, "Content is required"
        
        if len(self.title.strip()) < 3:
            return False, "Title must be at least 3 characters"
        
        if len(self.content.strip()) < 10:
            return False, "Content must be at least 10 characters"
        
        return True, None


@dataclass
class Category:
    """Category model"""
    name: str
    description: Optional[str] = None
    slug: Optional[str] = None
    id: Optional[int] = None
    created_at: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert model to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'slug': self.slug,
            'created_at': self.created_at
        }
    
    @staticmethod
    def from_dict(data: Dict[str, Any]) -> 'Category':
        """Create model from dictionary"""
        return Category(
            id=data.get('id'),
            name=data.get('name'),
            description=data.get('description'),
            slug=data.get('slug'),
            created_at=data.get('created_at')
        )
    
    def validate(self) -> tuple[bool, Optional[str]]:
        """Validate category"""
        if not self.name or not self.name.strip():
            return False, "Category name is required"
        
        if len(self.name.strip()) < 2:
            return False, "Category name must be at least 2 characters"
        
        return True, None


@dataclass
class Media:
    """Media file model"""
    filename: str
    filepath: str
    mime_type: Optional[str] = None
    size: Optional[int] = None
    id: Optional[int] = None
    uploaded_at: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert model to dictionary"""
        return {
            'id': self.id,
            'filename': self.filename,
            'filepath': self.filepath,
            'mime_type': self.mime_type,
            'size': self.size,
            'uploaded_at': self.uploaded_at
        }
    
    @staticmethod
    def from_dict(data: Dict[str, Any]) -> 'Media':
        """Create model from dictionary"""
        return Media(
            id=data.get('id'),
            filename=data.get('filename'),
            filepath=data.get('filepath'),
            mime_type=data.get('mime_type'),
            size=data.get('size'),
            uploaded_at=data.get('uploaded_at')
        )


@dataclass
class ApiResponse:
    """Standard API response model"""
    success: bool
    data: Optional[Any] = None
    error: Optional[str] = None
    message: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        result = {
            'success': self.success
        }
        if self.data is not None:
            result['data'] = self.data
        if self.error is not None:
            result['error'] = self.error
        if self.message is not None:
            result['message'] = self.message
        return result


@dataclass
class PaginatedResponse:
    """Paginated API response model"""
    success: bool
    data: list
    total: int
    page: int
    limit: int
    pages: int
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            'success': self.success,
            'data': self.data,
            'pagination': {
                'total': self.total,
                'page': self.page,
                'limit': self.limit,
                'pages': self.pages
            }
        }
