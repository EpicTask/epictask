# Use the official Python image as the base image
FROM python:3.9-slim-buster

# Set the working directory to /app
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .

# Install the dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code into the container
COPY app/ .

# Expose port 8080 to the outside world
EXPOSE 8080

# Start the Flask application
CMD ["gunicorn", "--bind", "0.0.0.0:8080", "main:app"]
