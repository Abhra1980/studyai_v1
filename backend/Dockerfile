# StudyAI Backend – FastAPI
# Build from project root: docker build -f backend/Dockerfile .
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application and CSV (CSV at /app/AI_ML_Syllabus_Structured.csv)
COPY backend/app/ ./app/
COPY AI_ML_Syllabus_Structured.csv ./

# Expose port
EXPOSE 8000

# Run uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
