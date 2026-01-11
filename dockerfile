# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Expose the port your app runs on (e.g., 3000)
EXPOSE 3000

# Command to run the app
CMD ["node", "app.js"] 
# Note: Replace index.js with your actual entry point (e.g., app.js, server.js)