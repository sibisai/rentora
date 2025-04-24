# Rent-A-Room

## Markdown

**For:** Traveling Families & Friends or land owners who want to utilize their unoccupied space.

**Who:** People who need a place to stay during trip or vacation and those who want to rent out their property for short periods of time.

**The:** Rent-A-Room

**That:** More space and comfortability than a hotel room while giving proprty owners a chance to utilize their unoccupied space.

**Unlike:** Airbnb

**Our Product:** Allows for ease of use for both rentors and property owners to change availability of property as well as for scheduling future trips as a group.

### Vision Statement

For traveling families & friends or land owners who want to utilize their unoccupied space who need a place to stay during trip or vacation and those who want to rent out their property for short periods of time. The Rent-A-Room allows for more space and comfortability than a hotel room while giving proprty owners a chance to utilize their unoccupied space. Unlike Airbnb, our product allows for ease of use for both rentors and property owners to change availability of property as well as for scheduling future trips as a group.

## Requirements

### Functional Requirements

| ID # | Title                  | Description                                                                         |
| :--- | :--------------------- | :---------------------------------------------------------------------------------- |
| 1    | Login Page             | Page that allows user to login to their accounts                                    |
| 2    | Upload/Manage Property | Page that allows for users to manage properties they either rent or are renting out |
| 3    | Homepage               | Base page that connects to different functions of appliction                        |
| 4    | Search Function        | Function that allows for searching oof available properties within the database     |
| 5    | List of Options        | Resulting page based on returned results from search                                |
| 6    | Filters                | Places a filter on search results to get specific results                           |
| 7    | Option Details         | Displays details on selected property option                                        |
| 8    | Calender Page          | Page that shows available dates for the selected property                           |
| 9    | Cart Page              | Page that shows selected properties and dates before purchase                       |
| 10   | Check Out              | Page to process payment information on items in cart                                |

### Nonfunctional Requirements

| ID # | Title          | Description                                                        |
| :--- | :------------- | :----------------------------------------------------------------- |
| a.   | Secure App.    | Application security ensures data and user information/account     |
| b.   | High App.      | High uptime above 99.99999% availability                           |
| c.   | User welcoming | user friendly UI/UX; usable for everyone.                          |
| d.   | Response Time  | Fast response time for listings and bookings                       |
| e.   | Mod. Codebase  | Modular codebase for ease of updating and additional functionality |

![Requirement_Modeling](Requirement_Modeling.png)

To run the program entirely, two terminals must be opened up within the project directory and follows the rest of the user guide!

# Welcome to React Router Portion!

A modern, production-ready template for building full-stack React applications using React Router.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/remix-run/react-router-templates/tree/main/default)

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

Change Directories to the my-react-router-app:

```bash
cd my-react-router-app
```

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router.

# Project Server Setup and Docker Configuration

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
cd server
npm install
npm start
```

### Testing the API Endpoints

Use Postman or any similar API tool to test the following endpoints:

- **User Signup:**

  ```
  POST http://localhost:3001/auth/signup
  Body (JSON):
  {
    "email": "user@example.com",
    "password": "yourpassword"
  }
  ```

- **User Login:**

  ```
  POST http://localhost:3001/auth/login
  Body (JSON):
  {
    "email": "user@example.com",
    "password": "yourpassword"
  }
  ```

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

---

### Booking Endpoints

#### Create a Booking

```
POST http://localhost:3001/bookings
Body (JSON):
{
  "propertyId": "property_id_here",
  "userId": "user_id_here",
  "startDate": "2025-05-01",
  "endDate": "2025-05-05"
}
```

#### Get All Bookings

```
GET http://localhost:3001/bookings
```

#### Get Bookings for a Property

```
GET http://localhost:3001/properties/:id/bookings
```

Replace `:id` with the actual `propertyId`.
