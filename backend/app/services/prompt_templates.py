"""Prompt templates for StudyAI LLM Orchestrator.

Follows the HLD prompt architecture (~1,980 tokens):
  System Message (~500 tok) + Syllabus Context (~300 tok) +
  User Context (~150 tok) + Output Schema (~300 tok) +
  Few-Shot Example (~700 tok) + User Query (~30 tok)
"""

SYSTEM_PROMPT = """You are StudyAI, an expert AI/ML teacher and mentor. Your role is to teach complex technical topics in a clear, structured, and engaging manner.

## Your Teaching Style
- Break down complex concepts into digestible pieces
- Use real-world analogies and practical examples
- Include MANY working code examples with detailed explanations (aim for 5+ examples when relevant)
- Use mathematical notation (LaTeX) when relevant
- Provide quiz questions to test understanding
- Adapt to the student's level (beginner / intermediate / advanced)
- Generate as much comprehensive content as possible – be thorough and include abundant examples

## Output Format
You MUST respond in valid JSON with this exact structure:
{{
  "explanation": "Comprehensive explanation in Markdown format with ## headings, bullet points, and clear paragraphs",
  "key_points": ["Point 1", "Point 2", "Point 3"],
  "code_examples": [
    {{
      "language": "python",
      "code": "# working code example",
      "explanation": "What this code demonstrates"
    }}
  ],
  "math_formulas": ["$E = mc^2$", "$\\\\nabla f(x)$"],
  "quiz": [
    {{
      "question": "What is ...?",
      "options": ["A", "B", "C", "D"],
      "correct_index": 0,
      "explanation": "A is correct because..."
    }}
  ],
  "further_reading": ["Resource 1", "Resource 2"]
}}

## Knowledge Check (Quiz) Requirements
- Generate 10-20 questions PER sub-topic (minimum 10, up to 20 each).
- Match question difficulty to the student level:
  - beginner: simple recall, definitions, foundational concepts
  - intermediate: applied scenarios, moderate depth, practical application
  - advanced: analytical, edge cases, deep understanding, implementation details

IMPORTANT: Return ONLY the JSON object. No markdown code fences, no extra text."""


def build_syllabus_context(
    main_topic: str,
    unit_name: str,
    topic_title: str,
    sub_topics: list[str],
) -> str:
    """Build the syllabus context block for the prompt."""
    bullets = "\n".join(f"  - {st}" for st in sub_topics)
    return f"""## Syllabus Context
Main Topic: {main_topic}
Unit: {unit_name}
Topic: {topic_title}

Sub-topics to cover:
{bullets}"""


def build_user_context(
    user_level: str = "beginner",
    focus_areas: list[str] | None = None,
    include_code: bool = True,
    include_quiz: bool = True,
) -> str:
    """Build user personalisation context."""
    level_guide = {
        "beginner": "Quiz: simple recall, definitions, foundational concepts.",
        "intermediate": "Quiz: applied scenarios, practical application, moderate depth.",
        "advanced": "Quiz: analytical, edge cases, deep understanding, implementation details.",
    }
    parts = [f"## Student Context\nLevel: {user_level}"]
    parts.append(level_guide.get(user_level.lower(), level_guide["intermediate"]))
    if include_quiz:
        parts.append("Generate 10-20 Knowledge Check questions per sub-topic, all matching the student level above.")
    if focus_areas:
        parts.append(f"Focus areas: {', '.join(focus_areas)}")
    if not include_code:
        parts.append("Note: Student requested NO code examples — omit the code_examples field.")
    if not include_quiz:
        parts.append("Note: Student requested NO quiz — omit the quiz field.")
    return "\n".join(parts)


def build_teach_prompt(
    main_topic: str,
    unit_name: str,
    topic_title: str,
    sub_topics: list[str],
    user_level: str = "beginner",
    focus_areas: list[str] | None = None,
    include_code: bool = True,
    include_quiz: bool = True,
) -> list[dict[str, str]]:
    """Build the complete message list for the LLM."""
    syllabus_ctx = build_syllabus_context(main_topic, unit_name, topic_title, sub_topics)
    user_ctx = build_user_context(user_level, focus_areas, include_code, include_quiz)

    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        {
            "role": "user",
            "content": f"""{syllabus_ctx}

{user_ctx}

Teach me: {topic_title}

Cover ALL the sub-topics listed above comprehensively. Provide abundant practical examples and working code – include as many examples as possible to illustrate each concept. Be thorough and detailed.

For the Knowledge Check quiz: generate 10-20 questions per sub-topic. Match difficulty to my level ({user_level}).""",
        },
    ]


QUIZ_SYSTEM_PROMPT = """You are StudyAI Quiz Generator. Generate challenging but fair multiple-choice questions to test understanding of technical topics.

## Output Format
Respond in valid JSON:
{{
  "questions": [
    {{
      "question": "Clear, specific question",
      "options": ["A", "B", "C", "D"],
      "correct_index": 0,
      "explanation": "Why the correct answer is right and others are wrong"
    }}
  ]
}}

Generate 5 questions per topic. Mix difficulty levels. Include conceptual and practical questions.
Return ONLY the JSON object. No markdown code fences, no extra text."""


MORE_CONTEXT_SYSTEM_PROMPT = """You are StudyAI, an expert AI/ML teacher. The student has already received a lesson and is asking for MORE context on a specific aspect.

Your job: answer their follow-up question thoroughly, building on the existing lesson content. Provide additional explanation in Markdown. Include code examples if relevant and helpful.

## Output Format
Respond in valid JSON:
{
  "explanation": "Your detailed additional explanation in Markdown, with ## headings and clear structure",
  "code_examples": [
    {
      "language": "python",
      "code": "# working code",
      "explanation": "What this demonstrates"
    }
  ]
}

You may omit code_examples if not relevant. Return ONLY the JSON object. No markdown code fences, no extra text."""


def build_more_context_prompt(
    topic_title: str,
    existing_explanation: str,
    user_question: str,
) -> list[dict[str, str]]:
    """Build prompt for generating additional context from a follow-up question."""
    return [
        {"role": "system", "content": MORE_CONTEXT_SYSTEM_PROMPT},
        {
            "role": "user",
            "content": f"""Topic: {topic_title}

## Existing lesson content the student has already seen:
{existing_explanation[:8000]}

---

The student asks: "{user_question}"

Generate additional context to answer their question. Build on what they already learned. Be thorough and practical.""",
        },
    ]


def build_quiz_prompt(
    topic_title: str,
    sub_topics: list[str],
    num_questions: int = 5,
) -> list[dict[str, str]]:
    """Build prompt for quiz generation."""
    bullets = "\n".join(f"  - {st}" for st in sub_topics)
    return [
        {"role": "system", "content": QUIZ_SYSTEM_PROMPT},
        {
            "role": "user",
            "content": f"""Topic: {topic_title}

Sub-topics:
{bullets}

Generate {num_questions} multiple-choice questions covering these sub-topics.""",
        },
    ]
