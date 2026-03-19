# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build args for environment variables
ARG VITE_API_URL=""
ARG VITE_AUTH_API_URL=""
ARG VITE_WS_URL=""
ARG VITE_EVOAI_API_URL=""
ARG VITE_AGENT_PROCESSOR_URL=""
# Set environment variables for build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_AUTH_API_URL=$VITE_AUTH_API_URL
ENV VITE_WS_URL=$VITE_WS_URL
ENV VITE_EVOAI_API_URL=$VITE_EVOAI_API_URL
ENV VITE_AGENT_PROCESSOR_URL=$VITE_AGENT_PROCESSOR_URL
# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

