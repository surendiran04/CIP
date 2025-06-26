# FaceSnap – Smart E-Learning & Attendance Management System

---

## Overview

**FaceSnap** is a full-stack web application that revolutionizes online learning with **AI-powered facial recognition** for secure and automated attendance. Designed to simulate real classroom engagement, FaceSnap integrates a custom video conferencing system and role-based dashboards for Admins, Mentors, and Students.

---

## Key Features

- **Facial Recognition Attendance**  
  Detects and verifies student identity in real-time using **DeepFace + OpenCV**.

- **Google Meet-like Video Conferencing**  
  Built-in live class sessions with **webcam-triggered attendance validation**.

- **Role-Based Access**  
  Secure JWT-authenticated dashboards for **Admins, Mentors, and Students**.

- **Course Management System**  
  Mentors can manage sessions, track progress, and monitor attendance.

- **Security & Performance**  
  Secure token-based routing, bcrypt password encryption, modular REST APIs, and cloud storage.

---

## Tech Stack

**Frontend:** ReactJS, TailwindCSS  <br/>
**Backend:** Flask, ExpressJS, Node.js  <br/>
**State Management:** context Api for state management  <br/>
**Face Recognition:** OpenCV, DeepFace, MediaPipe   <br/>
**Database:** MongoDB Atlas (attendance), PostgreSQL - hosted on Neon Cloud (user & course data)   <br/>
**Authentication:** JSON Web Tokens (JWT) for user authentication and authorization  <br/>
**Others:** React-Toastify, Lucide Icons, Nodemailer  <br/>
**Security:** bcrypt,a hashing technique for hashing password for security  <br/>
**Api Handling:** Efficiently managed API calls by implementing Fetch,Try & catch blocks for fetching data from Backend Api's synchronously and also used asynchronous functions in both the frontend and backend, and by structuring the code modularly.  <br/>

---

## PPT & Screenshots

<a href="https://www.canva.com/design/DAGiMt2l92w/PLtPyTW679RFKY-bvl_t2A/edit?utm_content=DAGiMt2l92w&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton">Link to PPT & screenshots</a>



---

## Getting Started

Step1: Upload the Backed.ipynb file to Google collab<br/>
Step 2: Download the files in the Zipper-drive folder upload it in the collab under the files section<br/>

Step 3: Go ngrok website and generate a ngrok authtoken - To create deployed url of the running port in collab which will eventually give a deployed url <a href="https://ngrok.com">Ngrok Link</a><br/>
` !ngrok config add-authtoken YOUR_NGROK_AUTHTOKEN ` <br/> <br/>

Step 4.Install server dependencies:
```bash
cd Backend
npm install
```
Step 5. Install client dependencies:
```bash
cd Frontend
npm install
```

step 6. Create .env file in backend root directory with:
```env
PORT=3000
secretkey=
FRONTEND_URL=http://localhost:5173
ADMIN_PIN =


EMAIL_HOST=smtp.gmail.com
EMAIL_PASS=
EMAIL_USER=

(neon postgreSQL DB credentials)
PGHOST=
PGDATABASE=
PGUSER=
PGPASSWORD=
```
step 7. Create .env file in frontend root directory with:
```
VITE_BACKEND_URL=http://localhost:3000
VITE_BACKEND_URL1=  (paste the generated deployed url from collab)
```
step 8. Start the development servers:

For backend:

```bash
cd Backend
npm run dev
```

For frontend:

```bash
cd Frontend
npm run dev
```

---
## Meeting Link
Meeting link :https://meet-clone-xsvm.onrender.com/
