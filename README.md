Meeting link :https://meet-clone-xsvm.onrender.com/

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
