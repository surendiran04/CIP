from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
import os
from dotenv import load_dotenv

# ✅ Load Environment Variables (If running locally)
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI") or "mongodb+srv://FaceSnapAdmin:Face123@face.5znfi.mongodb.net/?retryWrites=true&w=majority&appName=Face"  # Fallback for Colab

# ✅ Connect to MongoDB Atlas
try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)  # 5 sec timeout
    db = client["face_attendance"]  # Database Name

    # ✅ Define Collections
    faces_collection = db["faces"]  # Stores registered users with face encodings
    attendance_collection = db["attendance"]  # Stores attendance logs

    # ✅ Ensure Indexing for Fast Queries
    if "name_1" not in faces_collection.index_information():
        faces_collection.create_index("name", unique=True)
    if "face_id_1" not in attendance_collection.index_information():
        attendance_collection.create_index("face_id")

    # ✅ Ping to check connection
    client.admin.command("ping")
    print("✅ MongoDB Connected! Collections:", db.list_collection_names())

except ServerSelectionTimeoutError:
    print("❌ MongoDB Connection Failed! Check MONGO_URI.")


# ==========================
# 📌 Data Models (Schemas)
# ==========================

# ✅ Schema for Registered Faces
class FaceSchema(BaseModel):
    name: str  # Name of the person
    photo_url: Optional[str] = None  # URL of the stored face image


# ✅ Schema for Attendance Records
class AttendanceSchema(BaseModel):
    face_id: str = Field(..., description="Reference to registered face ID")
    timestamp: datetime = Field(default_factory=datetime.utcnow)


