# ---------- Stage 1: build the React frontend ----------
FROM node:20 AS frontend
WORKDIR /fe
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# ---------- Stage 2: FastAPI backend + built frontend ----------
FROM python:3.11-slim

# System libraries needed by OpenCV
RUN apt-get update && apt-get install -y libgl1 libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python packages (CPU-only PyTorch keeps the image small)
COPY requirements.txt .
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu \
    && pip install --no-cache-dir -r requirements.txt

# Copy backend code and built frontend
COPY backend/ .
COPY --from=frontend /fe/dist ./static

# Hugging Face Spaces uses port 7860
EXPOSE 7860
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]