FROM node:20.19.4-alpine

WORKDIR /app

# Install build tools
RUN apk add --no-cache python3 make g++

# Copy package files and install fresh (no cache)
COPY package*.json ./
RUN npm install --production --no-cache && npm cache clean --force

# Copy source code
COPY . .

# Create upload directories
RUN mkdir -p uploads/documents uploads/reports uploads/images uploads/temp

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=5 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "src/app.js"]
