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
COPY --from=fetch /pnpm/store /pnpm/store
COPY --from=fetch /root/.cache/pnpm /root/.cache/pnpm
COPY . .
RUN printf '\nstore-dir=/pnpm/store\npackage-manager-strict=false\n' >> .npmrc
RUN pnpm install --frozen-lockfile --prefer-offline
RUN pnpm --filter @product-catalogue/shared build \
  && pnpm --filter @product-catalogue/api build \
  && pnpm --filter @product-catalogue/api deploy --prod --prefer-offline /prod/api

FROM node:24-alpine AS runtime
WORKDIR /app
COPY --from=build /prod/api ./
ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "dist/index.js"]
