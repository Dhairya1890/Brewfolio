import asyncio
import os
import sys

# Add the backend dir to path so we can import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.ai_service import generate_profile_content, or_client
from app.models.profile import RawScrapedData

async def test_openrouter():
    print("Testing OpenRouter API directly...")
    try:
        completion = await or_client.chat.completions.create(
            model="google/gemini-2.0-flash-exp:free",
            messages=[{"role": "user", "content": "Hello, this is a test! Reply with 'OK'."}],
            max_tokens=10,
        )
        print("OpenRouter status: SUCCESS")
        print("Response:", completion.choices[0].message.content)
    except Exception as e:
        print("OpenRouter status: ERROR")
        print(e)
        return

    print("\nTesting fallback logic by monkeypatching the Google client to raise a 429 error...")
    import google.api_core.exceptions
    from app.services import ai_service
    
    # Mock the google client to raise an exception with "429" in it
    class MockClient:
        class MockModels:
            def generate_content(self, *args, **kwargs):
                raise Exception("429 Too Many Requests: Rate limit exceeded")
        models = MockModels()
    
    # Save original
    original_client = ai_service.client
    ai_service.client = MockClient()
    
    raw_data = RawScrapedData(
        github={"name": "Test User", "repos": []},
        leetcode={},
        codeforces={},
        atcoder={},
        codechef={}
    )
    
    try:
        result = await generate_profile_content(raw_data, "personal_brand", "")
        print("Profile generated via fallback:", result)
        if result.get("name") != "Developer": # meaning it didn't hit the ultimate fallback structure
            print("Fallback to OpenRouter: SUCCESS")
        else:
            print("Fallback returned ultimate fallback structure! It might have failed.")
    except Exception as e:
        print("Fallback test failed:", e)
    finally:
        ai_service.client = original_client

if __name__ == "__main__":
    asyncio.run(test_openrouter())
