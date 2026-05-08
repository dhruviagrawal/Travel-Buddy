FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy all source files
COPY . .

# Cloud Run injects PORT automatically
EXPOSE 8080

CMD ["node", "server.js"]
