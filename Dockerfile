FROM node:22-alpine AS build

WORKDIR /app

ARG VITE_API_BASE_URL=https://cafe-postcode.uz
ARG VITE_API_TIMEOUT=15000
ARG VITE_LOCAL_AGENT_INSTALLER_URL=/downloads/CafePostcodeAgentSetup.exe
ARG VITE_MXIK_API_BASE_URL=https://tasnif.soliq.uz/api/cls-api
ARG VITE_MXIK_TIMEOUT=15000
ARG VITE_CONTROL_APP_URL=https://control.cafe-postcode.uz/

ENV VITE_API_BASE_URL=${VITE_API_BASE_URL} \
    VITE_API_TIMEOUT=${VITE_API_TIMEOUT} \
    VITE_LOCAL_AGENT_INSTALLER_URL=${VITE_LOCAL_AGENT_INSTALLER_URL} \
    VITE_MXIK_API_BASE_URL=${VITE_MXIK_API_BASE_URL} \
    VITE_MXIK_TIMEOUT=${VITE_MXIK_TIMEOUT} \
    VITE_CONTROL_APP_URL=${VITE_CONTROL_APP_URL}

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run prod:build

FROM nginx:alpine@sha256:4a73073bd557c65b759505da037898b61f1be6cbcc3c2c3aeac22d2a470c1752

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD wget -q -O- http://127.0.0.1/healthz || exit 1
