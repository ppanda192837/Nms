#!/usr/bin/env python3
"""
API Smoke Tests - Basic functionality tests
"""
import requests
import json
import sys

class ApiSmokeTest:
    def __init__(self, base_url='https://localhost:8443'):
        self.base_url = base_url
        self.session = requests.Session()
        # Disable SSL verification for self-signed certificates
        self.session.verify = False
        
    def test_health_check(self):
        """Test health check endpoint"""
        try:
            response = self.session.get(f'{self.base_url}/api/health')
            assert response.status_code == 200
            data = response.json()
            assert data['success'] == True
            print("✓ Health check passed")
            return True
        except Exception as e:
            print(f"✗ Health check failed: {e}")
            return False
    
    def test_get_articles(self):
        """Test get articles endpoint"""
        try:
            response = self.session.get(f'{self.base_url}/api/articles')
            assert response.status_code == 200
            data = response.json()
            assert data['success'] == True
            print("✓ Get articles passed")
            return True
        except Exception as e:
            print(f"✗ Get articles failed: {e}")
            return False
    
    def test_create_article(self):
        """Test create article endpoint"""
        try:
            article_data = {
                'title': 'Test Article',
                'content': 'This is a test article content',
                'author': 'Test Author',
                'category': 'Test'
            }
            
            response = self.session.post(
                f'{self.base_url}/api/articles',
                json=article_data,
                headers={'Content-Type': 'application/json'}
            )
            
            assert response.status_code == 201
            data = response.json()
            assert data['success'] == True
            assert 'id' in data['data']
            
            # Store the ID for cleanup
            self.test_article_id = data['data']['id']
            print("✓ Create article passed")
            return True
        except Exception as e:
            print(f"✗ Create article failed: {e}")
            return False
    
    def test_get_categories(self):
        """Test get categories endpoint"""
        try:
            response = self.session.get(f'{self.base_url}/api/categories')
            assert response.status_code == 200
            data = response.json()
            assert data['success'] == True
            print("✓ Get categories passed")
            return True
        except Exception as e:
            print(f"✗ Get categories failed: {e}")
            return False
    
    def test_get_statistics(self):
        """Test get statistics endpoint"""
        try:
            response = self.session.get(f'{self.base_url}/api/statistics')
            assert response.status_code == 200
            data = response.json()
            assert data['success'] == True
            print("✓ Get statistics passed")
            return True
        except Exception as e:
            print(f"✗ Get statistics failed: {e}")
            return False
    
    def cleanup(self):
        """Clean up test data"""
        if hasattr(self, 'test_article_id'):
            try:
                response = self.session.delete(f'{self.base_url}/api/articles/{self.test_article_id}')
                if response.status_code == 200:
                    print("✓ Test data cleaned up")
            except Exception as e:
                print(f"✗ Cleanup failed: {e}")
    
    def run_all_tests(self):
        """Run all smoke tests"""
        print("Running API Smoke Tests...")
        print("-" * 40)
        
        tests = [
            self.test_health_check,
            self.test_get_articles,
            self.test_create_article,
            self.test_get_categories,
            self.test_get_statistics
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            if test():
                passed += 1
        
        print("-" * 40)
        print(f"Results: {passed}/{total} tests passed")
        
        # Cleanup
        self.cleanup()
        
        return passed == total

if __name__ == '__main__':
    # Suppress SSL warnings
    import urllib3
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
    
    tester = ApiSmokeTest()
    success = tester.run_all_tests()
    
    sys.exit(0 if success else 1)