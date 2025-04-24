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

# Full-Stack Rental App

A full-stack rental application built with React, Node.js, MongoDB, Amazon S3, and OpenStreetMap Geocoding. Users can list properties, search/filter, book stays, and upload images.

---

## Tech Stack

- **Frontend:** React, React Router, TypeScript, Tailwind CSS, Vite
- **Backend:** Node.js, Express
- **Database:** MongoDB (Atlas)
- **File Storage:** AWS S3
- **Geocoding:** OpenStreetMap Nominatim (via fetch)
- **Authentication:** JWT (JSON Web Tokens)
- **Testing:** Jest, Supertest

---

## Prerequisites

- Node.js & npm
- Docker & Docker Compose (for containerized setup)
- AWS account with an S3 bucket
- MongoDB Atlas cluster

---

## Environment Variables

Create a `.env` in the **server/** directory:

```dotenv
MONGO_URI="mongodb+srv://<user>:<pass>@cluster0.../productionDB?retryWrites=true&w=majority"
MONGO_URI_TEST="mongodb+srv://<user>:<pass>@cluster0.../test?retryWrites=true&w=majority"
PORT=3001
JWT_SECRET="your_jwt_secret"
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="us-east-2"
AWS_BUCKET="your-s3-bucket"
```

---

## Running Locally

Open **two** terminals in the project root:

### 1. Frontend

```bash
cd my-react-router-app
npm install
npm run dev
```

Available at `http://localhost:5173`.

### 2. Backend

```bash
cd server
npm install
npm run start
```

API runs at `http://localhost:3001`.

---

## Docker Setup

```bash
docker compose up
```

- Frontend on `http://localhost:3000`
- Backend on `http://localhost:3001`

---

## API Endpoints

### Authentication

- **Signup**  
  `POST /auth/signup`  
  Body:

  ```json
  { "email": "...", "password": "..." }
  ```

- **Login**  
  `POST /auth/login`  
  Body:
  ```json
  { "email": "...", "password": "..." }
  ```
  Response includes a JWT token.

---

### Properties

- **Create Property**  
  `POST /properties`  
  Body includes title, description, location (address, city, state, zip, country), price, rooms, propertyType, hostId.

- **Get All Properties**  
  `GET /properties`  
  Optional query params:

  - `checkIn`, `checkOut`
  - `latitude`, `longitude`, `radius` (miles)
  - `minPrice`, `maxPrice`
  - `propertyType`

- **Get Property by ID**  
  `GET /properties/:id`

- **Update Property**  
  `PUT /properties/:id`  
  Body can include any fields above; geocoding runs if address changes.

- **Delete Property**  
  `DELETE /properties/:id`

---

### Bookings

- **Create Booking**  
  `POST /bookings`  
  Body:

  ```json
  {
    "propertyId": "...",
    "userId": "...",
    "startDate": "YYYY-MM-DD",
    "endDate": "YYYY-MM-DD"
  }
  ```

- **Get All Bookings**  
  `GET /bookings`

- **Get Bookings for a Property**  
  `GET /properties/:id/bookings`

---

### Image Upload

- **Upload Image(s) for Property**  
  `POST /image/upload/:propertyId`  
  Form field: `images` (one or multiple image files)
  - On success, images are stored in S3 and URLs are pushed into the property's `images` array.

---

## Testing

From the **server/** directory:

```bash
npm test
```

- Runs Jest & Supertest against a test MongoDB (`MONGO_URI_TEST`).
- Coverage report generated automatically.

---

## Notes

- Ensure `.env` is added to `.gitignore`.
- The frontend requires a running backend (and vice versa) for full functionality.
