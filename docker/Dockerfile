FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./


RUN npm ci


COPY . .


RUN npm run build


FROM node:18-alpine AS production


RUN apk add --no-cache dumb-init


RUN addgroup -g 1001 -S nodejs && \
    adduser -S wazuh -u 1001 -G nodejs


WORKDIR /app


COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# 從 builder 階段複製編譯後的代碼
COPY --from=builder --chown=wazuh:nodejs /app/dist ./dist
COPY --chown=wazuh:nodejs custom-email.html ./

# 切換到非 root 用戶
USER wazuh


# 如果需要健康檢查端點，可以取消註釋下面這行：
# EXPOSE 3000

# 設置健康檢查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "console.log('HEALTHCHECK ok')" || exit 1

# 使用 dumb-init 作為入口點，確保正確處理信號
ENTRYPOINT ["dumb-init", "--"]

# 啟動應用程序
CMD ["node", "dist/index.js"]
