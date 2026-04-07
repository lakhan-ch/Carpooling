# Carpooling MERN Stack Application

A comprehensive ride-sharing/carpooling platform built with the MERN stack (MongoDB, Express, React, Node.js). 

## Features

- **User System:** Dynamic roles allowing users to participate as Riders, Drivers, or Both. Includes a rating system and verification checks.
- **Geospatial Route Matching:** Leverages MongoDB's geospatial operations (2dsphere index) with GeoJSON data structures for precision route matching between driver paths and rider locations.
- **Dynamic Privacy:** (Planned) Integrated VoIP capabilities and masked phone numbers to safeguard user info.
- **System Architecture:** Detailed LLD mapped straight from unified ER and UML system diagrams into efficient NoSQL schema forms.

## Tech Stack

- **Backend:** Node.js, Express.js (RESTful architecture)
- **Database:** MongoDB & Mongoose
- **Frontend:** React (Coming soon)

## Getting Started

### Prerequisites
- Node.js (v14+ recommended)
- MongoDB instance running locally (Port `27017`) or pointing to MongoDB Atlas.

### Backend Setup

1. **Navigate to the server directory**
   ```bash
   cd server
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup (Optional)**
   The backend defaults to `mongodb://127.0.0.1:27017/carpooling` and PORT `5000`. You can override these variables for production by adding a `.env` file inside `/server`:
   ```env
   PORT=5000
   MONGO_URI=your_mongo_db_connection_string
   ```

4. **Run the Development Server**
   ```bash
   npm run start
   # or natively:
   node server.js
   ```
   *Note: If you have nodemon globally installed, you can use `npx nodemon server.js` for hot-reloading.*

## API Endpoints (Current Progress)

- `POST /api/rides/create` - Create a new Ride Pool as a Driver
- `POST /api/rides/join` - Send a join request as a Rider
- `POST /api/rides/respond` - Approve or reject a join request as a Driver