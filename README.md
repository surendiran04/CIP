# FaceSnap – Smart E-Learning & Attendance Management System

---

## Overview

**FaceSnap** is a full-stack web application that revolutionizes online learning with **AI-powered facial recognition** for secure and automated attendance. Designed to simulate real classroom engagement, FaceSnap integrates a custom video conferencing system and role-based dashboards for Admins, Mentors, and Students.

---

## Key Features

- **Facial Recognition Attendance**  
  Detects and verifies student identity in real-time using **DeepFace + OpenCV**.

- **Google Meet-like Video Conferencing**  
  Built-in live class sessions with **webcam-triggered attendance validation**.

- **Role-Based Access**  
  Secure JWT-authenticated dashboards for **Admins, Mentors, and Students**.

- **Course Management System**  
  Mentors can manage sessions, track progress, and monitor attendance.

- **Security & Performance**  
  Secure token-based routing, bcrypt password encryption, modular REST APIs, and cloud storage.

---

## Tech Stack

**Frontend:** ReactJS, TailwindCSS  
**Backend:** Flask, ExpressJS  
**Face Recognition:** OpenCV, DeepFace, MediaPipe  
**Database:** MongoDB Atlas (attendance), PostgreSQL (user & course data)  
**Auth:** JWT (JSON Web Tokens)  
**Others:** React-Toastify, Lucide Icons, Context API

---

## Screenshots





---

## Getting Started

Step1: Installtion of necessary dependencies<br/>
`!pip install flask flask-cors pymongo deepface opencv-python mediapipe python-dotenv pyngrok ` <br/> <br/>
Step 2: Add ngrok Authentication Token - to make backend address publicly access in our device <br/>
` !ngrok config add-authtoken YOUR_NGROK_AUTHTOKEN ` <br/> <br/>

Step3: To make sure ,Uploaded the necessary files that wanted to run (optional) <br/>
` !ls /content/ ` <br/>

step4: To run the local app.py file in the collab and also to cat the op <br/>
` !nohup python app.py & ` <br/>
` !cat nohup.out ` <br/> <br/>

Step 5:Run Flask & Expose It with Ngrok - Run this code in another cell <br/>
```
from flask import Flask
from flask_cors import CORS
from pyngrok import ngrok
import os

# Set Ngrok Auth Token (Run this only once, remove if already set)
os.system("ngrok config add-authtoken 2u2pjp7Dqgcj2JO2iJGKeYw27sW_6z9cY5PhkDJ26d5pMRNMc")

faces_db_path = "faces_db"
if not os.path.exists(faces_db_path):
    os.makedirs(faces_db_path)
    
app = Flask(__name__)
CORS(app)

# ✅ Expose Public URL via Ngrok
public_url = ngrok.connect(5000).public_url
print(f"🚀 Public URL: {public_url}")

@app.route("/")
def home():
    return {"message": "Face Recognition Attendance System is Running!"}

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)  # ✅ Listen on all interfaces

```

---
## Meeting Link
Meeting link :https://meet-clone-xsvm.onrender.com/
