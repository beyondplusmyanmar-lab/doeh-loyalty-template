FROM node:20-alpine

WORKDIR /app

# Install production deps against the committed lockfile.
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY src ./src

ENV NODE_ENV=production
EXPOSE 8787
USER node

CMD ["node", "src/index.js"]
