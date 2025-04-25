# build stage
FROM node:20-alpine AS build
WORKDIR /app

# install deps & copy
COPY package*.json ./
RUN npm ci
COPY . .

# inject your backend URL at build time
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# serve with nginx
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]