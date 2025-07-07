# Full-Stack Cashier System

This is a complete cashier system built with a Python/Flask backend and a React frontend. It supports barcode scanning, transaction history, and printing receipts.

## Project Structure

-   `backend/`: Flask application serving the API.
-   `frontend/`: React single-page application for the UI.
-   `create_db.py`: Script to initialize the SQLite database.
-   `schema.sql`: SQL schema for the database.

## Prerequisites

-   Python 3.8+ and `pip`
-   Node.js 18+ and `npm`

## Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Create a virtual environment and activate it:**
    ```bash
    python -m venv venv
    # On Windows
    .\venv\Scripts\activate
    # On macOS/Linux
    source venv/bin/activate
    ```

3.  **Install Python dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Go back to the root directory:**
    ```bash
    cd ..
    ```

5.  **Create and populate the database:**
    Run this script from the **root directory**. It will create `backend/database/cashier_system.db`.
    ```bash
    python create_db.py
    ```

    Sample Login Credentials:
    -   Username: `admin`, Password: `adminpass`
    -   Username: `cashier1`, Password: `cashierpass`

6.  **Start the backend server:**
    Navigate back into the `backend` directory and run Flask.
    ```bash
    cd backend
    flask --app src/main run
  Run direct..  ```
.\venv\Scripts\flask --app src/main run
    The backend will be running at `http://127.0.0.1:5000`.

## Frontend Setup

1.  **Open a new terminal** and navigate to the frontend directory:
    ```bash
    cd frontend
    ```

2.  **Install Node.js dependencies:**
    ```bash
    npm install
    ```

3.  **Start the frontend development server:**
    ```bash
    npm run dev
    ```
    The frontend will be available at `http://localhost:5173`. Open this URL in your browser to use the application. The vite dev server will automatically proxy API requests to the Flask backend.

## How to Use

1.  Open the application in your browser (`http://localhost:5173`).
2.  Log in with one of the sample accounts.
3.  On the cashier page, the barcode input field is auto-focused. You can type a barcode (e.g., `123456789012`) and press `Enter` to simulate a scan.
4.  Add items to the cart, complete the sale with Cash or Card.
5.  Navigate to the "Sales History" to view past transactions.
6.  Click on a sale to view and print its receipt.