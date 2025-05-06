# 1. Use official Node.js image
FROM node:18-alpine AS builder

# 2. Set working directory
WORKDIR /app

# 3. Copy dependencies and install
COPY package.json package-lock.json ./
RUN npm ci

# 4. Copy the rest of the app and build it
COPY . .
RUN npm run build

# 5. Use a lightweight image to serve the app
FROM node:18-alpine AS runner
WORKDIR /app

# 6. Install only production dependencies
COPY --from=builder /app/package.json /app/package-lock.json ./
RUN npm ci --omit=dev

# 7. Copy built app from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js

# 8. Expose port 80
ENV PORT 80
EXPOSE 80

# 9. Start the app
CMD ["npx", "next", "start", "-p", "80"]
