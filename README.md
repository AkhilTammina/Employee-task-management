# Employee Task Management System

A beginner-friendly full-stack project using React + Vite, FastAPI, SQLite, SQLAlchemy and JWT authentication.

## Requirements
- Python 3.10+
- Node.js 18+
- npm

## 1. Start the backend (Windows)

Open a terminal in the project folder:

```powershell
cd backend
python -m venv venv
venv\Scripts\activate
python -m pip install -r requirements.txt
uvicorn main:app --reload
```

Backend: http://127.0.0.1:8000  
API documentation: http://127.0.0.1:8000/docs

The database file `employee_tasks.db` is created automatically.

## 2. Start the frontend

Open a SECOND terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the URL printed by Vite (normally http://localhost:5173).

## Demo login
- Email: `admin@example.com`
- Password: `admin123`

The backend creates this admin account automatically on first startup.

## Features
- JWT login and logout
- Admin dashboard summary
- Employee create, list and delete
- Task create, list, update status and delete
- Assign tasks to employees
- Deadline and priority fields
- Search and status filtering
- SQLite persistence

## Notes
- This is a learning/demo project. Change the JWT secret and demo password before real deployment.
- The demo UI is designed for local development.
- To reset the demo database, stop the backend and delete `backend/employee_tasks.db`; it will be recreated on next start.
