# Use Bun to run the API directly in production.
FROM oven/bun:1.3.13

WORKDIR /app

# Render builds from the repo root, so copy the backend manifests explicitly.
COPY backend/package.json backend/bun.lock* ./
RUN bun install --frozen-lockfile --production

# Copy the backend source into the container.
COPY backend/ ./

ENV NODE_ENV=production

EXPOSE 8000

CMD ["bun", "run", "start"]
