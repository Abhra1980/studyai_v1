"""Debug script to test LLM service directly."""
import asyncio
from app.config import settings
from app.services.llm_service import generate_lesson

async def test():
    try:
        result = await generate_lesson(
            main_topic="STATISTICS FOR AI & MACHINE LEARNING",
            unit_name="Unit 1: Statistical Foundations",
            topic_title="1.1 Meaning, Scope & Role of Statistics",
            sub_topics=[
                "Definition and scope of statistics as a discipline",
                "Descriptive vs. inferential statistics",
                "Role of statistics in scientific research and data-driven decision making",
                "Historical evolution from census data to modern data science"
            ],
            user_level="beginner",
            focus_areas=[],
            include_code=True,
            include_quiz=False,
        )
        print("Success!")
        print(f"Keys: {list(result.keys())}")
        print(f"Model: {result.get('model_used')}")
    except Exception as e:
        print(f"Error: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test())
