# Carpooling System Design

This document provides a comprehensive overview of the architecture, data flow, and database structure for the Carpooling system.

## High-Level Design (HLD)

This diagram illustrates the data flow from the frontend to the database, incorporating **Redis Workers** for asynchronous processing.

```mermaid
graph TD
    subgraph Client_Side [Client Side]
        FE[Frontend - React/Mobile]
    end

    subgraph API_Layer [API Layer]
        LB[Load Balancer / Nginx]
        BE[Express.js App Servers]
    end

    subgraph Data_Storage [Data Storage]
        DB[(MongoDB)]
        RD[(Redis - Task Queue)]
    end

    subgraph Asynchronous_Workers [Asynchronous Workers]
        WR[Worker Processes - Bull]
        NS[Notification Service]
        ME[Matching Engine]
    end

    %% Flow
    FE -- HTTPS/REST --> LB
    LB --> BE
    BE -- CRUD Operations --> DB
    BE -- Enqueue Tasks --> RD
    RD -- Pull Tasks --> WR
    WR -- Push Notifications --> NS
    WR -- Background Matching --> ME
    ME -- Update Results --> DB
    NS -- Send Alerts --> FE
```

---

## Low-Level Design (LLD) - Class Diagram

The class diagram outlines the relationships between controllers, models, and core services.

```mermaid
classDiagram
    class User {
        +String name
        +String email
        +String phone
        +register()
        +login()
    }

    class Vehicle {
        +String model
        +String licensePlate
        +String color
        +ObjectId driver_id
    }

    class RidePool {
        +ObjectId driver_id
        +Point pickup_location
        +Point drop_location
        +DateTime departure_time
        +Int available_seats
        +createRide()
        +updateStatus()
    }

    class JoinRequest {
        +ObjectId ride_id
        +ObjectId rider_id
        +Enum status
        +submitRequest()
        +updateStatus()
    }

    class RideController {
        +createRidePool()
        +requestJoinRide()
        +respondToJoinRequest()
    }

    class WorkerService {
        +processMatching()
        +sendNotification()
    }

    User "1" -- "0..1" Vehicle : owns
    User "1" -- "0..N" RidePool : drives
    User "1" -- "0..N" JoinRequest : requests
    RidePool "1" -- "0..N" JoinRequest : manages
    RideController ..> RidePool : interacts
    RideController ..> JoinRequest : interacts
    WorkerService ..> RidePool : matches
```

---

## Entity-Relationship (ER) Diagram

A relational view of the database schemas and their constraints.

```mermaid
erDiagram
    USER ||--o| VEHICLE : "is driver for"
    USER ||--o{ RIDE_POOL : "creates"
    USER ||--o{ JOIN_REQUEST : "initiates"
    RIDE_POOL ||--o{ JOIN_REQUEST : "receives"

    USER {
        ObjectId _id PK
        String name
        String email
        String phone
        Date createdAt
    }

    VEHICLE {
        ObjectId _id PK
        ObjectId driver_id FK
        String model
        String license_plate
        Int capacity
    }

    RIDE_POOL {
        ObjectId _id PK
        ObjectId driver_id FK
        Point pickup_loc
        Point drop_loc
        DateTime departure
        Int seats
        Enum status
    }

    JOIN_REQUEST {
        ObjectId _id PK
        ObjectId ride_id FK
        ObjectId rider_id FK
        Enum status "PENDING, APPROVED, REJECTED"
        Date timestamp
    }
```

---

## Table Definitions & Idea

| Table (Collection) | Description | Key Fields | Purpose |
| :--- | :--- | :--- | :--- |
| **Users** | User profiles and Auth | `_id`, `email`, `password_hash`, `role` | Core user identity. |
| **Vehicles** | Car details for drivers | `_id`, `driver_id`, `make`, `model`, `plate` | Required for ride posting. |
| **RidePools** | Available ride offers | `_id`, `driver_id`, `pickup_loc`, `drop_loc`, `seats` | Central entity for the app. |
| **JoinRequests** | Pending passenger asks | `_id`, `ride_id`, `rider_id`, `status` | Links riders to pools. |
| **AuditLogs** | System activity tracking | `_id`, `action`, `user_id`, `timestamp` | For debugging and analytics. |

---

## Data Flow Breakdown (Visual Summary)

1.  **Frontend**: User fills out a "Join Ride" form.
2.  **API**: `RideController.requestJoinRide` receives the request.
3.  **Persistence**: A `JoinRequest` is saved to **MongoDB** with status `PENDING`.
4.  **Queue**: Express app pushes a "NotificationTask" to **Redis** (Bull queue).
5.  **Worker**: A background process picks up the task from Redis.
6.  **Action**: Worker sends a push notification to the Driver.
7.  **Finalize**: Once Driver approves, the Worker updates the `available_seats` in `RidePool` and notifies the Rider.
