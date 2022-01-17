var form = document.getElementById("form"),
    dashboard = document.getElementById("dashboard"),
    stream = document.getElementById("stream"),
    roomList = document.getElementById("roomList"),
    client = document.getElementById("client"),
    guest = document.getElementById("guest"),
    hangUp = document.getElementById("hang-up"),
    connect = document.getElementById("connect"),
    connectRoom = document.getElementById("connect-room");

const iceServers = {
    iceServer: {
        urls: "stun:stun.l.google.com:19302"
    }
};

const pc = new RTCPeerConnection();
const socket = io();

var rooms = [];
var inboundStream = null;
var localStream, currentRoom;

form.onsubmit = (event) => {
    event.preventDefault();
    var val = event.target[0].value;
    socket.emit("room", val);
    console.log("The value of val is: " + val);
};

hangUp.onclick = (e) => {
    location.reload();
};
var constraints = {
    audio: true,
    video: true
};

function handleUserMedia(stream) {
    localStream = stream;
    client.srcObject = stream;
    console.log("Adding local Media Stream");
    socket.emit("join", currentRoom);
}

function handleUserMediaError(error) {
    console.log("navigator.getUserMedia error: ", error);
}
connect.onclick = () => {
    currentRoom = connectRoom.value;
    if (!rooms.includes(currentRoom)) {
        alert("There is no room with a given name");
        return;
    }

    navigator.mediaDevices.getUserMedia(constraints)
        .then(handleUserMedia).catch(handleUserMediaError);

    dashboard.style.display = "none";
    stream.style.display = "block";

};

socket.on("room", room => {
    rooms.push(room);
    var li = document.createElement("li");
    li.innerHTML = room;
    roomList.appendChild(li);
});

socket.on("join", room => {
    if (currentRoom !== room) return;

    pc.ontrack = addRemoteMediaStream;
    pc.onicecandidate = generateIceCandidate;
    pc.addTrack(localStream.getTracks()[0], localStream);
    pc.addTrack(localStream.getTracks()[1], localStream);
    pc.createOffer().then(description => {
        pc.setLocalDescription(description);
        console.log("Setting local Description: ", description);
        socket.emit("offer", description);
    });
});

socket.on("offer", offer => {
    pc.ontrack = addRemoteMediaStream;
    pc.onicecandidate = generateIceCandidate;
    pc.setRemoteDescription(new RTCSessionDescription(offer));
    pc.addTrack(localStream.getTracks()[0], localStream);
    pc.addTrack(localStream.getTracks()[1], localStream);
    pc.createAnswer().then(description => {
        pc.setLocalDescription(description);
        console.log("Setting local description", description);
        socket.emit("answer", description);
    });
});

socket.on("answer", answer => {
    pc.setRemoteDescription(new RTCSessionDescription(answer));
});

socket.on("candidate", event => {
    var iceCandidate = new RTCIceCandidate({
        sdpMLineIndex: event.label,
        candidate: event.candidate
    });
    pc.addIceCandidate(iceCandidate);
});

function addRemoteMediaStream(event) {
    if (event.streams && event.streams[0]) {
        guest.srcObject = event.streams[0];
    } else {
        if (!inboundStream) {
            inboundStream = new MediaStream();
            guest.srcObject = inboundStream;
        }
        inboundStream.addTrack(event.track);
    }
}

function generateIceCandidate(event) {
    if (event.candidate) {
        var candidate = {
            type: "candidate",
            label: event.candidate.sdpMLineIndex,
            id: event.candidate.sdpMid,
            candidate: event.candidate.candidate
        };
        console.log("Sending a candidate: ", candidate);
        socket.emit("candidate", candidate);
    }
}