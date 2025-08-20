FROM node:18-alpine

WORKDIR /app

# 複製 package.json 和 package-lock.json
COPY package*.json ./


RUN npm ci


COPY tsconfig.json ./
COPY index.ts ./
COPY src/ ./src/
COPY custom-email.html ./


RUN npm run build


RUN npm ci --only=production && npm cache clean --force


RUN addgroup -g 1001 -S nodejs && \
    adduser -S wazuh -u 1001


USER wazuh


EXPOSE 3000


HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD ps aux | grep -v grep | grep node || exit 1


CMD ["npm", "start"]
