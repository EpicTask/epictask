FROM node:20-alpine

# Create and change to the app directory.
WORKDIR /usr/

# Copy application dependencies to the container image.
COPY package*.json ./

# Install dependencies.
# If you add a package-lock.json speed your build by switching to 'npm ci'.
RUN npm ci  
# RUN npm install --omit=dev

# Copy local code to the container image.
COPY src/ ./src/
# COPY public/ ./public/

COPY firebase_config.json ./src/config/

# Run the web service on container startup.
CMD ["node", "src/index.js"]
