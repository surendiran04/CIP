Step1: Installtion of necessary dependencies<br/>
`!pip install flask flask-cors pymongo deepface opencv-python mediapipe python-dotenv pyngrok ` <br/> <br/>
Step 2: Add ngrok Authentication Token - to make backend address publicly access in our device <br/>
` !ngrok config add-authtoken YOUR_NGROK_AUTHTOKEN ` <br/> <br/>
Step 3:Run Flask & Expose It with Ngrok - Run this code in another cell <br/>
```from flask import Flask
from flask_cors import CORS
from pyngrok import ngrok

Start Flask App
app = Flask(__name__)
CORS(app)

#  Expose Public URL via Ngrok
public_url = ngrok.connect(5000).public_url
print(f"🚀 Public URL: {public_url}")

@app.route("/")
def home():
    return {"message": "Face Recognition Attendance System is Running!"}

# ✅ Start Flask in the background
app.run(port=5000)
```
<br/>
Step4: To make sure ,Uploaded the necessary files that wanted to run (optional)<br/>
`!ls /content/` <br/>
