# Stage 1: Build the React application
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

# Stage 2: Serve the static files with Nginx
FROM nginx:alpine

# Copy the build output from the build stage to the Nginx web root
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 (Nginx default)
EXPOSE 80

# Command to start Nginx
CMD ["nginx", "-g", "daemon off;"]
