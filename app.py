# from flask import Flask, render_template, Response, request
# import cv2
# import mediapipe as mp
# import pickle
# import numpy as np
# import os

# app = Flask(__name__)

# mp_face_detection = mp.solutions.face_detection
# mp_drawing = mp.solutions.drawing_utils
# cap = cv2.VideoCapture(0)

# # File to store registered faces
# PICKLE_FILE = "faces.pkl"

# # Load stored faces
# if os.path.exists(PICKLE_FILE):
#     with open(PICKLE_FILE, "rb") as f:
#         stored_faces = pickle.load(f)
# else:
#     stored_faces = {}

# def extract_embedding(image, detection):
#     """Extract face area and create a simple embedding (flattened pixel values)"""
#     bboxC = detection.location_data.relative_bounding_box
#     h, w, _ = image.shape
#     x, y, w, h = int(bboxC.xmin * w), int(bboxC.ymin * h), int(bboxC.width * w), int(bboxC.height * h)
    
#     face = image[y:y+h, x:x+w]
#     if face.size == 0:
#         return None
    
#     resized_face = cv2.resize(face, (50, 50)).flatten().astype(np.float32)  
#     return resized_face / np.linalg.norm(resized_face)  # Normalize embedding

# @app.route('/register', methods=['POST'])
# def register():
#     """Register face with a given name"""
#     global stored_faces
    
#     name = request.form.get("name")
#     if not name:
#         return "Please enter a name", 400

#     with mp_face_detection.FaceDetection(model_selection=0, min_detection_confidence=0.5) as face_detection:
#         success, image = cap.read()
#         if not success:
#             return "Failed to capture image", 500

#         image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
#         results = face_detection.process(image_rgb)

#         if results.detections:
#             for detection in results.detections:
#                 embedding = extract_embedding(image, detection)
#                 if embedding is not None:
#                     stored_faces[name] = embedding
#                     with open(PICKLE_FILE, "wb") as f:
#                         pickle.dump(stored_faces, f)
#                     return "Face registered successfully!"
#         return "No face detected", 400

# def generate_frames():
#     """Detect and recognize faces in live video"""
#     with mp_face_detection.FaceDetection(model_selection=0, min_detection_confidence=0.5) as face_detection:
#         while True:
#             success, image = cap.read()
#             if not success:
#                 continue

#             # Reload stored faces dynamically to ensure newly registered faces are recognized
#             if os.path.exists(PICKLE_FILE):
#                 with open(PICKLE_FILE, "rb") as f:
#                     stored_faces = pickle.load(f)

#             image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
#             results = face_detection.process(image_rgb)
#             image = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2BGR)

#             if results.detections:
#                 print("Stored Faces:", stored_faces)  # Debugging

#                 for detection in results.detections:
#                     bboxC = detection.location_data.relative_bounding_box
#                     h, w, _ = image.shape
#                     x, y, w, h = int(bboxC.xmin * w), int(bboxC.ymin * h), int(bboxC.width * w), int(bboxC.height * h)

#                     cv2.rectangle(image, (x, y), (x+w, y+h), (0, 255, 0), 2)

#                     # Extract embedding
#                     embedding = extract_embedding(image, detection)
#                     best_match = "Unknown"  # Default to "Unknown"

#                     if embedding is not None and stored_faces:  
#                         min_similarity = float('inf')

#                         for name, stored_embedding in stored_faces.items():
#                             similarity = np.linalg.norm(embedding - stored_embedding)  # Euclidean distance
#                             print(f"Checking {name}, Similarity: {similarity}")  # Debugging

#                             if similarity < min_similarity:  # Find the closest match
#                                 min_similarity = similarity
#                                 best_match = name

#                         # Set threshold for recognition
#                         if min_similarity >= 5000 or best_match is None:
#                             best_match = "Unknown"

#                     print(f"Recognized as: {best_match}")
#                     cv2.putText(image, best_match, (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255) if best_match == "Unknown" else (0, 255, 0), 2)

#             _, buffer = cv2.imencode('.jpg', image)
#             frame = buffer.tobytes()
#             yield (b'--frame\r\n'
#                    b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')



# @app.route('/video_feed')
# def video_feed():
#     return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

# @app.route('/')
# def index():
#     return render_template('index.html')

# if __name__ == '__main__':
#     app.run(debug=True)





from flask import Flask, render_template, Response, request
import cv2
import mediapipe as mp
import pickle
import numpy as np
import os
from datetime import datetime
import time

app = Flask(__name__)

# Initialize MediaPipe Face Mesh
mp_face_mesh = mp.solutions.face_mesh
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles
cap = cv2.VideoCapture(0)

# File to store registered faces
PICKLE_FILE = "face_profiles.pkl"

# Load stored faces
if os.path.exists(PICKLE_FILE):
    with open(PICKLE_FILE, "rb") as f:
        stored_faces = pickle.load(f)
else:
    stored_faces = {}

# Selected landmarks for face recognition - revised for better discrimination
# These landmarks focus on distinctive facial features
LANDMARK_GROUPS = {
    "eye_left": [33, 133, 160, 159, 158, 144, 145, 153],  # Left eye region
    "eye_right": [362, 263, 386, 385, 384, 398, 374, 373],  # Right eye region
    "nose": [1, 2, 98, 327, 331, 6],  # Nose ridge and tip
    "mouth": [61, 185, 40, 39, 37, 0, 267, 269, 270, 409],  # Mouth outline
    "eyebrow_left": [70, 63, 105, 66, 107],  # Left eyebrow
    "eyebrow_right": [336, 296, 334, 293, 300],  # Right eyebrow
    "jaw": [127, 162, 21, 54, 103, 67, 109, 10, 338, 297, 332, 284, 251]  # Jawline
}

# Combine all landmarks and remove duplicates
SELECTED_LANDMARKS = list(set([lm for group in LANDMARK_GROUPS.values() for lm in group]))

# Recognition threshold - even stricter
RECOGNITION_THRESHOLD = 0.97  # Very high threshold

# Store registration timestamps to prevent accidental over-writes
registration_time = {}

def extract_enhanced_features(image, face_landmarks):
    """Extract enhanced facial features using landmark groups"""
    h, w, _ = image.shape
    
    # Get all landmarks first
    all_points = {}
    for idx in SELECTED_LANDMARKS:
        x = face_landmarks.landmark[idx].x
        y = face_landmarks.landmark[idx].y
        z = face_landmarks.landmark[idx].z  # Also use Z-coordinate for depth
        all_points[idx] = np.array([x, y, z])
    
    # Calculate features by group
    features = []
    
    # Process each landmark group
    for group_name, landmarks in LANDMARK_GROUPS.items():
        group_points = np.array([all_points[idx] for idx in landmarks])
        
        # Center of the group
        center = np.mean(group_points, axis=0)
        
        # Add relative positions of each landmark to the group center
        for idx in landmarks:
            # Distance from center (normalized)
            rel_pos = all_points[idx] - center
            features.extend(rel_pos)
        
        # Add inter-landmark distances for this group
        for i in range(len(landmarks)):
            for j in range(i+1, len(landmarks)):
                pt1 = all_points[landmarks[i]]
                pt2 = all_points[landmarks[j]]
                # Euclidean distance between points
                dist = np.linalg.norm(pt1 - pt2)
                features.append(dist)
    
    # Convert to numpy array and normalize
    features = np.array(features, dtype=np.float32)
    features = features / np.linalg.norm(features)
    
    return features

def compute_similarity(embedding1, embedding2):
    """Compute similarity between two embeddings using multiple metrics"""
    # Cosine similarity
    cosine_sim = np.dot(embedding1, embedding2) / (np.linalg.norm(embedding1) * np.linalg.norm(embedding2))
    
    # Euclidean distance (transformed to similarity)
    euclidean_dist = np.linalg.norm(embedding1 - embedding2)
    euclidean_sim = 1 / (1 + euclidean_dist)
    
    # Combine scores (weighted average)
    combined_sim = 0.7 * cosine_sim + 0.3 * euclidean_sim
    
    return combined_sim

@app.route('/register', methods=['POST'])
def register():
    """Register face with a given name"""
    global stored_faces
    
    name = request.form.get("name")
    if not name:
        return "Please enter a name", 400
        
    # Check if name already exists and was registered recently (5 minutes)
    current_time = time.time()
    if name in registration_time and current_time - registration_time.get(name, 0) < 300:
        return f"'{name}' was registered recently. Please wait 5 minutes before updating or use a different name.", 400

    with mp_face_mesh.FaceMesh(
        max_num_faces=1,
        refine_landmarks=True,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5) as face_mesh:
        
        # Take multiple samples for better recognition
        embeddings = []
        captured_images = []  # Store sample face images
        
        for _ in range(5):  # Take 5 samples
            success, image = cap.read()
            if not success:
                continue
                
            # Convert the BGR image to RGB
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            results = face_mesh.process(image_rgb)
            
            if results.multi_face_landmarks:
                face_landmarks = results.multi_face_landmarks[0]
                
                # Get embedding
                embedding = extract_enhanced_features(image, face_landmarks)
                embeddings.append(embedding)
                
                # Get face bounding box
                face_points = np.array([[int(landmark.x * image.shape[1]), int(landmark.y * image.shape[0])] 
                                    for landmark in face_landmarks.landmark])
                x, y = np.min(face_points, axis=0)
                w, h = np.max(face_points, axis=0) - np.min(face_points, axis=0)
                
                # Store a copy of the face region
                if x > 0 and y > 0 and w > 0 and h > 0:
                    face_img = image[max(0, y-20):min(image.shape[0], y+h+20), 
                                     max(0, x-20):min(image.shape[1], x+w+20)]
                    captured_images.append(face_img)
                
                # Small delay between captures
                cv2.waitKey(300)
        
        if embeddings:
            # Store the average embedding
            avg_embedding = np.mean(embeddings, axis=0)
            
            # Store the profile
            stored_faces[name] = {
                'embedding': avg_embedding,
                'samples': embeddings,
                'registered': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
            
            # Update registration time
            registration_time[name] = current_time
            
            # Save to file
            with open(PICKLE_FILE, "wb") as f:
                pickle.dump(stored_faces, f)
                
            return "Face registered successfully!"
        
        return "No face detected", 400

def generate_frames():
    """Detect and recognize faces in live video"""
    global stored_faces
    
    # Load stored faces at the beginning of the stream
    if os.path.exists(PICKLE_FILE):
        with open(PICKLE_FILE, "rb") as f:
            stored_faces = pickle.load(f)
    
    last_reload_time = 0
    
    with mp_face_mesh.FaceMesh(
        max_num_faces=10,
        refine_landmarks=True,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5) as face_mesh:
        
        while True:
            success, image = cap.read()
            if not success:
                continue
            
            # Reload stored faces every 5 seconds
            current_time = cv2.getTickCount() / cv2.getTickFrequency()
            if current_time - last_reload_time > 5.0:
                if os.path.exists(PICKLE_FILE):
                    with open(PICKLE_FILE, "rb") as f:
                        stored_faces = pickle.load(f)
                last_reload_time = current_time
            
            # Convert the BGR image to RGB
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            results = face_mesh.process(image_rgb)
            
            # Convert back to BGR for display
            image = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2BGR)
            
            if results.multi_face_landmarks:
                for idx, face_landmarks in enumerate(results.multi_face_landmarks):
                    # Draw face mesh for visualization (simplified)
                    mp_drawing.draw_landmarks(
                        image=image,
                        landmark_list=face_landmarks,
                        connections=mp_face_mesh.FACEMESH_TESSELATION,
                        landmark_drawing_spec=None,
                        connection_drawing_spec=mp_drawing_styles.get_default_face_mesh_tesselation_style())
                    
                    # Extract enhanced features
                    embedding = extract_enhanced_features(image, face_landmarks)
                    
                    # RECOGNITION LOGIC
                    best_match = "Unknown"
                    best_similarity = -1
                    
                    # Calculate similarities with all stored faces
                    similarities = {}
                    for name, profile in stored_faces.items():
                        stored_embedding = profile['embedding']
                        similarity = compute_similarity(embedding, stored_embedding)
                        similarities[name] = similarity
                        
                        if similarity > best_similarity:
                            best_similarity = similarity
                    
                    # DEBUG: Print similarity scores
                    print(f"Face #{idx} - Best similarity: {best_similarity:.4f}")
                    for name, sim in similarities.items():
                        print(f"  {name}: {sim:.4f}")
                    
                    # Only mark as recognized if it passes the high threshold
                    if best_similarity >= RECOGNITION_THRESHOLD:
                        for name, similarity in similarities.items():
                            if similarity == best_similarity:
                                best_match = name
                                break
                    
                    # Get face bounding box for text placement
                    face_points = np.array([[int(landmark.x * image.shape[1]), int(landmark.y * image.shape[0])] 
                                          for landmark in face_landmarks.landmark])
                    x, y = np.min(face_points, axis=0)
                    w, h = np.max(face_points, axis=0) - np.min(face_points, axis=0)
                    
                    # Draw the name with colored background based on confidence
                    is_unknown = best_match == "Unknown"
                    confidence_color = (0, 0, 255) if is_unknown else (
                        (0, int(255 * min(best_similarity/RECOGNITION_THRESHOLD, 1)), 0) if best_similarity >= RECOGNITION_THRESHOLD else 
                        (0, 165, 255)  # Orange for low confidence matches
                    )
                    
                    # Add confidence score to display
                    display_text = f"{best_match}"
                    if not is_unknown:
                        display_text += f" ({best_similarity:.2f})"
                    
                    text_size = cv2.getTextSize(display_text, cv2.FONT_HERSHEY_SIMPLEX, 0.7, 2)[0]
                    cv2.rectangle(image, (x, y-30), (x+text_size[0]+10, y), confidence_color, -1)
                    cv2.putText(image, display_text, (x+5, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
            
            # Convert to JPEG
            _, buffer = cv2.imencode('.jpg', image)
            frame = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/clear_data', methods=['POST'])
def clear_data():
    """Clear all registered faces"""
    global stored_faces
    stored_faces = {}
    
    if os.path.exists(PICKLE_FILE):
        os.remove(PICKLE_FILE)
    
    return "All registered faces have been cleared"

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)


