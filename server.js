const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const fs = require("fs");

const HOST = "146.231.88.143";

app.use(express.static("public"));

const options = {
    key: fs.readFileSync(""),
    cert: fs.readFileSync("")
};
const server = require('https').createServer(options, app);
const io = require("socket.io")(server);

var socketRoom;

io.on("connection", socket => {
    console.log("User connected to the socket", socket.id);

    socket.on("room", room => {
        io.emit("room", room);
        console.log("The Room name is: " + room);
    });

    socket.on("join", room => {
        socketRoom = room;
        socket.join(socketRoom);
        socket.to(socketRoom).emit("join", room);

    });

    socket.on("offer", offer => {
        socket.to(socketRoom).emit("offer", offer);git
    });

    socket.on("answer", answer => {
        socket.to(socketRoom).emit("answer", answer);
    });

    socket.on("candidate", candidate => {
        socket.to(socketRoom).emit("candidate", candidate);
    });


});

server.listen(PORT, HOST, () => {
    console.log("Server is listening on PORT: ", PORT);
});