"""LLM Orchestrator – LangChain + OpenRouter integration with streaming."""

import json
import logging
from collections.abc import AsyncGenerator

from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage

from app.config import settings
from app.services.prompt_templates import build_more_context_prompt, build_quiz_prompt, build_teach_prompt

logger = logging.getLogger(__name__)


def _get_llm(streaming: bool = False, temperature: float = 0.7) -> ChatOpenAI:
    """Create a ChatOpenAI instance configured for the active LLM provider."""
    kwargs = {
        "model": settings.LLM_MODEL,
        "temperature": temperature,
        "streaming": streaming,
        "max_tokens": 8192,  # Higher for 10-20 quiz questions per sub-topic
    }
    
    # Set API key based on provider
    if settings.LLM_PROVIDER == "ollama":
        # Use Ollama API key if provided, otherwise use dummy key for local
        kwargs["api_key"] = settings.OLLAMA_API_KEY or "no-key-required"
    else:
        kwargs["api_key"] = settings.LLM_API_KEY
    
    if settings.LLM_BASE_URL:
        kwargs["base_url"] = settings.LLM_BASE_URL
    
    return ChatOpenAI(**kwargs)


def _messages_to_langchain(messages: list[dict[str, str]]):
    """Convert dict messages to LangChain message objects."""
    lc_messages = []
    for msg in messages:
        if msg["role"] == "system":
            lc_messages.append(SystemMessage(content=msg["content"]))
        else:
            lc_messages.append(HumanMessage(content=msg["content"]))
    return lc_messages


async def generate_lesson(
    main_topic: str,
    unit_name: str,
    topic_title: str,
    sub_topics: list[str],
    user_level: str = "beginner",
    focus_areas: list[str] | None = None,
    include_code: bool = True,
    include_quiz: bool = True,
) -> dict:
    """Generate a complete lesson (non-streaming). Returns parsed JSON dict."""
    messages = build_teach_prompt(
        main_topic=main_topic,
        unit_name=unit_name,
        topic_title=topic_title,
        sub_topics=sub_topics,
        user_level=user_level,
        focus_areas=focus_areas,
        include_code=include_code,
        include_quiz=include_quiz,
    )
    llm = _get_llm(streaming=False)
    lc_messages = _messages_to_langchain(messages)

    logger.info("Generating lesson for: %s", topic_title)
    response = await llm.ainvoke(lc_messages)

    # Parse JSON from response
    content = response.content.strip()
    # Remove markdown code fence if present
    if content.startswith("```"):
        content = content.split("\n", 1)[1]  # remove first line
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()

    try:
        result = json.loads(content)
    except json.JSONDecodeError:
        logger.warning("LLM returned non-JSON response, wrapping in explanation field.")
        result = {"explanation": content, "key_points": [], "code_examples": [], "quiz": []}

    result["model_used"] = settings.LLM_MODEL
    return result


async def generate_more_context(
    topic_title: str,
    existing_explanation: str,
    user_question: str,
) -> dict:
    """Generate additional context based on user's follow-up question. Returns {explanation, code_examples}."""
    messages = build_more_context_prompt(
        topic_title=topic_title,
        existing_explanation=existing_explanation,
        user_question=user_question,
    )
    llm = _get_llm(streaming=False)
    lc_messages = _messages_to_langchain(messages)

    logger.info("Generating more context for: %s (question: %s)", topic_title, user_question[:50])
    response = await llm.ainvoke(lc_messages)

    content = response.content.strip()
    if content.startswith("```"):
        content = content.split("\n", 1)[1]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()

    try:
        result = json.loads(content)
    except json.JSONDecodeError:
        logger.warning("LLM returned non-JSON for more context, wrapping in explanation.")
        result = {"explanation": content, "code_examples": []}

    if "explanation" not in result:
        result["explanation"] = content
    if "code_examples" not in result:
        result["code_examples"] = []
    return result


async def stream_lesson(
    main_topic: str,
    unit_name: str,
    topic_title: str,
    sub_topics: list[str],
    user_level: str = "beginner",
    focus_areas: list[str] | None = None,
    include_code: bool = True,
    include_quiz: bool = True,
) -> AsyncGenerator[str, None]:
    """Stream lesson content token-by-token via SSE."""
    messages = build_teach_prompt(
        main_topic=main_topic,
        unit_name=unit_name,
        topic_title=topic_title,
        sub_topics=sub_topics,
        user_level=user_level,
        focus_areas=focus_areas,
        include_code=include_code,
        include_quiz=include_quiz,
    )
    llm = _get_llm(streaming=True)
    lc_messages = _messages_to_langchain(messages)

    logger.info("Streaming lesson for: %s", topic_title)
    async for chunk in llm.astream(lc_messages):
        if chunk.content:
            yield chunk.content


async def generate_quiz(
    topic_title: str,
    sub_topics: list[str],
    num_questions: int = 5,
) -> dict:
    """Generate quiz questions for a topic."""
    messages = build_quiz_prompt(topic_title, sub_topics, num_questions)
    llm = _get_llm(streaming=False, temperature=0.5)
    lc_messages = _messages_to_langchain(messages)

    logger.info("Generating quiz for: %s", topic_title)
    response = await llm.ainvoke(lc_messages)

    content = response.content.strip()
    if content.startswith("```"):
        content = content.split("\n", 1)[1]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()

    try:
        result = json.loads(content)
    except json.JSONDecodeError:
        logger.warning("LLM returned non-JSON quiz response.")
        result = {"questions": []}

    result["model_used"] = settings.LLM_MODEL
    return result
