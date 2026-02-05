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
    """A small multipart/form-data parser.

    Returns a dict with 'fields' and 'files'. Each file entry is a dict with
    keys: filename, content_type, content (bytes).
    This implementation expects the body to start with the boundary line
    (which is how multipart bodies are delivered) and uses CRLF separators.
    """
    result = {'fields': {}, 'files': []}
    if not body:
        return result

    try:
        # Find first CRLF to get the first line which should be the boundary
        first_crlf = body.find(b"\r\n")
        if first_crlf == -1:
            return result
        first_line = body[:first_crlf]

        # Boundary line usually starts with '--', strip it if present
        if first_line.startswith(b'--'):
            boundary = first_line[2:]
        else:
            boundary = first_line

        parts = body.split(b'--' + boundary)
        for part in parts:
            part = part.strip(b'\r\n')
            if not part or part == b'--':
                continue

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
                try:
                    value = content.decode('utf-8')
                except Exception:
                    value = ''
                if name:
                    result['fields'][name] = value

    except Exception:
        return result

    return result