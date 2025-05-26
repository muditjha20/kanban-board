# 🧠 Kanban Board - Frontend

A modern, responsive **Kanban Task Management** web application built with **React** and **TypeScript**, featuring **Firebase Authentication** and drag-and-drop task management.

This is the frontend for the full-stack Kanban board app. The backend is built with ASP.NET Core, C# and hosted separately on Render. Note that tasks may take a few seconds to load since Render takes some time to start up the backend.

> 🔗 **Live App**: [kanban-board-xtt1.onrender.com](https://kanban-board-xtt1.onrender.com)  
> 📦 **Backend Repo**: [kanban-backend](https://github.com/muditjha20/kanban-backend)

---

## ✨ Features

- ✅ Firebase Authentication (Email/Password + Google Login)
- 🧩 React + TypeScript for scalable frontend development
- 📦 Drag-and-Drop interface using `@hello-pangea/dnd`
- 📋 Three-column layout: Tasks, In Progress, Completed
- 🔐 Auth-protected routes and API calls with ID tokens
- ☁️ Deployed frontend + backend on Render

---

## 🛠️ Tech Stack

| Layer      | Technology                                     |
|------------|------------------------------------------------|
| Frontend   | React, TypeScript                              |
| Styling    | Tailwind CSS                                   |
| Auth       | Firebase Authentication                        |
| Drag/Drop  | @hello-pangea/dnd                              |
| Deployment | Render.com                                     |
| Backend    | ASP.NET Core Web API with PostgreSQL (separate repo) |

---

## 🚀 Getting Started

### 🔐 Prerequisites

- Node.js (v18 or higher)
- Firebase Project with Email/Password + Google Sign-In enabled
- Running Backend API (hosted or local)

### 🔧 Installation

```bash
git clone https://github.com/muditjha20/kanban-frontend
cd kanban-frontend
npm install
```

### 🔧 Environment Setup

Create a `.env` file in the root and add the following:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_BACKEND_API_URL=https://your-backend-url.onrender.com
```

Make sure to replace the values with your actual Firebase project credentials and backend API URL.

### ▶️ Run Locally

```bash
npm run dev
```

Open the app at: [http://localhost:5173](http://localhost:5173)

---

## 🔐 Authentication Flow

- Firebase Authentication is used on the frontend.
- Google and Email/Password sign-in are supported.
- Once logged in, the user receives a Firebase ID token.
- This token is attached as a `Bearer` token to all backend requests via an `Authorization` header.

---

## 🌍 Deployment Notes

The app is deployed on [Render.com](https://render.com/). To ensure Google Login works:

- Add your frontend URL (e.g., `https://kanban-board-xtt1.onrender.com`) to Firebase → Authentication → Sign-in method → Authorized domains.
- Make sure backend verifies Firebase tokens correctly using the service account.

---

## 🧠 Future Improvements

- 🔁 Real-time collaboration with SignalR
- ⏳ Task due dates and countdowns
- 📌 Board-level access control
- 📈 Task history and progress tracking

---

## 👨‍💻 Author

**Mudit Mayank Jha**  
B.Sc. Computer Science @ The University of the West Indies  
[GitHub](https://github.com/muditjha20) · [LinkedIn](https://www.linkedin.com/in/mudit-mayank-jha-4b27b7203)

---

## 📝 License

MIT License. Feel free to fork and build upon this project.
