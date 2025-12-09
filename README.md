# Personal Blog Platform

A full-stack blogging platform built with **React + Ant Design** on the frontend and **Node.js + Express + Prisma + MySQL** on the backend.  
Supports **JWT auth (HTTP-only cookies)**, **AWS S3 image uploads**, **article creation & editing**, **profile management**, and **full CRUD operations**.

Deployed using **Railway (Backend)** and **Vercel (Frontend)**.

## Features

### Authentication
- Login & register with email + password
- Secure **HTTP-only JWT cookies** for persistent sessions
- Auto-redirect based on login state

### Blog Management
- Create, edit, delete posts
- Draft / published / archived post workflow
- Rich text support (content textarea)
- Image upload (single or multiple)
- Automatically stores image URLs in MySQL

### User Profile
- View / edit profile info:
  - Display name  
  - Bio  
  - Role  
  - Avatar image
- Avatar upload via AWS S3

### Image Upload (AWS S3)
- Client-side Upload component using Ant Design
- Backend accepts multipart form data
- Secure S3 PutObject upload
- Returns publicly accessible image URLs

### Frontend (React)
- Built with **React + Vite**
- UI using **Ant Design**
- Axios wrapper for API calls
- Token automatically sent through cookies
- Protected routes (requires login)
- Responsive layout & clean design

### Backend (Node.js + Express)
- RESTful API design
- JWT authentication middleware
- Prisma ORM for DB operations
- MySQL (Railway)
- AWS S3 integration
- Error-handled routes for posts, profiles, and auth

## Tech Stack

### **Frontend**
- React 18
- Vite
- Ant Design
- Axios
- React Router

### **Backend**
- Node.js (Express)
- Prisma ORM
- MySQL (Railway)
- AWS S3 SDK v3
- JWT (HTTP-only cookies)
- CORS

## Directory Structure

### Frontend（/personal-blog）
src/
assets/
pages/
LoginPage.jsx
RegisterPage.jsx
ProfilePage.jsx
CreateArticlePage.jsx
components/
utils/
request.js

### Backend（/server）
src/
controllers/
routes/
middlewares/
prisma/
utils/s3.js
server.js
.env

## Environment Variables

### Backend `.env`
DATABASE_URL="mysql://user:password@host/db"
JWT_SECRET="your_jwt_secret"
AWS_ACCESS_KEY_ID="xxx"
AWS_SECRET_ACCESS_KEY="xxx"
AWS_BUCKET_NAME="your-bucket"
AWS_REGION="us-west-2"

### Frontend `.env`
VITE_API_URL="https://your-railway-url"

## Local Development

### Clone project
```bash
git clone https://github.com/novadecore/personal-blog.git
cd personal-blog
Install frontend dependencies
bash
npm install
npm run dev
Backend
cd server
npm install
npx prisma migrate dev
npm run dev
