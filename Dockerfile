FROM node:16-alpine as builder
WORKDIR /app

# package*.json is copied separately to take advantage of docker's build cache
# 'npm ci' will only be rerun if dependencies change
COPY package*.json /app/
RUN npm ci

COPY . /app

# Builds api then removes build/development-only packages which aren't necessary at runtime.
ENV ENV=production \
    PORT=3000
RUN npx prisma generate && \
    npm run build && \
    npm prune --production && \
    rm -rf src

# Cleanup leftovers from the build process
FROM node:16-alpine
WORKDIR /app
COPY --from=builder /app /app
EXPOSE 3000
COPY . /app
RUN apk add curl
CMD [ "sh", "/app/docker/entry.sh" ]
