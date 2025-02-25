# app/main.py
from fastapi import FastAPI
from app.routes import enrollment

app = FastAPI()

app.include_router(enrollment.router)
