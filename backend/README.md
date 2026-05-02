# MediGuard Backend Architecture & API Reference

This directory contains the Express.js / Node.js backend for the MediGuard application. It powers the core AI-vision medicine verification, handles authentication, and manages the global supply chain database of pharmacies and drug batches.

## Tech Stack
- **Framework**: Express.js (Node.js)
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens), bcrypt for password hashing
- **File Uploads**: Multer & Cloudinary
- **AI Integration**: Groq API (Vision Models) for neural-vision drug verification
- **Location Services**: GeoJSON for spatial queries (finding nearby pharmacies)

## Base API Response Format
All APIs return a standardized JSON structure based on the `ApiResponse` class:
```json
{
  "statusCode": 200,
  "data": { ... },
  "message": "Success message",
  "success": true
}
```

---

## 1. Authentication API (`/api/v1/auth`)

### `POST /register`
Registers a new user or chemist.
- **Body**: `{ name, email, password, role, phone, ...chemistDetails }`
- **Response**:
  ```json
  {
    "statusCode": 201,
    "data": {
      "user": { "_id": "...", "name": "John", "email": "john@test.com", "role": "user" },
      "chemist": null,
      "accessToken": "ey...",
      "refreshToken": "ey..."
    },
    "message": "User registered successfully",
    "success": true
  }
  ```

### `POST /login`
Authenticates a user.
- **Body**: `{ email, password }`
- **Response**:
  ```json
  {
    "statusCode": 200,
    "data": {
      "user": { "_id": "...", "name": "John", "email": "john@test.com", "role": "chemist" },
      "chemist": { "pharmacyName": "MediLife", "licenseNumber": "12345" },
      "accessToken": "ey...",
      "refreshToken": "ey..."
    },
    "message": "Login successful",
    "success": true
  }
  ```

---

## 2. Scan & Vision API (`/api/v1/scan`)

### `POST /analyze`
Analyzes an uploaded image of a medicine strip using Groq's Vision AI (`llama-3.2-11b-vision-preview`).
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `multipart/form-data` with `image` file
- **Response**:
  ```json
  {
    "statusCode": 200,
    "data": {
      "scanId": "abc123xyz",
      "analysis": {
        "medicineName": "Paracetamol 500mg",
        "batchNumber": "B12345",
        "expiryDate": "12/2026",
        "authenticityScore": 98,
        "isVerified": true,
        "warnings": []
      },
      "imageUrl": "https://res.cloudinary.com/..."
    },
    "message": "Medicine verified successfully",
    "success": true
  }
  ```

---

## 3. Batch Verification API (`/api/v1/batch`)

### `GET /verify/:batchNumber`
Checks a batch number against the central database to ensure it hasn't been recalled or marked as counterfeit.
- **Response**:
  ```json
  {
    "statusCode": 200,
    "data": {
      "batchNumber": "B12345",
      "manufacturer": "PharmaCorp",
      "manufacturingDate": "2023-01-01",
      "expiryDate": "2025-01-01",
      "status": "active",
      "isAuthentic": true
    },
    "message": "Batch verified",
    "success": true
  }
  ```

---

## 4. Reports & CDSCO API (`/api/v1/reports`)

### `POST /submit`
Submits a counterfeit medicine report directly to regulatory bodies (CDSCO).
- **Body**: `{ scanId, location, description, pharmacyId }`
- **Response**:
  ```json
  {
    "statusCode": 201,
    "data": {
      "caseId": "CASE-9876",
      "reportId": "65ab34cd..."
    },
    "message": "Report submitted successfully",
    "success": true
  }
  ```

---

## 5. Chemist Network API (`/api/v1/chemist`)

### `GET /nearby`
Finds verified pharmacies within a specific radius using MongoDB GeoSpatial queries.
- **Query**: `?lat=28.7041&lng=77.1025&radius=5` (radius in km)
- **Response**:
  ```json
  {
    "statusCode": 200,
    "data": [
      {
        "pharmacyName": "City Meds",
        "address": "New Delhi",
        "verificationStatus": "verified",
        "location": { "type": "Point", "coordinates": [77.1025, 28.7041] }
      }
    ],
    "message": "Nearby chemists fetched",
    "success": true
  }
  ```

## Security & Rate Limiting
- **Global Rate Limiting**: Enabled on `/api/v1/auth` to prevent brute-force attacks.
- **JWT Middleware**: Validates `accessToken` via `auth.middleware.js`. Extracts user ID and appends `req.user`.
