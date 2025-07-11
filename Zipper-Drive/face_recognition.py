import os
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"
import cv2
import shutil
import numpy as np
import mediapipe as mp
from deepface import DeepFace
from db import faces_collection

mp_face_detection = mp.solutions.face_detection
face_detection = mp_face_detection.FaceDetection(model_selection=1, min_detection_confidence=0.5)


def recognize_face(image_path):  
    """Recognizes a face from the image and returns the corresponding face_id from DB."""
    img = cv2.imread(image_path)
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    results = face_detection.process(img_rgb)

    if results.detections:      
        for detection in results.detections:
            bboxC = detection.location_data.relative_bounding_box
            h, w, _ = img.shape
            x, y, w, h = int(bboxC.xmin * w), int(bboxC.ymin * h), int(bboxC.width * w), int(bboxC.height * h)
            face_crop = img[y:y+h, x:x+w]

            # Use DeepFace for Face Recognition
            result = DeepFace.find(img_path=image_path, db_path="/content/drive/My Drive/faces_db", model_name="ArcFace", enforce_detection=False)


            if not result or result[0].empty:
                print("No match found in DeepFace.")
                return False
            
            # Check if 'identity' exists and is not empty
            if "identity" in result[0] and len(result[0]["identity"]) > 0:
                matched_name = result[0]["identity"][0].split("/")[-1].split(".")[0]
                face_record = faces_collection.find_one({"name": matched_name})
                
                if face_record:
                    return face_record["_id"]

    return False



def register_face(image_path, name):
    faces_db_path = "/content/drive/My Drive/faces_db"
    save_path = os.path.join(faces_db_path, f"{name}.jpg")

    try:
        shutil.copy(image_path, save_path)
        return save_path  # just return the path instead of inserting into DB
    except Exception as e:
        print(f"Error saving face image: {e}")
        return None

