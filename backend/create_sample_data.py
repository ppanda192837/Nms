#!/usr/bin/env python3
"""
Sample data script - Populate database with initial content
"""
import sys
import os
sys.path.append(os.path.dirname(__file__))

from database import db_manager
from models import News, Category
from services import NewsService, CategoryService

def create_sample_data():
    """Create sample categories and news articles"""
    
    # Initialize database
    db_manager.init_db()
    
    # Sample categories
    categories_data = [
        {"name": "Technology", "description": "Latest tech news and innovations"},
        {"name": "Business", "description": "Business and finance updates"},
        {"name": "Sports", "description": "Sports news and events"},
        {"name": "Health", "description": "Health and wellness articles"},
        {"name": "Entertainment", "description": "Entertainment and celebrity news"},
        {"name": "Politics", "description": "Political news and analysis"},
        {"name": "Science", "description": "Scientific discoveries and research"},
        {"name": "Travel", "description": "Travel guides and destinations"}
    ]
    
    # Create categories
    print("Creating sample categories...")
    for cat_data in categories_data:
        try:
            category = Category(name=cat_data["name"], description=cat_data["description"])
            CategoryService.create_category(category)
            print(f"✓ Created category: {cat_data['name']}")
        except Exception as e:
            print(f"✗ Failed to create category {cat_data['name']}: {e}")
    
    # Sample news articles
    news_data = [
        {
            "title": "Revolutionary AI Technology Transforms Healthcare",
            "content": "A groundbreaking artificial intelligence system has been developed that can diagnose diseases with unprecedented accuracy. The new technology uses advanced machine learning algorithms to analyze medical images and patient data, providing doctors with faster and more reliable diagnostic tools. Early trials show a 95% accuracy rate in detecting various conditions, potentially saving thousands of lives through early intervention.",
            "author": "Dr. Sarah Johnson",
            "category": "Technology"
        },
        {
            "title": "Global Markets Show Strong Recovery Signs",
            "content": "Financial markets worldwide are displaying robust recovery indicators following recent economic uncertainties. Major stock indices have gained significant ground, with technology and healthcare sectors leading the charge. Analysts predict continued growth as consumer confidence returns and businesses adapt to new market conditions. The recovery is attributed to innovative business models and increased digital adoption across industries.",
            "author": "Michael Chen",
            "category": "Business"
        },
        {
            "title": "Championship Finals Set Record Viewership",
            "content": "The recent championship finals broke all previous viewership records, with over 100 million viewers tuning in globally. The thrilling match showcased exceptional athletic performance and sportsmanship, captivating audiences worldwide. Social media engagement reached unprecedented levels, with fans sharing highlights and celebrating their favorite moments. The event's success demonstrates the unifying power of sports in bringing people together.",
            "author": "Emma Rodriguez",
            "category": "Sports"
        },
        {
            "title": "New Study Reveals Benefits of Mediterranean Diet",
            "content": "A comprehensive 10-year study involving 50,000 participants has confirmed the remarkable health benefits of the Mediterranean diet. Researchers found that individuals following this eating pattern showed a 30% reduction in cardiovascular disease risk and improved cognitive function. The diet, rich in olive oil, fish, vegetables, and whole grains, also demonstrated anti-inflammatory properties that may help prevent chronic diseases.",
            "author": "Dr. Maria Gonzalez",
            "category": "Health"
        },
        {
            "title": "Blockbuster Film Breaks Opening Weekend Records",
            "content": "The highly anticipated superhero film shattered box office records, earning over $200 million in its opening weekend. Audiences praised the stunning visual effects, compelling storyline, and outstanding performances by the star-studded cast. The film's success marks a triumphant return for theatrical releases and demonstrates the enduring appeal of well-crafted entertainment. Critics and fans alike are calling it a masterpiece of modern cinema.",
            "author": "James Wilson",
            "category": "Entertainment"
        },
        {
            "title": "Historic Climate Agreement Reached at Summit",
            "content": "World leaders have reached a landmark climate agreement at the international summit, committing to ambitious carbon reduction targets. The accord includes provisions for renewable energy investment, forest conservation, and support for developing nations in their transition to clean energy. Environmental groups have praised the agreement as a crucial step toward addressing climate change, while businesses are already planning sustainable initiatives.",
            "author": "Lisa Thompson",
            "category": "Politics"
        },
        {
            "title": "Scientists Discover New Species in Deep Ocean",
            "content": "Marine biologists have discovered several new species during a deep-sea expedition in the Pacific Ocean. The remarkable findings include bioluminescent fish, unique coral formations, and previously unknown microorganisms. These discoveries provide valuable insights into ocean biodiversity and the adaptations required for life in extreme environments. The research contributes to our understanding of marine ecosystems and their role in global climate regulation.",
            "author": "Dr. Robert Kim",
            "category": "Science"
        },
        {
            "title": "Sustainable Tourism Trends Reshape Travel Industry",
            "content": "The travel industry is experiencing a significant shift toward sustainable tourism practices. Travelers are increasingly choosing eco-friendly accommodations, supporting local communities, and seeking authentic cultural experiences. This trend has led to the development of new sustainable travel options, from carbon-neutral flights to community-based tourism initiatives. The industry's transformation reflects growing environmental awareness and desire for meaningful travel experiences.",
            "author": "Anna Martinez",
            "category": "Travel"
        },
        {
            "title": "Breakthrough in Quantum Computing Achieved",
            "content": "Researchers have achieved a major breakthrough in quantum computing, successfully demonstrating quantum supremacy in solving complex mathematical problems. The new quantum processor can perform calculations that would take traditional computers thousands of years to complete. This advancement opens up possibilities for revolutionary applications in cryptography, drug discovery, and artificial intelligence. The technology promises to transform multiple industries in the coming decades.",
            "author": "Dr. David Park",
            "category": "Technology"
        },
        {
            "title": "Startup Ecosystem Thrives Despite Challenges",
            "content": "The global startup ecosystem continues to show resilience and innovation despite economic uncertainties. Venture capital funding has reached new heights, with particular interest in fintech, healthtech, and sustainability-focused companies. Young entrepreneurs are leveraging technology to solve real-world problems, creating jobs and driving economic growth. The startup culture's adaptability and innovation mindset serve as catalysts for broader economic recovery.",
            "author": "Jennifer Lee",
            "category": "Business"
        }
    ]
    
    # Create news articles
    print("\nCreating sample news articles...")
    for news_item in news_data:
        try:
            news = News(
                title=news_item["title"],
                content=news_item["content"],
                author=news_item["author"],
                category=news_item["category"]
            )
            NewsService.create_news(news)
            print(f"✓ Created article: {news_item['title'][:50]}...")
        except Exception as e:
            print(f"✗ Failed to create article: {e}")
    
    print(f"\n🎉 Sample data creation completed!")
    print(f"📊 Created {len(categories_data)} categories and {len(news_data)} articles")

if __name__ == "__main__":
    create_sample_data()