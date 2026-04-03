# Pollution & Health Analyzer

A comprehensive dashboard for tracking and predicting pollution levels and their impact on public health in Atchutapuram, Andhra Pradesh.

## Project Structure
- **Backend/**: Python/Flask API that handles data simulation and health predictions.
- **Frontend/**: A modern, interactive dashboard built with vanilla JavaScript and CSS.

---

## Getting Started

Follow these steps to run the project locally on your machine.

### 1. Run the Backend
The backend is a Flask API that serves pollution and hospital data.

**Prerequisites:**
- Python 3.x installed on your system.

**Steps:**
1. Open your terminal or command prompt.
2. Navigate to the `Backend` directory:
   ```bash
   cd Project/Backend
   ```
3. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the server:
   ```bash
   python app.py
   ```
   > [!NOTE]
   > The backend will run at `http://127.0.0.1:5000`.

### 2. Run the Frontend
The frontend is a static web application that communicates with the backend.

**Steps:**
1. Navigate to the `Frontend` directory:
   ```bash
   cd Project/Frontend
   ```
2. Open `index.html` in your browser.
   - **Recommended:** For the best experience (and to handle Firebase module imports correctly), use a local web server like **Live Server** (VS Code extension).
   - Alternatively, use Python's built-in server:
     ```bash
     python -m http.server 8000
     ```
     Then visit `http://localhost:8000` in your browser.

---

## Features
- **Real-time Pollution Tracking**: Monitor AQI, PM2.5, PM10, and NO2.
- **Health Predictions**: View predicted hospital cases for various diseases (COPD, Stroke, etc.) based on pollution levels.
- **Interactive Maps**: Locate hospitals in Atchutapuram.
- **Theme Switching**: Seamlessly toggle between Light and Dark modes.
- **Data Export**: Download data in CSV format.

---

## API Endpoints
- `GET /data`: Returns aggregated pollution and prediction data for all hospitals.
- `GET /predict?month=...&year=...&hospital=...`: Returns health predictions for a specific location.

---

## Deployment to Render

You can deploy this project to Render either automatically (using a Blueprint) or manually (setting up separate services).

### Option 1: Automatic Deployment (Blueprint)
This is the fastest way to get both services running at once.
1.  **Push your code to GitHub.**
2.  Login to your [Render Dashboard](https://dashboard.render.com/).
3.  Click **New +** and select **Blueprint**.
4.  Connect your GitHub repository.
5.  Render will automatically use the `render.yaml` file to set up both the **Backend** and **Frontend**.

---

### Option 2: Manual Deployment (Separate Services)
Use this if you want to manage the Backend and Frontend independently.

#### 1. Deploy the Backend (Web Service)
1.  Click **New +** on Render and select **Web Service**.
2.  Connect your GitHub repository.
3.  Set the following configuration:
    -   **Name:** `pollution-backend`
    -   **Root Directory:** `Project/Backend`
    -   **Runtime:** `Python 3`
    -   **Build Command:** `pip install -r requirements.txt`
    -   **Start Command:** `gunicorn app:app`
4.  Click **Create Web Service**.

#### 2. Deploy the Frontend (Static Site)
1.  Wait for the Backend to deploy, then copy its URL (e.g., `https://pollution-backend.onrender.com`).
2.  Update the `API` constant in `Project/Frontend/script.js` with your backend URL:
    ```javascript
    const API = "https://your-backend-name.onrender.com";
    ```
3.  Commit and push this change to GitHub.
4.  Click **New +** on Render and select **Static Site**.
5.  Connect your GitHub repository.
6.  Set the following configuration:
    -   **Name:** `pollution-frontend`
    -   **Root Directory:** `Project/Frontend`
    -   **Build Command:** (Leave empty)
    -   **Publish Directory:** `.`
7.  Click **Create Static Site**.
