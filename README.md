# Sales and Service Management System

A professional Sales and Service Management System for "Third Eye Technologies". This application provides a full-featured dashboard for Admins, Customers, and Service Engineers.

## 🚀 Features

-   **Admin Panel:** Manage products, service requests, and engineer assignments.
-   **Engineer Portal:** Real-time task tracking, OTP verification, and service history.
-   **Customer Portal:** Product browsing and service request tracking.
-   **Authentication:** JWT-based secure login with role-based access control.

## 🛠️ Tech Stack

-   **Backend:** Node.js, Express, MongoDB (Mongoose).
-   **Frontend:** Vanilla JS, HTML, CSS (Premium Aesthetics).
-   **Auth:** JWT (JSON Web Tokens).

## 📦 Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/YOUR_USERNAME/sale-service-system.git
    cd sale-service-system
    ```
2.  **Backend Setup:**
    ```bash
    cd backend
    npm install
    ```
3.  **Environment Variables:**
    Create a `.env` file in the `backend/` directory:
    ```env
    PORT=5000
    MONGODB_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    ```
4.  **Run the application:**
    ```bash
    # From the backend directory
    npm run dev
    ```

## 🌐 Deployment

See the [hosting_guide.md](hosting_guide.md) for AWS Free Tier instructions.
