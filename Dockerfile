FROM tensorflow/tensorflow:2.18.0

WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy your app and models
COPY ml-api/ ./ml-api/
COPY models/ ./models/

# Set working directory and environment
WORKDIR /app/ml-api
ENV PORT=10000

# Run with gunicorn
CMD gunicorn --bind 0.0.0.0:$PORT app:app