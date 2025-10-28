FROM node:20-slim

WORKDIR /lex3
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npx", "tsx", "/lex3/src/app.ts"]
