# Use the official Node.js runtime as the base image
FROM node:18

# Set the working directory inside the container to /app
WORKDIR /app

# Copy package.json and package-lock.json to the container's working directory
COPY package*.json ./

# Install the project's dependencies inside the container
RUN npm install

# Copy the rest of the application code into the container
COPY . .

# Build the Next.js app
RUN npm run build

# Expose port 3000, which is the port that the Next.js app will run on by default
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]
