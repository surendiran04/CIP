from flask import Flask, render_template, Response, request
import cv2
import mediapipe as mp
import pickle
import numpy as np
import os

app = Flask(__name__)

mp_face_detection = mp.solutions.face_detection
mp_drawing = mp.solutions.drawing_utils
cap = cv2.VideoCapture(0)

# File to store registered faces
PICKLE_FILE = "faces.pkl"

# Load stored faces
if os.path.exists(PICKLE_FILE):
    with open(PICKLE_FILE, "rb") as f:
        stored_faces = pickle.load(f)
else:
    stored_faces = {}

def extract_embedding(image, detection):
    """Extract face area and create a simple embedding (flattened pixel values)"""
    bboxC = detection.location_data.relative_bounding_box
    h, w, _ = image.shape
    x, y, w, h = int(bboxC.xmin * w), int(bboxC.ymin * h), int(bboxC.width * w), int(bboxC.height * h)
    
    face = image[y:y+h, x:x+w]
    if face.size == 0:
        return None
    
    resized_face = cv2.resize(face, (50, 50)).flatten().astype(np.float32)  
    return resized_face / np.linalg.norm(resized_face)  # Normalize embedding

@app.route('/register', methods=['POST'])
def register():
    """Register face with a given name"""
    global stored_faces
    
    name = request.form.get("name")
    if not name:
        return "Please enter a name", 400

    with mp_face_detection.FaceDetection(model_selection=0, min_detection_confidence=0.5) as face_detection:
        success, image = cap.read()
        if not success:
            return "Failed to capture image", 500

        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = face_detection.process(image_rgb)

        if results.detections:
            for detection in results.detections:
                embedding = extract_embedding(image, detection)
                if embedding is not None:
                    stored_faces[name] = embedding
                    with open(PICKLE_FILE, "wb") as f:
                        pickle.dump(stored_faces, f)
                    return "Face registered successfully!"
        return "No face detected", 400

def generate_frames():
    """Detect and recognize faces in live video"""
    with mp_face_detection.FaceDetection(model_selection=0, min_detection_confidence=0.5) as face_detection:
        while True:
            success, image = cap.read()
            if not success:
                continue

            # Reload stored faces dynamically to ensure newly registered faces are recognized
            if os.path.exists(PICKLE_FILE):
                with open(PICKLE_FILE, "rb") as f:
                    stored_faces = pickle.load(f)

            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            results = face_detection.process(image_rgb)
            image = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2BGR)

            if results.detections:
                print("Stored Faces:", stored_faces)  # Debugging

                for detection in results.detections:
                    bboxC = detection.location_data.relative_bounding_box
                    h, w, _ = image.shape
                    x, y, w, h = int(bboxC.xmin * w), int(bboxC.ymin * h), int(bboxC.width * w), int(bboxC.height * h)

                    cv2.rectangle(image, (x, y), (x+w, y+h), (0, 255, 0), 2)

                    # Extract embedding
                    embedding = extract_embedding(image, detection)
                    best_match = "Unknown"  # Default to "Unknown"

                    if embedding is not None and stored_faces:  
                        min_similarity = float('inf')

                        for name, stored_embedding in stored_faces.items():
                            similarity = np.linalg.norm(embedding - stored_embedding)  # Euclidean distance
                            print(f"Checking {name}, Similarity: {similarity}")  # Debugging

                            if similarity < min_similarity:  # Find the closest match
                                min_similarity = similarity
                                best_match = name

                        # Set threshold for recognition
                        if min_similarity >= 5000 or best_match is None:
                            best_match = "Unknown"

                    print(f"Recognized as: {best_match}")
                    cv2.putText(image, best_match, (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255) if best_match == "Unknown" else (0, 255, 0), 2)

            _, buffer = cv2.imencode('.jpg', image)
            frame = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')



@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)
