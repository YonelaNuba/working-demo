const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const fs = require("fs");

const HOST = "146.231.88.65";



app.use(express.static("public"));

app.get('/index', (req, res) =>{
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

const options = {
    key: fs.readFileSync("key.pem"),
    cert: fs.readFileSync("cert.pem")
};
const server = require('https').createServer(options, app);
const io = require("socket.io")(server);

var socketRoom;

io.on("connection", socket => {
    console.log("User connected to the socket", socket.id);

    socket.channels = {};
    sockets[socket.id] = socket;

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
        socket.to(socketRoom).emit("offer", offer);
    });

    socket.on("answer", answer => {
        socket.to(socketRoom).emit("answer", answer);
    });

    socket.on("candidate", candidate => {
        socket.to(socketRoom).emit("candidate", candidate);
    });

    socket.on('fileInfo', (config) => {
        let room_id = config.room_id;
        let peer_name = config.peer_name;
        let file = config.file;

        function bytesToSize(bytes) {
            let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
            if (bytes == 0) return '0 Byte';
            let i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
            return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
        }

        file['peerName'] = peer_name;

        log.debug('[' + socket.id + '] Peer [' + peer_name + '] send file to room_id [' + room_id + ']', {
            peerName: file.peerName,
            fileName: file.fileName,
            fileSize: bytesToSize(file.fileSize),
            fileType: file.fileType,
        });

        sendToRoom(room_id, socket.id, 'fileInfo', file);
    });


});

server.listen(PORT, HOST, () => {
    console.log("Server is listening on PORT: ", PORT);
});

async function sendToRoom(room_id, socket_id, msg, config = {}) {
    for (let peer_id in channels[room_id]) {
        // not send data to myself
        if (peer_id != socket_id) {
            await channels[room_id][peer_id].emit(msg, config);
        }
    }
}

async function sendToPeer(peer_id, sockets, msg, config = {}) {
    if (peer_id in sockets) {
        await sockets[peer_id].emit(msg, config);
    }
}

async function removePeerFrom(channel) {
    if (!(channel in socket.channels)) {
        log.debug('[' + socket.id + '] [Warning] not in ', channel);
        return;
    }

    delete socket.channels[channel];
    delete channels[channel][socket.id];
    delete peers[channel][socket.id];

    switch (Object.keys(peers[channel]).length) {
        case 0:
            // last peer disconnected from the room without room status set, delete room data
            delete peers[channel];
            break;
        case 1:
            // last peer disconnected from the room having room status set, delete room data
            if ('Locked' in peers[channel]) delete peers[channel];
            break;
    }

    for (let id in channels[channel]) {
        await channels[channel][id].emit('removePeer', { peer_id: socket.id });
        socket.emit('removePeer', { peer_id: id });
        log.debug('[' + socket.id + '] emit removePeer [' + id + ']');
    }
}

async function addPeerTo(channel) {
    for (let id in channels[channel]) {
        // offer false
        await channels[channel][id].emit('addPeer', {
            peer_id: socket.id,
            peers: peers[channel],
            should_create_offer: false,
            iceServers: iceServers,
        });
        // offer true
        socket.emit('addPeer', {
            peer_id: id,
            peers: peers[channel],
            should_create_offer: true,
            iceServers: iceServers,
        });
        log.debug('[' + socket.id + '] emit addPeer [' + id + ']');
    }
}