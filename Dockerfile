# Stage 1: Build the Vite frontend
FROM node:18.20.4 AS build-frontend

WORKDIR /app/frontend
ENV NODE_OPTIONS="--max-old-space-size=4096"
COPY ./frontend/package*.json ./
RUN npm install
COPY ./frontend ./
RUN npm run build

# Stage 2: Build the TypeScript backend
FROM node:18.20.4 AS build-backend

WORKDIR /app/backend
COPY ./backend/package*.json ./
RUN npm install
COPY ./backend/tsconfig.json ./
COPY ./backend ./

ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm run build

# Copy Vite build files into the backend's public directory
RUN mkdir -p dist/public
COPY --from=build-frontend /app/frontend/dist/ dist/public/

EXPOSE 8000
CMD ["node", "dist/index.js"]
