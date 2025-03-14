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
    return cv2.resize(face, (50, 50)).flatten()  # Resize to fixed size and flatten

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
                print("Stored Faces:", stored_faces)  # Print only when a face is detected

                for detection in results.detections:
                    bboxC = detection.location_data.relative_bounding_box
                    h, w, _ = image.shape
                    x, y, w, h = int(bboxC.xmin * w), int(bboxC.ymin * h), int(bboxC.width * w), int(bboxC.height * h)

                    cv2.rectangle(image, (x, y), (x+w, y+h), (0, 255, 0), 2)

                    # Extract embedding and compare with stored faces
                    embedding = extract_embedding(image, detection)
                    if embedding is not None and stored_faces:
                        for name, stored_embedding in stored_faces.items():
                            similarity = np.linalg.norm(embedding - stored_embedding)
                            if similarity < 10000:  # Adjust threshold based on testing
                                print(f"Matched: {name}, Similarity: {similarity}")
                                cv2.putText(image, name, (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
                                break  # Stop checking once a match is found

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
