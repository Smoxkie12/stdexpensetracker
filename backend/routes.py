from fastapi import APIRouter

router = APIRouter()

# Login route
@router.post("/login")
def login(username: str, password: str):
    # For now, just return a dummy response
    return {"message": f"Welcome {username}!"}

# Expenses route
@router.get("/expenses")
def get_expenses():
    # Dummy data for testing
    return [
        {"id": 1, "name": "Books", "amount": 500},
        {"id": 2, "name": "Snacks", "amount": 150},
    ]


# from fastapi import APIRouter

# router = APIRouter()

# @router.get("/")
# def home():
#     return {"message": "Backend is running!"}
