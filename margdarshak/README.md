# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
# 🚚 MargDarshak – Multi-Vehicle Intelligence Platform

MargDarshak is a **smart fleet monitoring and logistics intelligence platform** designed to help companies manage and optimize multiple delivery vehicles in real time. The system provides a centralized dashboard where fleet managers can track vehicle activity, monitor delivery performance, and gain operational insights through analytics.

The platform simulates a **modern logistics control center**, enabling efficient fleet management through real-time visualization, delivery metrics, and intelligent alerts.

---

## 🌍 Problem Statement

Logistics and delivery companies often face challenges such as:

* Limited visibility of vehicle locations
* Inefficient delivery routes
* Delays caused by traffic or weather conditions
* Difficulty managing multiple delivery vehicles simultaneously

These issues lead to **higher operational costs and slower deliveries**.

---

## 💡 Our Solution

MargDarshak provides a **real-time fleet intelligence dashboard** that helps fleet managers:

* Track vehicles live on a map
* Monitor delivery performance
* View operational analytics
* Predict delivery arrival time
* Optimize decision making through intelligent alerts

The platform improves **fleet efficiency, delivery speed, and operational monitoring**.

---

## ✨ Key Features

### 🚗 Real-Time Fleet Monitoring

Track multiple delivery vehicles on a live map interface and monitor their movement in real time.

### 📊 Delivery Analytics Dashboard

Displays important performance metrics such as:

* Active vehicles
* Deliveries completed
* Average delivery time
* Customer ratings

### ⏱ ETA Prediction

Predicts estimated time of arrival (ETA) for deliveries to improve customer experience.

### ⚡ Intelligent Operational Alerts

Provides alerts for conditions affecting deliveries such as weather or operational delays.

### 🚲 Multi-Vehicle Fleet Support

Supports different vehicle categories including:

* Bicycle
* Scooter
* Cargo Van
* Truck
* Drone
* Electric Vehicles

---

## 🛠 Tech Stack

### Frontend

* React
* Vite
* JavaScript
* CSS

### Backend

* Node.js
* Express.js

### Database

* MongoDB

### Deployment

Frontend – Vercel
Backend – Render

---

## ⚙️ System Architecture

User
↓
Frontend Dashboard (React)
↓
Backend API (Node.js / Express)
↓
Database (MongoDB)

The backend processes vehicle and delivery data and sends it to the frontend dashboard for visualization.

---

## 📂 Project Structure

```
margdarshak
│
├── frontend
│   ├── src
│   ├── components
│   └── pages
│
├── backend
│   ├── routes
│   ├── controllers
│   └── models
│
├── README.md
└── package.json
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```
git clone https://github.com/your-username/margdarshak.git
cd margdarshak
```

### 2️⃣ Install Dependencies

Frontend

```
cd frontend
npm install
```

Backend

```
cd backend
npm install
```

### 3️⃣ Setup Environment Variables

Create a `.env` file inside the backend folder:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
```

### 4️⃣ Run the Project

Start backend server:

```
npm run server
```

Start frontend:

```
npm run dev
```

Open in browser:

```
http://localhost:5173
```

---

## 📦 Use Cases

MargDarshak can be used in:

* Logistics and transportation companies
* Food delivery services
* E-commerce delivery systems
* Smart city transportation monitoring

---

## 🔮 Future Enhancements

* Real GPS based vehicle tracking
* AI powered route optimization
* Driver performance monitoring
* Mobile application for drivers
* Advanced predictive analytics

---

## 👨‍💻 Contributors

Developed by **Team XeroCoders**

---

## 📜 License

This project is developed for educational and hackathon purposes.
