from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func
from sqlalchemy.orm import Session

from auth import (
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)
from database import Base, SessionLocal, engine, get_db
from models import Employee, Task, User
from schemas import (
    DashboardOut,
    EmployeeCreate,
    EmployeeOut,
    LoginInput,
    TaskCreate,
    TaskOut,
    TaskUpdate,
    TokenResponse,
)


Base.metadata.create_all(bind=engine)

app = FastAPI(title="Employee Task Management API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def seed_admin():
    db = SessionLocal()

    # Admin account details
    admin_name = "Akhil"
    admin_email = "akhil2ko77@gmail.com"
    admin_password = "Akhil@2007"

    try:
        # Find existing admin account
        user = db.query(User).filter(User.role == "admin").first()

        if not user:
            # Create admin account
            user = User(
                name=admin_name,
                email=admin_email,
                hashed_password=hash_password(admin_password),
                role="admin",
            )
            db.add(user)
        else:
            # Update existing admin account
            user.name = admin_name
            user.email = admin_email
            user.hashed_password = hash_password(admin_password)

        db.commit()
        print("Admin account created/updated successfully!")
    except Exception as error:
        db.rollback()
        print("Error creating admin account:", error)
    finally:
        db.close()


seed_admin()


@app.get("/")
def home():
    return {"message": "Employee Task Management API is running"}


@app.post("/auth/login", response_model=TokenResponse)
def login(data: LoginInput, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    return TokenResponse(
        access_token=create_access_token(user),
        name=user.name,
        role=user.role,
    )


@app.get("/auth/me")
def me(user: User = Depends(get_current_user)):
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
    }


@app.get("/employees", response_model=list[EmployeeOut])
def get_employees(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return db.query(Employee).order_by(Employee.id.desc()).all()


@app.post("/employees", response_model=EmployeeOut)
def add_employee(
    data: EmployeeCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    existing_employee = (
        db.query(Employee).filter(Employee.email == data.email).first()
    )
    if existing_employee:
        raise HTTPException(
            status_code=400,
            detail="An employee with this email already exists",
        )

    employee = Employee(**data.model_dump())
    db.add(employee)
    db.commit()
    db.refresh(employee)
    return employee


@app.delete("/employees/{employee_id}")
def delete_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    db.delete(employee)
    db.commit()
    return {"message": "Employee deleted successfully"}


def task_to_dict(task: Task):
    return {
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "employee_id": task.employee_id,
        "employee_name": task.employee.name,
        "deadline": task.deadline,
        "priority": task.priority,
        "status": task.status,
    }


@app.get("/tasks", response_model=list[TaskOut])
def get_tasks(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    tasks = db.query(Task).order_by(Task.id.desc()).all()
    return [task_to_dict(task) for task in tasks]


@app.post("/tasks", response_model=TaskOut)
def add_task(
    data: TaskCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    employee = db.query(Employee).filter(Employee.id == data.employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Assigned employee not found")

    task = Task(**data.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task_to_dict(task)


@app.patch("/tasks/{task_id}", response_model=TaskOut)
def update_task(
    task_id: int,
    data: TaskUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    updates = data.model_dump(exclude_unset=True)
    if "employee_id" in updates:
        employee = (
            db.query(Employee)
            .filter(Employee.id == updates["employee_id"])
            .first()
        )
        if not employee:
            raise HTTPException(
                status_code=404,
                detail="Assigned employee not found",
            )

    for key, value in updates.items():
        setattr(task, key, value)

    db.commit()
    db.refresh(task)
    return task_to_dict(task)


@app.delete("/tasks/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()
    return {"message": "Task deleted successfully"}


@app.get("/dashboard", response_model=DashboardOut)
def dashboard(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    total_employees = db.query(func.count(Employee.id)).scalar() or 0
    total_tasks = db.query(func.count(Task.id)).scalar() or 0
    completed = (
        db.query(func.count(Task.id))
        .filter(Task.status == "Completed")
        .scalar()
        or 0
    )

    return DashboardOut(
        employees=total_employees,
        tasks=total_tasks,
        completed=completed,
        pending=total_tasks - completed,
    )
