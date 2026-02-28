# CipherSQLStudio

CipherSQLStudio is a browser-based SQL practice environment built for the assignment workflow where users can write and execute SQL queries against a pre-loaded sample database.

The platform focuses on providing a smooth SQL learning experience with a clean editor workflow, real-time query execution, and clear visibility of results.

<img width="1347" height="595" alt="image" src="https://github.com/user-attachments/assets/4805d5f2-2e95-419b-9b81-2fb35410d54a" />
<img width="1257" height="323" alt="image" src="https://github.com/user-attachments/assets/f513bd62-f2e8-4682-a716-d497b839e57d" />

---

## 🚀 Overview

This project allows users to:

- Load a pre-configured sample database schema
- Write SQL queries using a Monaco Editor
- Execute queries in real time
- View execution results instantly
- Interact with a sandbox database environment

The goal is to provide a simple and focused SQL practice interface rather than a database creation tool.

---

## ✨ Core Functionality

### 1. SQL Editor Interface
- Monaco Editor for writing SQL queries
- SQLite sandbox used for executing queries
- Editor placed on the left side of the interface

### 2. Query Execution
- Users can run queries using the **Run Query** button
- Query results are displayed in the right panel
- Output updates in real time after execution

### 3. Sample Database Loader
- **Load DB** button loads a pre-made database schema
- User is automatically navigated to the bottom section where the sample schema is shown
- Sample database can be used immediately for querying

### 4. Database Session Handling
When **Load DB** is clicked:

- If a user already has a database created within the last **1 hour**, the existing database is reused.
- If not, a new database instance is created.
- Every database instance has a **1 hour expiration**.
- Remaining expiration time is shown to the user after loading the database.

---

## 🧱 Tech Stack

### Frontend
- React.js
- Monaco Editor

### Backend / Data
- Node.js / Express.js
- SQLite Sandbox (query execution)
- MongoDB (persisting user info and database instance information)

---

## 🖥️ UI Overview

- Top right controls:
  - **Load DB** → loads or reconnects to user database
  - **Run Query** → executes SQL written in editor
- Left Panel:
  - SQL Monaco Editor
- Right Panel:
  - Query result output
- Bottom Section:
  - Preloaded sample database schema viewer

---

## 🔄 Flow Summary

1. User clicks **Load DB**
2. System checks for existing DB instance
3. Existing DB reused (if within 1 hour) or new DB created
4. Expiration timer shown to user
5. User writes SQL query in Monaco Editor
6. User clicks **Run Query**
7. Query executes in SQLite sandbox
8. Results displayed in output panel

---

## 📌 Assignment Context

This project is built as part of the **CipherSQLStudio Assignment**, focusing on:

- Browser-based SQL practice experience
- Pre-loaded sample data usage
- Real-time query execution
- User-focused SQL learning workflow

---

## ▶️ Running Locally



```bash
# install dependencies
npm install

# start project
npm run dev
```


