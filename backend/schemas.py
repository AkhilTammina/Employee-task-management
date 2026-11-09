from datetime import date

from pydantic import BaseModel, EmailStr, ConfigDict


class LoginInput(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    name: str
    role: str


class EmployeeCreate(BaseModel):
    name: str
    email: EmailStr
    department: str = "General"
    position: str = "Employee"


class EmployeeOut(EmployeeCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)


class TaskCreate(BaseModel):
    title: str
    description: str = ""
    employee_id: int
    deadline: date | None = None
    priority: str = "Medium"
    status: str = "Todo"


class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    employee_id: int | None = None
    deadline: date | None = None
    priority: str | None = None
    status: str | None = None


class TaskOut(BaseModel):
    id: int
    title: str
    description: str
    employee_id: int
    employee_name: str
    deadline: date | None
    priority: str
    status: str


class DashboardOut(BaseModel):
    employees: int
    tasks: int
    completed: int
    pending: int
