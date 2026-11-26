FROM node:24-alpine AS base
ENV PNPM_HOME=/pnpm
COPY --from=ghcr.io/pnpm/pnpm:12-alpine /opt/pnpm /opt/pnpm
RUN ln -sf /opt/pnpm/pnpm /usr/local/bin/pnpm \
  && ln -sf /opt/pnpm/pnpx /usr/local/bin/pnpx
WORKDIR /app
COPY .npmrc ./
RUN printf '\nstore-dir=/pnpm/store\npackage-manager-strict=false\n' >> .npmrc

FROM base AS fetch
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/shared/package.json packages/shared/package.json
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN pnpm fetch

FROM base AS build
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
COPY --from=fetch /pnpm/store /pnpm/store
COPY --from=fetch /root/.cache/pnpm /root/.cache/pnpm
COPY . .
RUN printf '\nstore-dir=/pnpm/store\npackage-manager-strict=false\n' >> .npmrc
RUN pnpm install --frozen-lockfile --prefer-offline
RUN pnpm --filter @product-catalogue/shared build \
  && pnpm --filter @product-catalogue/web build

FROM nginx:alpine AS runtime
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
