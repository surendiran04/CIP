const express = require("express");
const body_parser = require("body-parser");
const cors = require("cors");
const { db } = require('./Database/DBconfig')
const { AuthRouter, courseRouter } = require('./Router/routes')
const dotenv = require('dotenv');
const http = require("http"); // Added for Socket.io
const { Server } = require("socket.io"); // Added for Socket.io

const app = express();
const server = http.createServer(app); // Create HTTP server from Express app
const io = new Server(server, {  // Initialize Socket.io on the same server
    cors: {
        origin: "*", // Allow all origins
        methods: ["GET", "POST"],
    },
});

// Make io available to our routes
app.set('io', io);

dotenv.config();
app.use(cors());
app.use(body_parser.json());
app.use("/api/auth", AuthRouter);
app.use(courseRouter);

db.connect();

io.on("connection", (socket) => {
    // console.log(`New client connected: ${socket.id}`);

    socket.on("joinRoom", (courseId) => {
        socket.join(courseId);
        // console.log(`Student ${socket.id} joined room: ${courseId}`);
        // console.log("Clients in room AFTER JOIN:", io.sockets.adapter.rooms.get(courseId));
        socket.emit("roomJoined", courseId);
    });

    socket.on("leaveRoom", (courseId) => {
        socket.leave(courseId);
        console.log(`❌ Student ${socket.id} left room: ${courseId}`);
    });

    socket.on("disconnect", () => {
        console.log("❌ Student disconnected:", socket.id);
    });
});

// Use a single port for both HTTP and Socket.io
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});