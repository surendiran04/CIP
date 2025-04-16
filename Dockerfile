# Use the official Python image as a base
FROM python:3.12

# Install system dependencies required for OpenCV
RUN apt-get update && apt-get install -y libgl1-mesa-glx

# Set the working directory in the container
WORKDIR /app

# Copy the requirements.txt file into the container
COPY requirements.txt .

# Install the dependencies
RUN pip install -r requirements.txt

# Copy the rest of the application code into the container
COPY . .

# Expose the application port (change 5000 to the port your app uses)
EXPOSE 5000

# Run the application
CMD ["python", "app.py"]
