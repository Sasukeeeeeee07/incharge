# In-Charge OR In-Control

A modern, gamified assessment application designed to help users identify their mindset—whether they operate from a position of being "In-Charge" or "In-Control". 

## 🚀 Overview
The application consists of a polished user-facing quiz experience and a robust administration panel. It features a unique "Ladder" visualization that tracks user progress in real-time as they answer assessment questions.

### Key Features
- **Multi-Language Support**: Complete localization for quizzes in English, Hindi, Gujarati, and Malayalam.
- **Enhanced User Experience**:
  - **Dynamic Theme**: Modern Blue/Orange color scheme with glassmorphism effects.
  - **Responsive Layouts**: Optimized navigation with mobile-friendly sidebar and header controls.
  - **Visual Feedback**: Real-time speedometer and ladder visualization for assessment progress.
- **Admin Dashboard**:
  - **Analytics**: Comprehensive visual data using Recharts, including user growth, role distribution, and accuracy comparisons.
  - **User Performance**: Dedicated tab for detailed user history, aggregate result calculation (based on frequency), and attempt breakdowns.
  - **User Management**: Bulk import/export users via CSV or Excel (XLSX).
  - **Quiz Management**: Create, edit, and schedule quizzes with multi-language capabilities.
  - **AI Generation**: Integrated AI capabilities to generate quiz drafts instantly.

## 🛠 Tech Stack

### Frontend
- **React (Vite)**: For a fast, modern component-based architecture.
- **Tailwind CSS**: Utility-first styling with a custom "Glassmorphism" design system.
- **Framer Motion**: Smooth animations and transitions.
- **Recharts**: High-performance data visualizations.
- **Lucide React**: Clean, consistent iconography.
- **Axios**: Promised-based HTTP client for API communication.

### Backend
- **Node.js & Express**: Scalable server-side logic and RESTful API endpoints.
- **MongoDB & Mongoose**: Flexible NoSQL database for users, quizzes, and attempts.
- **JWT Authentication**: Secure, stateless authentication flow.
- **ExcelJS & Multer**: Processing for bulk file imports and data exports.

---

## ⚙️ Setup & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas instance)

### 1. Backend Setup
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder and configure your variables:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Start the backend server:
```bash
# For production
npm start

# For development (with auto-reload)
npm run dev
```

### 2. Database Seeding (Required for Admin)
To create a default admin account and a sample quiz, run the seed script:
```bash
cd backend
node seed.js
```
**Default Admin Credentials:**
- **Email:** `admin@example.com`
- **Password:** `AdminPassword123!`

> [!IMPORTANT]
> **Forced Password Change**: On the first login, even the admin will be prompted to change their password for security reasons. Once the password is successfully updated, this page will no longer be accessible.

### 3. Password Management
The password update page is restricted to users who are required to change their password (those with the `firstLoginRequired` flag set to `true`). After a successful update, users are automatically redirected to their dashboard and cannot manually return to the reset page.

### 4. Frontend Setup
Navigate to the frontend directory and install dependencies:
```bash
cd frontend
npm install
```

Start the frontend development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`. Make sure the backend is running on `http://localhost:5000` as the frontend is configured to communicate with this port.

> [!NOTE]
> If you change the backend port, remember to update the API URL in `frontend/src/config/apiConfig.js` to match your new port.

---

## 📈 Database Schema
- **User**: Stores profile information, mobile numbers, company details, and access flags.
- **Quiz**: Contains 10 questions, each with "In-Charge" and "In-Control" options, and status tracking (DRAFT, APPROVED, ACTIVE).
- **Attempt**: Records user results, individual responses, and timestamps for analytics.

## 📄 License
This project is private and intended for internal use.
