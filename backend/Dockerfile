# Use Bun to run the API directly in production.
FROM oven/bun:1.3.13

WORKDIR /app

# Copy package manifests first for layer caching.
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile --production

# Copy the backend source into the container.
COPY . ./

ENV NODE_ENV=production

EXPOSE 8000

CMD ["bun", "run", "start"]
