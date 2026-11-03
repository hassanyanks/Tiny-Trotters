FROM node:22-alpine

# Set the active workspace directory inside the container
WORKDIR /app

# 1. Copy package files specifically from the ponies subfolder to install dependencies
COPY ponies/package*.json ./
RUN npm install

# 2. Copy the remaining project files over
COPY . .

# 3. Pivot the working directory into the subfolder so 'node app.js' runs seamlessly
WORKDIR /app/ponies

# 4. Start your Node.js application
CMD ["node", "app.js"]
