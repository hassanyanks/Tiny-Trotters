# Use the official lightweight Node.js image
FROM node:20-slim

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy the rest of your application code
COPY . .

# Expose the port Cloud Run injects dynamically
EXPOSE 8080

# Start the application
CMD [ "npm", "start" ]
