const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

let messageCooldown = {};

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, username) => {
    socket.join(roomId);

    socket.to(roomId).emit("receive-message", {
      user: "System",
      text: `${username} odaya katıldı 👑`
    });

    socket.on("send-message", (message) => {
      const now = Date.now();
      if (messageCooldown[socket.id] && now - messageCooldown[socket.id] < 1500) return;
      messageCooldown[socket.id] = now;

      io.to(roomId).emit("receive-message", {
        user: username,
        text: String(message || "").substring(0, 200)
      });
    });

    socket.on("disconnect", () => {
      socket.to(roomId).emit("receive-message", {
        user: "System",
        text: `${username} ayrıldı`
      });
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Server çalışıyor:", PORT));
