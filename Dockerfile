FROM node:22-alpine
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY servidor.js cliente.js ./

USER node
EXPOSE 3000
CMD ["node", "servidor.js"]