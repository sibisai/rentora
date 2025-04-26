# rentora

## Markdown

**For:** Traveling Families & Friends or land owners who want to utilize their unoccupied space.

**Who:** People who need a place to stay during trip or vacation and those who want to rent out their property for short periods of time.

**The:** rentora

**That:** More space and comfortability than a hotel room while giving proprty owners a chance to utilize their unoccupied space.

**Unlike:** Airbnb

**Our Product:** Allows for ease of use for both rentors and property owners to change availability of property as well as for scheduling future trips as a group.

### Vision Statement

For traveling families & friends or land owners who want to utilize their unoccupied space who need a place to stay during trip or vacation and those who want to rent out their property for short periods of time. The rentora allows for more space and comfortability than a hotel room while giving proprty owners a chance to utilize their unoccupied space. Unlike Airbnb, our product allows for ease of use for both rentors and property owners to change availability of property as well as for scheduling future trips as a group.

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

# rentora

A full-stack short-term-rental app: travelers can search, filter, book and pay; hosts can list, manage availability, and upload images.

---

## 📋 Overview

rentora provides a marketplace where:

- **Hosts** list rooms, homes or apartments for short stays
- **Guests** search by location, dates and filters, then book
- **Guests & hosts** chat, rate, and manage their bookings (Work in progress)

Unlike Airbnb, our MVP focuses on simplicity and gets you up-and-running with:

- Property CRUD
- Rich search & filtering (date availability, geolocation, price)
- Booking engine (no overlaps, date validation)
- Image upload to S3
- JWT-backed auth
- Geocoding via Nominatim

---

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Google Maps Places API
- **Backend:** Node.js, Express
- **Database:** MongoDB Atlas
- **File Storage:** AWS S3
- **Geocoding:** OpenStreetMap Nominatim
- **Auth:** JWT (JSON Web Tokens)
- **Testing:** Jest, Supertest

---

## 🌐 Live Demo

[🚀 View the Live App](https://cpsc-362-activity-1-production.up.railway.app)

---

## ⚙️ Prerequisites

- Node.js ≥ 16 + npm
- Docker & Docker Compose (optional, for containerized dev)
- An AWS account & S3 bucket
- MongoDB Atlas cluster
- Google Maps API key if you swap in Google geocoding

---

## 🔒 Environment Variables

Create a `.env` file in `/server`:

```dotenv
MONGO_URI="mongodb+srv://<user>:<pass>@cluster0/productionDB?retryWrites=true&w=majority"
MONGO_URI_TEST="mongodb+srv://<user>:<pass>@cluster0/testDB?retryWrites=true&w=majority"
JWT_SECRET="your_jwt_secret_here"
AWS_ACCESS_KEY_ID="YOUR_AWS_KEY"
AWS_SECRET_ACCESS_KEY="YOUR_AWS_SECRET"
AWS_REGION="us-east-2"
AWS_BUCKET="your-s3-bucket-name"
```

> **Never** commit `.env`—it’s in `.gitignore`.

---

## 🏃 Running Locally

You’ll need **two** terminals:

### 1. Frontend

```bash
cd my-react-router-app
npm install
npm run dev
```

Visit: `http://localhost:5173`

### 2. Backend

```bash
cd server
npm install
npm run start
```

API root: `http://localhost:3001`

---

## 🐳 Docker

```bash
docker compose up --build
```

- Frontend → http://localhost:5173
- Backend → http://localhost:3001

---

## 🧪 Testing

From the **server/** folder:

```bash
npm test
```

- Uses `MONGO_URI_TEST`
- Runs Jest & Supertest
- Generates a coverage report (aim ≥ 80%)
- Currently at 83.89% coverage

---

## 🔗 API Reference

### Auth

| Method | Path           | Body                  | Success Response                        |
| ------ | -------------- | --------------------- | --------------------------------------- |
| POST   | `/auth/signup` | `{ email, password }` | `201 { message, userId, email }`        |
| POST   | `/auth/login`  | `{ email, password }` | `200 { message, token, userId, email }` |

---

### Properties

| Method | Path              | Query                                                                                    | Body                                                                                                                         |
| ------ | ----------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| POST   | `/properties`     | —                                                                                        | `{ title, description, location:{address,city,state,zip,country}, price, rooms, propertyType, hostId, images?, amenities? }` |
| GET    | `/properties`     | `?checkIn&checkOut`, `?latitude&longitude&radius`, `?minPrice&maxPrice`, `?propertyType` | —                                                                                                                            |
| GET    | `/properties/:id` | —                                                                                        | —                                                                                                                            |
| PUT    | `/properties/:id` | —                                                                                        | Any subset of the create-body fields; geocoding runs if location changed                                                     |
| DELETE | `/properties/:id` | —                                                                                        | —                                                                                                                            |

---

### Bookings

| Method | Path                       | Body                                         |
| ------ | -------------------------- | -------------------------------------------- |
| POST   | `/bookings`                | `{ propertyId, userId, startDate, endDate }` |
| GET    | `/bookings`                | —                                            |
| GET    | `/properties/:id/bookings` | —                                            |

---

### Image Upload

| Method | Path                        | Form-Data Field(s)     | Description                                              |
| ------ | --------------------------- | ---------------------- | -------------------------------------------------------- |
| POST   | `/image/upload/:propertyId` | `images` (one or many) | Saves files to S3 and pushes URLs onto `property.images` |

---

## 🎯 Future Enhancements

- Cross-platform compatibility (web & mobile)
- Reliable second-image upload during edits
- Improved calendar usability on the Edit Page
- Responsive UI/UX
- Review & rating system
- In-app chat support
- Seamless payment integration
- CI/CD pipeline & production deployment
