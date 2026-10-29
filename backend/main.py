
import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from database import engine

load_dotenv()

app = FastAPI(
    title="MARS Fines & Fees Management API",
    version="1.0.0",
    description="Backend APIs for managing fines, fees, and reviews.",
)

frontend_origin = os.getenv(
    "FRONTEND_ORIGIN",
    "http://localhost:8443",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "MARS Fines & Fees API is running",
        "docs": "/docs",
    }


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/health/database")
def database_health():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "status": "connected",
            "database": "Microsoft SQL Server",
        }

    except SQLAlchemyError:
        return {
            "status": "error",
            "message": "Database connection failed. Check server configuration.",
        }
