# MediGuard Frontend Architecture

This directory contains the React application for the MediGuard platform. It provides the user interface for the AI-Powered Fake Medicine Detector, featuring a premium glassmorphic design and real-time interactions.

## Tech Stack
- **Framework**: React 18 (bootstrapped with Vite)
- **Styling**: TailwindCSS (with custom utilities for glassmorphism and animations)
- **State Management**: React Context API (`AuthContext`, `ThemeContext`)
- **Routing**: React Router DOM
- **Animations**: Framer Motion & React Three Fiber (for 3D Antigravity backgrounds)
- **Maps**: React Leaflet (for the Pharmacy Locator)
- **HTTP Client**: Axios

---

## 🏗️ Folder Structure

- `/src/components`: Reusable UI components (Navbar, Footer, `Antigravity.jsx`, Buttons).
- `/src/pages`: Main route views (`Home.jsx`, `Scanner.jsx`, `Dashboard.jsx`, `Profile.jsx`).
- `/src/context`: React Context providers for global state (Authentication, Theming).
- `/src/services`: API interaction layers (Axios instances and fetch wrappers).
- `/src/utils`: Helper functions, constants, and route definitions.

---

## 🔌 API Integration

The frontend communicates with the backend via a centralized Axios instance configured with interceptors.

### 1. Authentication Flow (`AuthContext.jsx`)
The frontend maintains session state using the `AuthContext`.
- **Login**: Sends credentials to `POST /api/v1/auth/login`. On success, stores `accessToken` in memory/localStorage and populates the `user` state.
- **Registration**: Sends profile data to `POST /api/v1/auth/register`. Automatically logs the user in upon success and redirects to the Home page.
- **Persistence**: Upon page reload, the app attempts to fetch the current profile using `GET /api/v1/auth/profile` with the stored token.

### 2. Neural Vision Scanner (`Scanner.jsx`)
The core feature of the app.
- **Upload**: User selects an image or takes a photo.
- **Process**: Sends the image as `multipart/form-data` to `POST /api/v1/scan/analyze`.
- **Response Handling**: The frontend parses the returned JSON containing `authenticityScore`, `medicineName`, and `batchNumber`.
- **UI Update**: Dynamically renders a Green (Authentic), Yellow (Warning), or Red (Fake) status card based on the score.

### 3. Chemist Map (`ChemistLocator.jsx`)
Displays verified pharmacies on an interactive map.
- **Fetch Data**: Calls `GET /api/v1/chemist/nearby` passing the user's current geolocation (lat/lng).
- **Render**: Uses `react-leaflet` to plot markers for each pharmacy. Pharmacies with a `verificationStatus` of `verified` are shown with a green badge.

---

## 🎨 UI & Design Principles

The application employs a "Premium Glassmorphism" design language:
- **Depth**: Elements use `backdrop-blur-xl` and `backdrop-blur-2xl` to create frosted glass effects.
- **Dynamic Backgrounds**: The `Home.jsx` page features an interactive 3D particle system (`<Antigravity />`) that responds to mouse movement, creating an immersive "field" effect.
- **Dark/Light Mode**: Full support for theme switching via `ThemeContext`, dynamically adjusting gradients, border opacities, and shadow strengths.

## 🚀 Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment:
   Create a `.env` file in the `Frontend` directory:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api/v1
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`.
