# ✈️ TravelMan – Travel Manager & Activities Planner Web App

TravelMan is a full-stack web application that automates travel itinerary organization and expense tracking.

Instead of manually copying data from emails and booking confirmations, users simply upload screenshots of flights, hotels, or tickets. The system extracts key information using OCR and AI, then automatically generates a structured itinerary.

This project was developed as a Bachelor Thesis (Computer Science BSc, ELTE, 2025).

---

## 🚀 Features

### 📄 AI-Powered Booking Extraction
- Upload booking screenshots (flights, hotels, transport, events)
- OCR extracts raw text (Google Cloud Vision API)
- GPT-4 parses text into structured JSON
- Activities and expenses are automatically created inside the selected trip

### 🧳 Trip Management
- Create and manage multiple trips
- Define trip start and end dates
- View trip summaries on the dashboard
- Real-time synchronization with Firestore

### 📅 Itinerary View
- Calendar-like grouped layout by date
- Automatically sorted activities
- Edit and delete functionality
- Live UI updates using Firestore `onSnapshot()`

### 💰 Expense Tracking
- Manual expense entry
- Auto-generated expenses from AI parsing
- Categorized expenses (Food, Transport, Hotel, Flight, Activity, Shopping, Others)
- Negative values supported (refunds)
- Dynamic total calculation

### 📦 Secure File Storage
- Uploaded files stored per user
- Download previous uploads
- Search files by name
- Storage access restricted via Firebase security rules

### 🔐 Security
- Firebase Authentication (Email/Password)
- Per-user Firestore data isolation
- Secure storage rules
- Token-based session handling

---

## 🏗 Architecture

The application follows a Model–View–Controller (MVC) architecture.

### View
- React frontend
- Component-based UI
- Real-time listeners for database updates

### Controller
- Handles user interactions
- Manages upload flows
- Coordinates OCR + AI pipeline

### Model
- Firestore (Trips, Activities, Expenses)
- Firebase Storage
- Cloud Functions
- OCR Engine
- OpenAI API integration

---

## 🔄 OCR + AI Processing Pipeline

1. User uploads screenshot
2. File stored in Firebase Storage
3. Cloud Function triggers automatically
4. Google Vision API extracts text
5. Extracted text sent to OpenAI GPT-4
6. GPT returns structured JSON
7. Activities + Expenses saved to Firestore
8. UI updates instantly

---

## 🗄 Database Structure (Firestore)
Users
Trips
├── activities
├── expenses
└── storage


### Relationships

- One User → Many Trips
- One Trip → Many Activities
- One Trip → Many Expenses
- OCR results stored separately for modular processing

---

## 🛠 Tech Stack

### Frontend
- React
- JavaScript (ES6+)
- HTML5
- CSS3

### Backend (Serverless)
- Firebase Authentication
- Firestore (NoSQL database)
- Firebase Storage
- Firebase Cloud Functions

### AI & OCR
- Google Cloud Vision API (OCR)
- OpenAI GPT-4 API (Structured parsing)

---

### 🧪 Testing
The project includes:
Manual feature testing
Integration testing (OCR → AI → Firestore → UI)
Real-time sync verification
OOP-based entity testing (TripItem, Activity, Expense classes)
