from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import gridfs  # ✅ GridFS for storing images
from dotenv import load_dotenv
from datetime import datetime
from bson.objectid import ObjectId
from db import attendance_collection, faces_collection, fs  # ✅ Import GridFS from db.py
from face_recognition import recognize_face, register_face

# ✅ Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)


# ✅ Home API to check if the server is running
@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Face Recognition Attendance System is Running!"})


# ✅ Register a New Face (Store Face in MongoDB GridFS)
@app.route("/register_face", methods=["POST"])
def register_new_face():
    if "image" not in request.files or "name" not in request.form:
        return jsonify({"message": "Image and name are required!"}), 400

    file = request.files["image"]
    name = request.form["name"]

    # ✅ Store image in MongoDB GridFS
    image_id = fs.put(file, filename=f"{name}.jpg")

    # ✅ Store face data in MongoDB
    face_id = faces_collection.insert_one({
        "name": name,
        "image_id": image_id  # Store reference to GridFS
    }).inserted_id

    return jsonify({"message": f"{name} registered successfully!", "face_id": str(face_id)})


# ✅ Mark Attendance using Face Recognition
@app.route("/attendance", methods=["POST"])
def mark_attendance():
    if "image" not in request.files:
        return jsonify({"message": "No image uploaded!"}), 400

    file = request.files["image"]

    # ✅ Save temporary file
    temp_image_path = "temp.jpg"
    file.save(temp_image_path)

    # ✅ Recognize face
    face_id = recognize_face(temp_image_path)

    if face_id:
        # Fetch user details
        user = faces_collection.find_one({"_id": ObjectId(face_id)}, {"name": 1, "image_id": 1})
        if not user:
            return jsonify({"message": "User not found!"}), 404

        # ✅ Retrieve image from GridFS
        image_binary = fs.get(user["image_id"]).read()

        # ✅ Insert attendance record
        attendance_collection.insert_one({"face_id": str(face_id), "timestamp": datetime.utcnow()})

        return jsonify({
            "name": user["name"],
            "photo": image_binary.hex(),  # ✅ Send image as binary data
            "status": "Present"
        })

    return jsonify({"name": "Unknown", "status": "Not Marked"})


# ✅ Get All Attendance Records with Names and Photos
@app.route("/attendance", methods=["GET"])
def get_attendance():
    records = list(attendance_collection.find().sort("timestamp", -1))
    formatted_records = []

    for record in records:
        face = faces_collection.find_one({"_id": ObjectId(record["face_id"])}, {"name": 1, "image_id": 1})
        
        if face:
            image_binary = fs.get(face["image_id"]).read()  # ✅ Fetch image from GridFS
            formatted_records.append({
                "name": face["name"],
                "photo": image_binary.hex(),  # ✅ Convert binary to hex for API response
                "timestamp": record["timestamp"].isoformat()
            })
        else:
            formatted_records.append({
                "name": "Unknown",
                "photo": None,
                "timestamp": record["timestamp"].isoformat()
            })

    return jsonify({"attendance_records": formatted_records})


# ✅ Clear All Attendance Records
@app.route("/attendance", methods=["DELETE"])
def clear_attendance():
    attendance_collection.delete_many({})
    return jsonify({"message": "All attendance records deleted!"})


# ✅ List Registered Faces with Names & Photos
@app.route("/registered_faces", methods=["GET"])
def get_registered_faces():
    faces = list(faces_collection.find({}, {"_id": 1, "name": 1, "image_id": 1}))

    formatted_faces = []
    for face in faces:
        image_binary = fs.get(face["image_id"]).read()  # ✅ Retrieve image from GridFS
        formatted_faces.append({
            "_id": str(face["_id"]),
            "name": face["name"],
            "photo": image_binary.hex()  # ✅ Convert binary to hex string
        })

    return jsonify({"registered_faces": formatted_faces})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

