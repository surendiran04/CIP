from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import os
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"
from pymongo.errors import DuplicateKeyError
from dotenv import load_dotenv
from datetime import datetime
from bson.objectid import ObjectId
from db import attendance_collection, faces_collection
from face_recognition import recognize_face, register_face

# ✅ Load environment variables
load_dotenv()

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs("faces_db", exist_ok=True)


app = Flask(__name__)
CORS(app)

# ✅ Home API to check if the server is running
@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Face Recognition Attendance System is Running!"})


# ✅ Mark Attendance using Face Recognition
@app.route("/attendance", methods=["POST"])
def mark_attendance():
    print("Content-Type:", request.content_type)
    print("Request files:", request.files)
    print("Request.form:", request.form)

    if "image" not in request.files:
        return jsonify({"message": "No image uploaded!"}), 400

    file = request.files["image"]
    image_path = os.path.join(UPLOAD_FOLDER, "temp.jpg")
    file.save(image_path)


    face_id = recognize_face(image_path)  # This function processes the image and returns the face_id
    print(face_id)
    
    if not face_id:
        return jsonify({"name": "Unknown", "status": "Not Marked","success":False})

    if face_id:
        # Fetch user details from faces_collection using face_id
        user = faces_collection.find_one({"_id": ObjectId(face_id)}, {"name": 1, "photo_url": 1, "student_id": 1})
        if not user:
            return jsonify({"message": "User not found!","success":False}), 404

        # Assuming the course_id is part of the request, you can also get it here
        course_id = request.form.get("course_id")  # Make sure the frontend sends course_id with the request

        # Insert attendance record into the collection, including course_id, student_id, name, face_id, and timestamp
        attendance_collection.insert_one({
            "face_id": str(face_id),
            "course_id": course_id,
            "student_id": user["student_id"],  # Add student_id
            "name": user["name"],              # Add name
            "timestamp": datetime.utcnow()     # Add timestamp
        })

        return jsonify({
            "name": user["name"],
            "photo_url": user.get("photo_url"),
            "status": "Present",
            "student_id": user["student_id"],
            "sucess":True
        })

    return jsonify({"name": "Unknown", "status": "Not Marked","success":False})



@app.route("/attendance", methods=["GET"])
def get_attendance():
    try:
        records = list(attendance_collection.find().sort("timestamp", -1))
        formatted_records = []

        for record in records:
            face = faces_collection.find_one({"_id": ObjectId(record["face_id"])}, {"name": 1})
            formatted_records.append({
                "name": face["name"] if face else "Unknown",
                "timestamp": record["timestamp"].isoformat()
            })

        print("Sending data:", formatted_records)  # ✅ Log to confirm response
        return jsonify({"attendance_records": formatted_records}), 200

    except Exception as e:
        print("Error fetching attendance:", e)
        return jsonify({"error": str(e)}), 500


# ✅ Clear All Attendance Records
@app.route("/attendance", methods=["DELETE"])
def clear_attendance():
    attendance_collection.delete_many({})
    return jsonify({"message": "All attendance records deleted!"})


# ✅ List Registered Faces with Names & Photos
@app.route("/registered_faces", methods=["GET"])
def get_registered_faces():
    faces = list(faces_collection.find({}, {"_id": 1, "name": 1, "photo_url": 1}))

    for face in faces:
        face["_id"] = str(face["_id"])  # Convert ObjectId to string

    return jsonify({"registered_faces": faces})


# ✅ Register a New Face (Store Face Encoding)
@app.route("/register_face", methods=["POST"])
def register_new_face():
    required_fields = ("name", "email", "course_id", "student_id")

    if not all(k in request.form for k in required_fields) or "image" not in request.files:
        return jsonify({"message": "Image, name, email, course_id, and student_id are required!"}), 400

    file = request.files["image"]
    name = request.form["name"].strip()
    email = request.form["email"].strip()
    course_id = request.form["course_id"].strip()
    student_id = request.form["student_id"].strip()

    image_path = os.path.join(UPLOAD_FOLDER, f"{name}.jpg")
    file.save(image_path)
    print(f"Received → name: {name}, email: {email}, course_id: {course_id}, student_id: {student_id}")

    # ✅ Check if this user is already registered for this course
    existing_face = faces_collection.find_one({
        "email": email,
        "course_id": course_id,
        "student_id": student_id
    })

    if existing_face:
        return jsonify({
            "success": False,
            "message": f"{email} is already registered for course {course_id}!"
        }), 409

    # ✅ Proceed with face registration
    face_id = register_face(image_path, name)

    if face_id:
        face_data = {
            "name": name,
            "email": email,
            "course_id": course_id,
            "student_id": student_id,
            "photo_url": f"/content/drive/My Drive/faces_db/{name}.jpg"
        }

        try:
            result = faces_collection.insert_one(face_data)
            return jsonify({
                "success": True,
                "message": f"{name} registered successfully!",
                "face_id": str(result.inserted_id)
            })
        except DuplicateKeyError:
            os.remove(image_path)
            return jsonify({
                "success": False,
                "message": f"{email} is already registered for course {course_id}!"
            }), 409
    else:
        os.remove(image_path)
        return jsonify({"success": False, "message": "Face registration failed!"}), 500




if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
