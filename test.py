# to check the contents in faces.pkl

import pickle
import os

PICKLE_FILE = "faces.pkl"

if os.path.exists(PICKLE_FILE):
    with open(PICKLE_FILE, "rb") as f:
        stored_faces = pickle.load(f)
    print("Stored Faces:", stored_faces)

    # Check if 'aaa' exists
    # if 'aaa' in stored_faces:
    #     print("Face data for 'aaa' exists.")
    #     print("Embedding data:", stored_faces['aaa'])
    # else:
    #     print("No face data found for 'aaa'.")
else:
    print("No faces.pkl file found.")
