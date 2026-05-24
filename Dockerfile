# Stage 1: Build Frontend
FROM node:20-alpine AS builder
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Backend
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy Python source code
COPY src/ ./src/
COPY models/ ./models/
COPY configs/ ./configs/

# Copy built frontend
COPY --from=builder /app/frontend/out ./frontend/out

ENV PYTHONPATH=/app
EXPOSE 8000

# Run FastAPI server
CMD ["uvicorn", "src.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
