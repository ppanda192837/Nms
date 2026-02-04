"""
Manage Media Controller - Handles media management operations
"""
from services.manage_media_service import ManageMediaService
from core.request import parse_multipart
from core.responses import ApiResponse
import os

class ManageMediaController:
    @staticmethod
    def get_all_media(query_params: dict = None) -> tuple:
        """GET /api/media - Get all media"""
        try:
            media_list = ManageMediaService.get_all_media()
            response = ApiResponse(success=True, data=media_list)
            return (200, response.to_dict())
            
        except Exception as e:
            response = ApiResponse(success=False, error=str(e))
            return (500, response.to_dict())
    
    @staticmethod
    def upload_media(body: bytes, query_params: dict = None) -> tuple:
        """POST /api/media - Upload media file"""
        try:
            parsed = parse_multipart(body)
            files = parsed.get('files', [])
            
            if not files:
                response = ApiResponse(success=False, error='No file uploaded')
                return (400, response.to_dict())
            
            # Ensure uploads directory exists
            frontend_root = os.path.join(os.path.dirname(__file__), '..', 'frontend')
            uploads_dir = os.path.join(frontend_root, 'uploads')
            os.makedirs(uploads_dir, exist_ok=True)
            
            saved_items = []
            for f in files:
                filename = f.get('filename')
                content = f.get('content') or b''
                mime_type = f.get('content_type') or 'application/octet-stream'
                
                # Make filename safe
                safe_name = filename.replace('..', '').replace('/', '').replace('\\', '')
                save_path = os.path.join(uploads_dir, safe_name)
                
                # Avoid overwriting
                base, ext = os.path.splitext(safe_name)
                counter = 1
                while os.path.exists(save_path):
                    safe_name = f"{base}_{counter}{ext}"
                    save_path = os.path.join(uploads_dir, safe_name)
                    counter += 1
                
                with open(save_path, 'wb') as out_f:
                    out_f.write(content)
                
                web_path = f"/uploads/{safe_name}"
                media_data = {
                    'filename': safe_name,
                    'filepath': web_path,
                    'mime_type': mime_type,
                    'size': len(content)
                }
                
                media_id = ManageMediaService.create_media(media_data)
                saved_items.append({'id': media_id, 'filename': safe_name, 'url': web_path})
            
            response = ApiResponse(success=True, data=saved_items, message='Uploaded')
            return (201, response.to_dict())
            
        except Exception as e:
            response = ApiResponse(success=False, error=str(e))
            return (500, response.to_dict())
    
    @staticmethod
    def delete_media(media_id: int, query_params: dict = None) -> tuple:
        """DELETE /api/media/{id} - Delete media"""
        try:
            success = ManageMediaService.delete_media(media_id)
            
            if not success:
                response = ApiResponse(success=False, error='Media not found')
                return (404, response.to_dict())
            
            response = ApiResponse(success=True, message='Media deleted')
            return (200, response.to_dict())
            
        except Exception as e:
            response = ApiResponse(success=False, error=str(e))
            return (500, response.to_dict())