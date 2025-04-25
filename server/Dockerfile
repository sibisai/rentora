FROM node:20-alpine
WORKDIR /app

# Copy dependency files and install dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy the rest of the application code
COPY . .

# Expose the port your application listens on
EXPOSE 3001

# Start the application with dotenv preload
CMD ["node", "index.js"]