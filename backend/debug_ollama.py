#!/usr/bin/env python
"""Debug script to test Ollama LLM configuration - no Unicode."""
import asyncio
import sys
import os

# Set encoding
os.environ['PYTHONIOENCODING'] = 'utf-8'

from app.config import settings

print("=== OLLAMA CONFIGURATION ===")
print(f"LLM Provider: {settings.LLM_PROVIDER}")
print(f"Ollama API Key: {settings.OLLAMA_API_KEY[:20]}..." if settings.OLLAMA_API_KEY else "Ollama API Key: (empty)")
print(f"Ollama Base URL: {settings.LLM_BASE_URL}")
print(f"Ollama Model: {settings.LLM_MODEL}")

print("\n=== TESTING OLLAMA CONNECTION ===")
try:
    from app.services.llm_service import _get_llm
    
    llm = _get_llm()
    print("OK: LLM Client created successfully")
    print(f"   Model: {llm.model_name}")
    
except Exception as e:
    print(f"ERROR: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\n=== TESTING LLM GENERATION ===")
async def test_llm():
    try:
        from app.services.llm_service import generate_lesson
        
        print("Sending request to Ollama...")
        result = await generate_lesson(
            main_topic="Python Programming",
            unit_name="Basics",
            topic_title="Variables and Data Types",
            sub_topics=["String type", "Integer type"],
            user_level="beginner",
        )
        
        print("OK: LLM Response received!")
        print(f"   Keys: {list(result.keys())}")
        print(f"   Explanation length: {len(result.get('explanation', ''))}")
        
    except Exception as e:
        print(f"ERROR: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

print("\nStarting async test...")
asyncio.run(test_llm())
print("\nAll tests passed!")

