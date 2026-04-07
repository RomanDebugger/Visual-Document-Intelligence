# frontend/Dockerfile
FROM node:22-slim

WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json* ./

# Install dependencies inside the container
RUN npm install

# Copy the rest of your React code
COPY . .

EXPOSE 5173

# Force Vite to expose the host so your browser can see it
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]