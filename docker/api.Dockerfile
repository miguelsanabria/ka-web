# ---- api ----
FROM node:24-slim AS api
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg \
  && rm -rf /var/lib/apt/lists/*
COPY server/package.json server/package-lock.json ./server/
RUN cd server && npm ci --omit=dev
COPY server ./server
COPY out ./out
WORKDIR /app/server
ENV NODE_ENV=production OUT_DIR=/app/out DATA_DIR=/data PORT=3000
RUN groupadd -r ka && useradd -r -g ka ka \
  && mkdir -p /data && chown -R ka:ka /data
USER ka
EXPOSE 3000
CMD ["node", "--no-warnings", "app.js"]