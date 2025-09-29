from fastapi import APIRouter, HTTPException, Response, Request, Depends
from pydantic import BaseModel
from datetime import datetime, timezone, timedelta
from motor.motor_asyncio import AsyncIOMotorDatabase, AsyncIOMotorClient
import os
import logging
from typing import Optional
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

logger = logging.getLogger(__name__)

auth_router = APIRouter(prefix="/auth", tags=["authentication"])

class UserSessionData(BaseModel):
    id: str
    email: str
    name: str
    picture: str
    session_token: str

class UserData(BaseModel):
    id: str
    email: str
    name: str
    picture: str

@auth_router.post("/session")
async def store_session(user_data: UserSessionData, response: Response):
    """Store user session data and set httpOnly cookie"""
    try:
        # Calculate expiry (7 days from now)
        expiry = datetime.now(timezone.utc) + timedelta(days=7)
        
        # Store session in database
        session_doc = {
            "session_token": user_data.session_token,
            "user_id": user_data.id,
            "email": user_data.email,
            "name": user_data.name,
            "picture": user_data.picture,
            "expires_at": expiry,
            "created_at": datetime.now(timezone.utc)
        }
        
        await db.user_sessions.insert_one(session_doc)
        
        # Check if user exists, if not create user
        existing_user = await db.users.find_one({"email": user_data.email})
        if not existing_user:
            user_doc = {
                "id": user_data.id,
                "email": user_data.email,
                "name": user_data.name,
                "picture": user_data.picture,
                "created_at": datetime.now(timezone.utc)
            }
            await db.users.insert_one(user_doc)
        
        # Set httpOnly cookie
        response.set_cookie(
            key="session_token",
            value=user_data.session_token,
            max_age=7 * 24 * 60 * 60,  # 7 days in seconds
            httponly=True,
            secure=True,
            samesite="none",
            path="/"
        )
        
        return {"status": "success", "message": "Session stored successfully"}
        
    except Exception as e:
        logger.error(f"Error storing session: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to store session")

@auth_router.get("/me")
async def get_current_user(request: Request):
    """Get current user from session token"""
    try:
        # Try to get session token from cookies first, then from Authorization header
        session_token = request.cookies.get("session_token")
        
        if not session_token:
            auth_header = request.headers.get("authorization")
            if auth_header and auth_header.startswith("Bearer "):
                session_token = auth_header.split(" ")[1]
        
        if not session_token:
            raise HTTPException(status_code=401, detail="No session token found")
        
        # Find session in database
        session = await db.user_sessions.find_one({
            "session_token": session_token,
            "expires_at": {"$gt": datetime.now(timezone.utc)}
        })
        
        if not session:
            raise HTTPException(status_code=401, detail="Invalid or expired session")
        
        # Return user data
        user_data = {
            "id": session["user_id"],
            "email": session["email"],
            "name": session["name"],
            "picture": session["picture"]
        }
        
        return {"user": user_data}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting current user: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get user data")

@auth_router.post("/logout")
async def logout(request: Request, response: Response):
    """Logout user by deleting session"""
    try:
        # Get session token from cookies
        session_token = request.cookies.get("session_token")
        
        if session_token:
            # Delete session from database
            await db.user_sessions.delete_one({"session_token": session_token})
        
        # Clear cookie
        response.delete_cookie(
            key="session_token",
            path="/",
            secure=True,
            samesite="none"
        )
        
        return {"status": "success", "message": "Logged out successfully"}
        
    except Exception as e:
        logger.error(f"Error during logout: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to logout")

# Helper function to get current user (for dependency injection)
async def get_current_user_dependency(request: Request) -> UserData:
    """Dependency to get current authenticated user"""
    try:
        session_token = request.cookies.get("session_token")
        
        if not session_token:
            auth_header = request.headers.get("authorization")
            if auth_header and auth_header.startswith("Bearer "):
                session_token = auth_header.split(" ")[1]
        
        if not session_token:
            raise HTTPException(status_code=401, detail="Authentication required")
        
        session = await db.user_sessions.find_one({
            "session_token": session_token,
            "expires_at": {"$gt": datetime.now(timezone.utc)}
        })
        
        if not session:
            raise HTTPException(status_code=401, detail="Invalid or expired session")
        
        return UserData(
            id=session["user_id"],
            email=session["email"],
            name=session["name"],
            picture=session["picture"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in auth dependency: {str(e)}")
        raise HTTPException(status_code=500, detail="Authentication error")