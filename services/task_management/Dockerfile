# Python image to use.
FROM python:3.10.18-bookworm

# Set the working directory to /app
WORKDIR /app

# copy the requirements file used for dependencies
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy the rest of the working directory contents into the container at /app
COPY . .

# Set PYTHONPATH to include the app directory
ENV PYTHONPATH=/app

# Run main.py as a module when the container launches
ENTRYPOINT ["python3", "-m", "app.main"]
