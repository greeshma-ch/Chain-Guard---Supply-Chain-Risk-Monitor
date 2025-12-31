# Stage 1: Build React app
FROM node:20-alpine AS build-stage

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Create environment variable file (per the image logic)
ARG GEMINI_API_KEY
RUN echo "REACT_APP_GEMINI_KEY=$GEMINI_API_KEY" > .env.local

# Build the application
COPY . .
RUN npm run build

# Stage 2: Serve the app with Nginx
FROM nginx:alpine

# Copy the build output to replace the default nginx contents
COPY --from=build-stage /app/build /usr/share/nginx/html

# Expose the port and start nginx
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
