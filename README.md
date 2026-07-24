# TodoIt Backend

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#)

## 📌 Project Overview

TodoIt Backend is a professional task-management API that serves as the backend engine for the TodoIt application. It provides authenticated users with the ability to manage personal to-do items, organize them into categories, attach cloud-hosted media, track deadlines, and receive real-time push notifications.

---

## 🛠️ Architecture & Tech Stack Concepts

The codebase is built with a focus on type safety, clean separation of concerns, and modular design.

- **Runtime Environment:** Type-safe JavaScript runtime using compiled superset scripting.
- **Backend Framework:** Minimalist web application framework with a robust routing and middleware pipeline.
- **Database Layer & Object-Relational Mapping (ORM):** NoSQL document database utilizing schema modeling to enforce data structures and relationships.
- **Security & Authentication:** Secure password hashing (utilizing high-work-factor cryptographic algorithms) and user-scoped Bearer token authentication.
- **File Upload & Cloud Storage:** Intercepted multipart form-data parsed and uploaded directly to a cloud media service.
- **Push Notification Service:** Push message delivery pipeline integrated with third-party mobile notification servers.
- **API Documentation:** Auto-generated interactive API docs derived directly from route-level annotation schemas.

---

## ✨ Key Features

- **Feature-Based Modular Architecture:** Code is organized by core features (Auth, Users, Todos, Categories, Notifications, Uploads), keeping controllers, routing, schemas, and helpers self-contained.
- **Layered Authentication Guard:** Middleware-enforced route protection using secure token validation and generation.
- **Declarative Request Validation:** Automatic sanitization and validation of request body payloads, route parameters, and query fields before executing controller logic.
- **Resource Ownership Enforcement:** Server-side checks verifying that modifying actions (updates, deletion, status toggles) are executed solely by the resource owner.
- **Media Upload Processing:** Multi-part file parsing combined with secure cloud storage integration for profile pictures and task attachments.
- **Third-Party Push Notifications:** Integration with mobile push servers to notify clients of task updates and reminders.
- **Standardized API Response Contract:** Consistent wrapper interface structure for all status codes, database listings, paginated metadata, and error handling.

---

## ☁️ Cloud Infrastructure & Deployment

The application is built for seamless deployment in production environments:

- **Containerization:** Configured with optimization-focused environment containers (via orchestrations like Docker and Docker Compose).
- **Hosting & Proxying:** Ready for deployment on virtual private servers (VPS), mapped through custom domain networks, and secured via security-focused proxy networks (such as Cloudflare) for SSL certificate management and DNS protection.

---

## 📖 API Documentation

The project includes interactive API documentation generated directly from annotations in the codebase. When the server is running, you can explore, test, and integrate with the endpoints using the built-in interface:

**Local URL:** `http://localhost:<PORT>/api-docs`

---

## 🚀 Local Development Guide

Follow these steps to run the project locally on your machine.

### Prerequisites

Ensure you have the following installed:

- [Bun](https://bun.sh) (v1.0 or higher)
- Access to a running database instance (local or cloud-hosted)

### 1. Clone the Repository

```bash
git clone <repository_url>
cd todoit-backend
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory and define the following variables (refer to `.env.sample` for details):

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=todoit
HASHING_SALT=10
EXPO_ACCESS_TOKEN=your_notification_token_here
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
CLOUDINARY_FOLDER_NAME=todoit
```

### 3. Install Dependencies

Install the project dependencies using your package manager:

```bash
bun install
```

### 4. Run the Application

Start the server in development mode with hot-reloading:

```bash
bun dev
```

Once started, the backend server will run at `http://localhost:3000` (or your configured `PORT`), and the interactive documentation will be available at `http://localhost:3000/api-docs`.
