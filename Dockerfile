# Multi-stage build: Stage 1 builds the app with Node, Stage 2 serves the
# finished static files with Nginx. Only Stage 2 ends up in the final image,
# so Node, node_modules and the source code are left behind.

# ---------- Stage 1: build ----------
FROM node:22-alpine AS build
WORKDIR /app

# Copy only the dependency manifests first. Docker caches each step, so as
# long as these two files don't change, `npm ci` is skipped on rebuilds.
COPY package.json package-lock.json ./
RUN npm ci

# Now copy the rest of the source and build it into /app/dist.
COPY . .
RUN npm run build

# ---------- Stage 2: serve ----------
FROM nginx:stable-alpine

# Nginx serves whatever is in this folder; replace its welcome page with our build.
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

# The nginx image already starts the server by default; stating it makes that explicit.
CMD ["nginx", "-g", "daemon off;"]
