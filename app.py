from flask import Flask, render_template, Response, request
import cv2
import mediapipe as mp
import pickle
import numpy as np
import os
from deepface import DeepFace 

app = Flask(__name__)

mp_face_detection = mp.solutions.face_detection
cap = cv2.VideoCapture(0)

PICKLE_FILE = "faces.pkl"

# Load stored faces
if os.path.exists(PICKLE_FILE):
    with open(PICKLE_FILE, "rb") as f:
        stored_faces = pickle.load(f)
else:
    stored_faces = {}

def extract_embedding(image, detection):
    """Extracts a face from the image and generates a DeepFace embedding."""
    bboxC = detection.location_data.relative_bounding_box
    img_h, img_w, _ = image.shape
    x, y, w, h = int(bboxC.xmin * img_w), int(bboxC.ymin * img_h), int(bboxC.width * img_w), int(bboxC.height * img_h)

    # Ensure valid bounding box
    x, y, w, h = max(0, x), max(0, y), min(img_w - x, w), min(img_h - y, h)
    face = image[y:y+h, x:x+w]

    if face.size == 0:
        return None

    temp_img = "temp_face.jpg"
    cv2.imwrite(temp_img, face)

    # Generate DeepFace embedding
    try:
        embedding = DeepFace.represent(temp_img, model_name="Facenet")[0]["embedding"]
        return np.array(embedding) / np.linalg.norm(embedding)  # Normalize the embedding
    except Exception as e:
        print(f"[ERROR] DeepFace extraction failed: {e}")
        return None

@app.route('/register', methods=['POST'])
def register():
    """Registers a new face with the given name."""
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
                    stored_faces[name] = embedding.tolist()  # Convert numpy to list before saving
                    with open(PICKLE_FILE, "wb") as f:
                        pickle.dump(stored_faces, f)
                    return "Face registered successfully!"
        return "No face detected", 400

def generate_frames():
    """Detects and recognizes faces in real-time using DeepFace."""
    with mp_face_detection.FaceDetection(model_selection=0, min_detection_confidence=0.5) as face_detection:
        while True:
            success, image = cap.read()
            if not success:
                print("[ERROR] Failed to read frame from camera.")
                break

            # Reload stored faces dynamically
            if os.path.exists(PICKLE_FILE):
                with open(PICKLE_FILE, "rb") as f:
                    stored_faces = pickle.load(f)

            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            results = face_detection.process(image_rgb)
            image = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2BGR)

            if results.detections:
                for detection in results.detections:
                    bboxC = detection.location_data.relative_bounding_box
                    img_h, img_w, _ = image.shape
                    x, y, w, h = int(bboxC.xmin * img_w), int(bboxC.ymin * img_h), int(bboxC.width * img_w), int(bboxC.height * img_h)

                    # Ensure valid bounding box
                    x, y, w, h = max(0, x), max(0, y), min(img_w - x, w), min(img_h - y, h)
                    cv2.rectangle(image, (x, y), (x+w, y+h), (0, 255, 0), 2)

                    # Extract DeepFace embedding
                    embedding = extract_embedding(image, detection)
                    best_match = "Unknown"
                    min_distance = float('inf')

                    if embedding is not None and stored_faces:
                        for name, stored_embedding in stored_faces.items():
                            stored_embedding = np.array(stored_embedding)  # Convert list to numpy array
                            distance = np.linalg.norm(embedding - stored_embedding)  # Euclidean distance
                            if distance < min_distance:
                                min_distance = distance
                                best_match = name

                        # Adjust threshold for better accuracy
                        if min_distance > 0.6:  # Slightly relaxed threshold
                            best_match = "Unknown"

                    cv2.putText(image, best_match, (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, 
                                (0, 0, 255) if best_match == "Unknown" else (0, 255, 0), 2)

            ret, buffer = cv2.imencode('.jpg', image)
            if not ret:
                print("[ERROR] Failed to encode frame.")
                continue

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
    try:
        app.run(debug=True)
    finally:
        cap.release()
        cv2.destroyAllWindows()