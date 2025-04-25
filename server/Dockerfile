FROM node:20-alpine
WORKDIR /app

# install only prod deps
COPY package*.json ./
RUN npm ci --omit=dev

# copy app
COPY . .

# tell Express to bind to the injected PORT
ENV NODE_ENV=production
CMD ["node", "index.js"]