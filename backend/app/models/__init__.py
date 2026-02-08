"""Import all models so Base.metadata picks them up."""

from app.models.syllabus import MainTopic, Unit, Topic, SubTopic  # noqa: F401
from app.models.content import GeneratedContent, UserProgress  # noqa: F401
from app.models.user import User  # noqa: F401
