## Project Setup and Docker Configuration

This project uses a multi-container Docker setup for the backend (server) and frontend.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop) installed and running.
- Node.js and npm (for local development).

### Environment Variables

Create a `.env` file in the **server/** directory with the following content:

```dotenv
MONGO_URI="mongodb+srv://<username>:<password>@cluster0.yfrzaxs.mongodb.net/yourDatabaseName?retryWrites=true&w=majority"
PORT=3001
```

Make sure to update the MONGO_URI with your actual credentials and desired database name.

### Docker Configuration

1. **Dockerfile for the Backend (Server)**

The Dockerfile in the server folder should look like this:

```dockerfile
FROM node:20-alpine
WORKDIR /app

# Copy dependency files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port your application listens on
EXPOSE 3001

# Start the application
CMD ["node", "index.js"]
```

2. **Docker Compose File**

The docker-compose.yml in your project root should be configured as follows:

```yaml
services:
  server:
    build:
      context: ./server
    ports:
      - "3001:3001"
    env_file:
      - ./server/.env
  frontend:
    build:
      context: ./my-react-router-app
    ports:
      - "3000:3000"
```

Notes:

- The `env_file` property tells Docker Compose to load environment variables from the specified file (e.g., your MongoDB URI in .env).
- Ensure your .env file is in the proper directory (e.g., in server/) and is included in your .gitignore so it isn't pushed to GitHub.

### Running the Application

#### Using Docker Compose

1. **Build and Start Containers:**
   Navigate to the project root and run:

   ```bash
   docker compose up
   ```

2. **Access the Endpoints:**
   - The backend API will be available at http://localhost:3001
   - The React frontend will be available at http://localhost:3000

#### Local Development

If you prefer to run locally without Docker, from the server/ folder run:

```bash
npm install
node index.js
```

### Testing the API Endpoints

Use Postman or any similar API tool to test the following endpoints:

- **Create Property:**

  ```
  POST http://localhost:3001/properties
  Body (JSON):
  {
    "title": "Cozy Cottage",
    "description": "A beautiful cottage with a stunning view."
  }
  ```

- **Get All Properties:**

  ```
  GET http://localhost:3001/properties
  ```

- **Get a Specific Property:**

  ```
  GET http://localhost:3001/properties/{{propertyId}}
  ```

- **Update Property:**

  ```
  PUT http://localhost:3001/properties/{{propertyId}}
  Body (JSON):
  {
    "title": "Renovated Cozy Cottage",
    "description": "A renovated cottage with modern amenities."
  }
  ```

- **Delete Property:**
  ```
  DELETE http://localhost:3001/properties/{{propertyId}}
  ```

Replace `{{propertyId}}` with the actual property ID received from the create endpoint.
