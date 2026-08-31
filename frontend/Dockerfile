# Stage 1: Build the React application
FROM node:18-alpine AS build

WORKDIR /workspace

# Install npm packages
COPY package*.json ./
RUN npm install

# Copy source and configurations
COPY . .

# Inject default environment variable for production builds pointing to backend API container
ENV VITE_API_BASE_URL=http://localhost:8000/api

# Compile bundles
RUN npm run build

# Stage 2: Serve the static files using Nginx
FROM nginx:alpine

# Copy compiled files from build stage to nginx directory
COPY --from=build /workspace/dist /usr/share/nginx/html

# Expose port 80 for traffic
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
