from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import uuid

app = FastAPI()

class Expense(BaseModel):
    id: str
    name: str
    amount: float
    category: str
    date: str

expenses: List[Expense] = []


# roadmap for my backend

# step-1 To create a new backend endpoint for connection in line 23 of app.js
@app.get("/api/expenses")
def get_expenses():
    return expenses

# step 2 - to create a new backend endpoint for connection in line 32 of app.js
@app.post("api/expenses")
def save_expense(expense: Expense):
    expense.id = str(uuid.uuid4())
    expenses.append(expense)
    return {"message": "Expense saved", "expense": expense}

# step-3 to create a new backend endpont for connection in line 44 of app.js

@app.delete("/api/expenses/{expense_id}")
def delete_expense(expense_id: str):
    global expenses
    expenses = [e for e in expenses if e.id != expense_id]
    return {"message": "Expense deleted"}


