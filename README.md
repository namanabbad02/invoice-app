---

# Embellish Jewels - Full-Stack Invoicing & Dashboard SaaS

 ![Dashboard Screenshot](https://github.com/namanabbad02/invoice-app/blob/main/assets/dashboad-light.png?raw=true)
  ![Dashboard Screenshot](https://github.com/namanabbad02/invoice-app/blob/main/assets/dashboad-dark.png?raw=true)

A modern, full-stack invoicing application designed for Embellish Jewels, featuring a complete suite of tools for managing products, customers, and invoices, along with a powerful analytics dashboard. Built with a React frontend and a Node.js/Express backend, this application is designed to be robust, scalable, and user-friendly.

## ✨ Key Features

-   **📝 Invoicing System:**
    -   **Dynamic Invoice Creation:** Easily create new invoices with a searchable product dropdown, automatic total calculations, and discount options (fixed or percentage).
    -   **Customer Management:** Automatically saves and retrieves customer data based on a unique phone number, with email as an optional field.
    -   **Product Management:** Full CRUD (Create, Read, Update, Delete) functionality for the product catalog, including custom Product IDs and categories.

-   **📊 Admin Dashboard:**
    -   **At-a-Glance KPIs:** Animated cards showing Today's Revenue, Monthly Revenue, Best-Selling Product, and Total Discounts.
    -   **Interactive Charts:**
        -   **Revenue Overview:** A beautiful area chart showing sales trends, with a toggle for hourly (Today) and daily (Last 7 Days) views, fully time-zone aware for Indian Standard Time (IST).
        -   **Top Products:** Bar chart displaying the top 5 best-selling products.
        -   **Sales by Category:** Donut chart providing a clear breakdown of sales across different product categories.
    -   **Recent Invoices:** A quick-view table of the 5 most recent invoices with links to view details.

-   **🤖 Automation & Delivery:**
    -   **Automated PDF Generation:** Invoices are automatically generated into professional PDF documents upon creation.
    -   **Cloud Storage Integration:** Seamless, automatic upload of generated invoice PDFs to Google Drive using the Google Drive API.
    -   **Multi-Channel Delivery:**
        -   **Email:** Automatically emails the PDF invoice to the customer if an email address is provided.
        -   **WhatsApp:** Send invoice PDFs directly to customers via WhatsApp using the Twilio API.

-   **🔒 Authentication & Security:**
    -   **JWT Authentication:** Secure user authentication with JSON Web Tokens to protect all sensitive routes and data.
    -   **Global Login Modal:** A non-intrusive, global login modal appears automatically for session expiry or when accessing protected pages, ensuring a seamless user experience.

-   **💎 Modern UI/UX:**
    -   **Responsive Design:** A beautiful and fully responsive interface that works flawlessly on desktop, tablet, and mobile devices.
    -   **SaaS Aesthetics:** A modern, dark-themed UI featuring glassmorphism, gradient accents, and soft shadows.
    -   **Rich Animations:** Smooth page transitions, animated charts, count-up numbers, and micro-interactions powered by Framer Motion.
    -   **Modern Components:** Floating label inputs, styled country-code selector for phone numbers, and a custom searchable product dropdown with keyboard navigation.
    -   **Toast Notifications:** A clean, non-blocking notification system for all user actions (success, warning, error).

## 🚀 Live Demo

[**https://invoice-app-lake-three.vercel.app/**]

## 🛠️ Tech Stack

### Frontend
-   **Framework:** React.js
-   **Styling:** Tailwind CSS
-   **Animations:** Framer Motion
-   **Charts:** Recharts
-   **API Client:** Axios
-   **UI Components:** `react-toastify`, `react-phone-input-2`, `react-spinners`, `lucide-react`

### Backend
-   **Framework:** Node.js, Express.js
-   **Database:** MySQL
-   **ORM:** Sequelize
-   **Authentication:** JSON Web Token (JWT), bcrypt
-   **PDF Generation:** pdfmake
-   **File Storage:** Google Drive API
-   **Messaging/Email:** Twilio (for WhatsApp), Nodemailer

### Deployment
-   **Database:** Railway (MySQL)
-   **Backend:** Render (Node.js Web Service)
-   **Frontend:** Vercel

## ⚙️ Getting Started

### Prerequisites

-   Node.js (v18 or later)
-   npm / yarn
-   A running MySQL database instance (local or cloud)
-   Accounts for:
    -   Twilio (with WhatsApp Sandbox configured)
    -   Google Cloud Platform (with Drive API enabled and OAuth credentials)
    -   A Gmail account with an "App Password" for Nodemailer

### Installation & Setup

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/namanabbad02/invoice-app.git
    cd invoice-app
    ```

2.  **Backend Setup:**
    -   Navigate to the backend folder: `cd backend`
    -   Install dependencies: `npm install`
    -   Create a `.env` file by copying `.env.example` (you should create this file). Populate it with all the required API keys and database credentials:
        ```env
        # Database
        DATABASE_URL="mysql://user:password@host:port/databasename"

        # Security
        JWT_SECRET="your_super_secret_key"

        # Email (Nodemailer)
        EMAIL_USER="your.email@gmail.com"
        EMAIL_PASS="your_gmail_app_password"

        # Twilio
        TWILIO_ACCOUNT_SID="..."
        TWILIO_AUTH_TOKEN="..."
        TWILIO_WHATSAPP_NUMBER="..."

        # Google Drive OAuth 2.0
        GOOGLE_DRIVE_CLIENT_ID="..."
        GOOGLE_DRIVE_CLIENT_SECRET="..."
        GOOGLE_DRIVE_REDIRECT_URI="https://developers.google.com/oauthplayground"
        GOOGLE_DRIVE_REFRESH_TOKEN="..."
        GOOGLE_DRIVE_FOLDER_ID="..."
        ```    -   Start the backend server: `npm start`

3.  **Frontend Setup:**
    -   Navigate to the frontend folder: `cd ../frontend`
    -   Install dependencies: `npm install`
    -   Create a `.env` file in the `/frontend` directory for local development:
        ```env
        REACT_APP_API_URL=http://localhost:3001/api
        ```
    -   Start the frontend development server: `npm start`

The application should now be running locally, with the frontend at `http://localhost:3000` and the backend at `http://localhost:3001`.

---
