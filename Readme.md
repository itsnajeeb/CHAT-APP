# Real-Time Chat Application (MERN Stack)

A feature-rich real-time chat application built using the **MERN** stack (MongoDB, Express.js, React, Node.js), powered by **Socket.io** for instant messaging, **JWT** for secure authentication, and **Cloudinary** for image sharing.

---

## 🚀 Key Features

* **Authentication & Authorization**: Secure User Signup and Login using JWT (JSON Web Tokens) stored in `localStorage`.
* **Profile Management**: Users can view and update their profile details.
* **Real-Time Messaging**: Instant one-on-one and group messaging powered by **Socket.io**.
* **Media Sharing**: Upload and send images directly in the chat using **Cloudinary**.
* **Responsive UI**: Clean and modern frontend interface.

---

## 🛠️ Tech Stack

* **Frontend**: React.js, Tailwind CSS / CSS, Context API / Redux (or state management), Socket.io-client
* **Backend**: Node.js, Express.js
* **Database**: MongoDB & Mongoose
* **Real-Time**: Socket.io
* **Cloud Storage**: Cloudinary (for image uploads)
* **Authentication**: JWT (JSON Web Tokens), bcryptjs

---

## 📁 Project Structure

```text
chat-application/
│
├── Server/                # Backend (Node.js & Express)
│   ├── controllers/        # Route controllers (Auth, Message, User)
│   ├── models/             # Mongoose schemas (User, Message, Conversation)
│   ├── routes/             # API routes
│   └── server.js           # Entry point for backend
│
└── frontend/               # Frontend (React.js)
    ├── context/            # Auth & Socket contexts
    ├── src/
    │   ├── components/     # Reusable UI components
    │   ├── pages/          # Login, Signup, Chat, Profile pages
    │   └── App.jsx
    └── package.json
```

---

## Start for Backend Server
npm run server

## Command for Frontend Server
npm run dev

---
