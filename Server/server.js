import express from "express"
import 'dotenv/config';
import cors from 'cors';
import http from 'http';
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoute.js";
import messageRouter from "./routes/messageRoute.js";
import { Server } from 'socket.io'


const PORT = process.env.PORT || 5000;

await connectDB();

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app)

// Initialize socket.io server
export const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});


// Store Online Users
export const userSocketMap = {};//{userId: socketId}

// socket.io connection handler
io.on("connection", (socket) => {

    const userId = socket.handshake.query.userId;

    // console.log("User Connected:", userId);

    if (userId) {
        userSocketMap[userId] = socket.id;
    }

    // Emit online users to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {

        console.log("User Disconnected:", userId);

        if (userId) {
            delete userSocketMap[userId];
        }

        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });

});






// Middleware setup 
app.use(express.json({ limit: '4mb' }));
app.use(cors());

app.use('/api/status', (req, res) => res.send("Server is live"));
app.use('/api/auth', userRouter)
app.use('/api/message', messageRouter)

server.listen(PORT, () => console.log(`Server is Running on PORT : ${PORT}`))