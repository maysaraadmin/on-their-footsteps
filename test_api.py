#!/usr/bin/env python3
"""
Simple script to test API endpoints
"""

import requests
import json
import time

def test_endpoint(url, description):
    """Test a single endpoint"""
    try:
        print(f"\n🔍 Testing {description}: {url}")
        start_time = time.time()
        response = requests.get(url, timeout=10)
        end_time = time.time()
        
        print(f"✅ Status: {response.status_code}")
        print(f"⏱️  Response time: {(end_time - start_time):.2f}s")
        
        if response.headers.get('content-type', '').startswith('application/json'):
            try:
                data = response.json()
                print(f"📄 Response: {json.dumps(data, indent=2, ensure_ascii=False)}")
            except:
                print(f"📄 Response: {response.text}")
        else:
            print(f"📄 Response: {response.text[:200]}...")
            
        return response.status_code == 200
        
    except requests.exceptions.Timeout:
        print(f"❌ Timeout after 10 seconds")
        return False
    except requests.exceptions.ConnectionError:
        print(f"❌ Connection error")
        return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def main():
    print("🚀 Testing API Endpoints")
    print("=" * 50)
    
    endpoints = [
        ("http://localhost:8000/api/health", "Backend Health Check"),
        ("http://localhost:8000/api/content/categories", "Categories Endpoint"),
        ("http://localhost:8000/api/content/featured/general", "Featured Characters"),
        ("http://localhost:8000/api/characters", "Characters List"),
        ("http://localhost:3000/api/health", "Frontend Proxy to Health"),
        ("http://localhost:3000/api/content/categories", "Frontend Proxy to Categories"),
    ]
    
    results = []
    for url, description in endpoints:
        success = test_endpoint(url, description)
        results.append((description, success))
        time.sleep(1)  # Wait between requests
    
    print("\n" + "=" * 50)
    print("📊 SUMMARY")
    print("=" * 50)
    
    for description, success in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {description}")
    
    passed = sum(1 for _, success in results if success)
    total = len(results)
    print(f"\n🎯 Overall: {passed}/{total} tests passed")

if __name__ == "__main__":
    main()
