from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
import os
from dotenv import load_dotenv

# ✅ Load Environment Variables (If running locally)
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI") or "" 

# ✅ Connect to MongoDB Atlas
try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)  # 5 sec timeout
    db = client["face_attendance"]  # Database Name

    # ✅ Define Collections
    faces_collection = db["faces"]  # Stores registered users with face encodings
    attendance_collection = db["attendance"]  # Stores attendance logs
  
    if "face_id_1" not in attendance_collection.index_information():
        attendance_collection.create_index("face_id")

    # ✅ Ping to check connection
    client.admin.command("ping")
    print("✅ MongoDB Connected! Collections:", db.list_collection_names())

except ServerSelectionTimeoutError:
    print("❌ MongoDB Connection Failed! Check MONGO_URI.")



if "email_1_course_id_1_student_id_1" not in faces_collection.index_information():
    faces_collection.create_index(
        [("email", 1), ("course_id", 1), ("student_id", 1)],
        unique=True
    )



    
# ==========================
# 📌 Data Models (Schemas)
# ==========================

# ✅ Schema for Registered Faces
class FaceSchema(BaseModel):
    name: str  # Name of the person
    photo_url: Optional[str] = None  # URL of the stored face image
    course_id: str 
    student_id: str 
    email: str


# ✅ Schema for Attendance Records
class AttendanceSchema(BaseModel):
    face_id: str = Field(..., description="Reference to registered face ID")
    timestamp: datetime = Field(default_factory=datetime.utcnow)


