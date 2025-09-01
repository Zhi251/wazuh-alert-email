# 使用官方 Node.js 18 Alpine 映像作為基礎
FROM node:18-alpine AS builder

# 設置工作目錄
WORKDIR /app

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝所有依賴項（包含 devDependencies 用於構建）
RUN npm ci

# 複製源代碼
COPY . .

# 編譯 TypeScript
RUN npm run build

# 生產環境映像
FROM node:18-alpine AS production

# 安裝 dumb-init 用於正確處理信號
RUN apk add --no-cache dumb-init

# 創建非 root 用戶
RUN addgroup -g 1001 -S nodejs && \
    adduser -S wazuh -u 1001 -G nodejs

# 設置工作目錄
WORKDIR /app

# 複製 package.json 並只安裝生產依賴項
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# 從 builder 階段複製編譯後的代碼
COPY --from=builder --chown=wazuh:nodejs /app/dist ./dist
COPY --chown=wazuh:nodejs custom-email.html ./

# 切換到非 root 用戶
USER wazuh

# 此應用程式不需要暴露端口（它是監聽器服務，不提供 HTTP 服務）
# 如果需要健康檢查端點，可以取消註釋下面這行：
# EXPOSE 3000

# 設置健康檢查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "console.log('健康檢查通過')" || exit 1

# 使用 dumb-init 作為入口點，確保正確處理信號
ENTRYPOINT ["dumb-init", "--"]

# 啟動應用程序
CMD ["node", "dist/index.js"]
