FROM node:20-alpine

# Create and change to the app directory.
WORKDIR /usr/

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure both package.json AND package-lock.json are copied.
# Copying this separately prevents re-running npm install on every code change.
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
