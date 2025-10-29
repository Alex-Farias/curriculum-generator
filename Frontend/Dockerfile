# Stage 1: Build the application
FROM node:18 AS build

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Stage 2: Create the final image
FROM node:18-alpine

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/.next ./.next
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/public ./public
COPY --from=build /usr/src/app/package.json ./
COPY --from=build /usr/src/app/next.config.ts ./
COPY --from=build /usr/src/app/tsconfig.json ./

CMD ["npm", "start"]