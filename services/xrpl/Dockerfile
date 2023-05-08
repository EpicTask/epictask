# Python image to use.
FROM python:3.10-alpine

# Set the working directory to /app
WORKDIR /app

# copy the requirements file used for dependencies
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --trusted-host pypi.python.org -r requirements.txt

# Copy the rest of the working directory contents into the container at /app
COPY app/ .

# Run app.py when the container launches
ENTRYPOINT ["python", "app2.py"]
# # Expose port 8080 to the outside world
# EXPOSE 8080

# # Start the Flask application
# CMD ["gunicorn", "--bind", "0.0.0.0:8080", "main:app"]