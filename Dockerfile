# Chipmunks (Next.js 15 + better-sqlite3) on Ryan Cloud.
# Data (SQLite DB + child photos/signatures) lives in a mounted volume at /var/data.

# ---- build stage (needs toolchain for better-sqlite3 native build) ----
FROM node:20-slim AS build
WORKDIR /app
RUN apt-get update && apt-get install -y python3 make g++ ca-certificates && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm install --no-audit --no-fund
COPY . .
RUN npm run build

# ---- run stage ----
FROM node:20-slim AS run
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV CHIPMUNKS_DATA_DIR=/var/data
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=build /app ./
RUN mkdir -p /var/data
EXPOSE 3000
CMD ["npm", "start"]
