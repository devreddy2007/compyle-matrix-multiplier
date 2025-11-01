FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run typecheck

EXPOSE 3001

CMD ["npm", "run", "dev"]
