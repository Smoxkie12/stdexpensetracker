from fastapi import FastAPI,HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI(title="Student Expense Tracker API")

# Allow your frontend (served from another port) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Expense(BaseModel):
    id: str
    name: str
    amount: float
    category: str
    date: str

expenses_db: List[dict] = []

# starting creating our endpoints

# to get our data from frontend as id,name,amount,category,date
@app.get("/api/expenses",response_model=list[Expense])
def get_expense():
    return(
        expenses_db
    )

# creating a saveexpense function as our next route
@app.post("/api/expenses", status_code=201)
def save_expense(expense: Expense):
    # Fix: expense.model_dump() (FastAPI v2/Pydantic v2) ya expense.dict() (Pydantic v1)
    expenses_db.append(expense.model_dump()) 
    return {"message": "expense saved successfully", "data": expense}

# to delete an existing expense
# Note: Endpoint name s ke sath rakhein (/api/expenses) taaki JS frontend se match ho
@app.delete("/api/expenses/{expense_id}")
def delete_expense(expense_id: str):
    global expenses_db
    initial_count = len(expenses_db)
    
    # Fix 1: expenses_db (s miss ho gaya tha)
    # Fix 2: expense_id (es_id ki jagah e_id hoga, parameter name se match karne ke liye)
    expenses_db = [e for e in expenses_db if e["id"] != expense_id]
    
    if len(expenses_db) == initial_count:
        raise HTTPException(status_code=404, detail="expense not found")
        
    return {"message": "expense deleted successfully"}
