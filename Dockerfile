FROM node:22-bookworm-slim

WORKDIR /app
RUN chown node:node /app
USER node
COPY --chown=node:node package.json package-lock.json ./
RUN npm ci && mkdir -p .next
COPY --chown=node:node . .

EXPOSE 3000
CMD ["npm", "run", "dev"]
