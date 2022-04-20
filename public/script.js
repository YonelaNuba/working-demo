'use strict';

// const { default: tippy } = require("tippy.js");

// var DetectRTC = require('detectrtc');
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


// ====================================================================================================================================================
// New Features for upgrading my App 
const notifyBySound = true; //Sound Notification On/Off
const fileSharingInput = '*';

const isMobileDevice = DetectRTC.isMobileDevice;
const isWebRTCSupported = DetectRTC.isWebRTCSupported;
const myBrowserName = DetectRTC.browser.name;

let isDocumentOnFullScreen = false;
let isWhiteboardFS = false;

const isHttps = false;

// Initial Audio-Video.
let initAudioBtn;
let initVideoBtn;

// ...Recored Media stream
let mediaRecorder;
let recordedBlobs;
let isStreamRecording = false;

// Buttons Bar
let buttonsBar;
let shareRoomBtn;
let audioBtn;
let videoBtn;
let swapCameraBtn;
let screenShareBtn;
let recordStreamBtn;
let fullScreenBtn;
let chatRoomBtn;
let myHandBtn;
let whiteboardBtn;
let fileShareBtn;
let leaveRoomBtn;

// White Initialization
let whiteboardCont;
let whiteboardHeader;
let whiteboardColorPicker;
let whiteboardCloseBtn;
let whiteboardFsBtn;
let whiteboardCleanBtn;
let whiteboardSaveBtn;
let whiteboardEraserBtn;
let isWhiteboardVisible = false;
let canvas;
let ctx;

// Whiteboard settings
let isDrawing = 0;
let x = 0;
let y = 0;
let color = '#000000';
let drawsize = 3;

// File transfer settings
let fileToSend;
let fileReader;
let receiveBuffer = [];
let receivedSize = 0;
let incomingFileInfo;
let incomingFileData;
let sendFileDiv;
let sendFileInfo;
let sendProgress;
let sendAbortBtn;
let sendInProgress = false;
const chunkSize = 1024 * 16;

const roomId = getRoomId();
const signalingServer = getSignalingServer();
const peerInfo = getPeerInfo();


// Function to load the HTML buttons we created
function getHtmlElementsById(){
    audioBtn = document.getElementById('audioBtn');
    videoBtn = document.getElementById('videoBtn');
    swapCameraBtn = document.getElementById('swapCameraBtn');
    screenShareBtn = document.getElementById('screenShareBtn');
    recordStreamBtn = document.getElementById('recordStreamBtn');
    fullScreenBtn = document.getElementById('fullScreenBtn');
    chatRoomBtn = document.getElementById('chatRoomBtn');
    whiteboardBtn = document.getElementById('whiteboardBtn');
    fileShareBtn = document.getElementById('fileShareBtn');
    myHandBtn = document.getElementById('myHandBtn');
    leaveRoomBtn = document.getElementById('hang-up');
    buttonsBar = document.getElementById('buttonsBar');
    shareRoomBtn = document.getElementById('shareRoomBtn');

    whiteboardCont = document.querySelector('.whiteboard-cont');
    whiteboardHeader = document.querySelector('.colors-cont');
    whiteboardCloseBtn = document.getElementById('whiteboardCloseBtn');
    whiteboardFsBtn = document.getElementById('whiteboardFsBtn');
    whiteboardColorPicker = document.getElementById('whiteboardColorPicker');
    whiteboardSaveBtn = document.getElementById('whiteboardSaveBtn');
    whiteboardEraserBtn = document.getElementById('whiteboardEraseBtn');
    whiteboardCleanBtn = document.getElementById('whiteboardCleanBtn');
    canvas = document.getElementById('whiteboard');
    ctx = canvas.getContext('2d');


    sendFileDiv = document.getElementById('sendFileDiv');
    sendFileInfo = document.getElementById('sendFileInfo');
    sendProgress = document.getElementById('sendProgress');
    sendAbortBtn = document.getElementById('sendAbortBtn');

}

// Function to play sound Notification
async function playSound(name) {
    if (notifyBySound) return;
    let sound = '../sounds' + name + '.mp3';
    let audioToPlay = new Audio(sound);
    try{
        await audioToPlay.play();
    } catch (err){
        console.error("Cannont play sound", err);
        return;
    }
}

// Setting Buttons titles
function setButtonsTitle(){
    // No need if it's mobile device.
    if(isMobileDevice) return;

    // If it's not mobile then we have to show the tooltips.
    tippy(shareRoomBtn, {
        content: 'Invite people to join',
        placement: 'top',
    });

    tippy(audioBtn, {
        content: 'Click to On/Off audio',
        placement: 'top',
    });

    tippy(videoBtn, {
        content: 'Click to On/Off Video',
        placement: 'top',
    });

    tippy(screenShareBtn, {
        content: 'Start screen sharing',
        placement: 'top',
    });

    tippy(swapCameraBtn,{
        content: 'Swap Camera',
        placement:'top',
    })

    tippy(recordStreamBtn, {
        content: 'Start recording',
        placement: 'top',
    });

    tippy(fullScreenBtn, {
        content: 'View Full screen',
        placement: 'top',
    });

    tippy(chatRoomBtn, {
        content: 'Open Chats',
        placement: 'top',
    });

    tippy(myHandBtn, {
        content: 'Raise Your Hand',
        placement: 'top',
    });

    tippy(whiteboardBtn, {
        content: 'Open the Whiteboard',
        placement: 'top',
    });

    tippy(fileShareBtn, {
        content: 'Share a File',
        placement: 'top',
    });

    tippy(leaveRoomBtn, {
        content: 'Leave this Room',
        placement: 'top',
    });

    tippy(whiteboardCloseBtn, {
        content: 'Close Whiteboard',
        placement: 'top',
    });
    tippy(whiteboardFsBtn, {
        content: 'View Full screen',
        placement: 'top',
    });
    tippy(whiteboardColorPicker, {
        content: 'Color Picker',
        placement: 'top',
    });
    tippy(whiteboardSaveBtn, {
        content: 'Save the board',
        placement: 'top',
    });
    tippy(whiteboardEraserBtn, {
        content: 'Erasa the board',
        placement: 'top',
    });
    tippy(whiteboardCleanBtn, {
        content: 'Clean the board',
        placement: 'top',
    });
    tippy(sendAbortBtn, {
        content: 'Abort File Transfer',
        placement: 'top',
    });
}

// This function will handle muting of a specific user in the room.
function handlePeerAudioBtn(peer_id){

}


// ...EventListeners for the use case Buttons.
function setAudioBtn(){
    audioBtn.addEventListener('click', (e) => {
        handleAudio(e, false);
    });
}

function setVideoBtn(){
    videoBtn.addEventListener('click', (e) => {
        handleVideo(e, false);
    });
}

function setShareRoomBtn(){
    shareRoomBtn.addEventListener('click', async (e) =>{
        shareRoomUrl();
    });
}

function setSwapCameraBtn() {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
        const videoInput = devices.filter((device) => device.kind === 'videoinput');
        if (videoInput.length > 1 && isMobileDevice) {
            swapCameraBtn.addEventListener('click', (e) => {
                swapCamera();
            });
        } else {
            swapCameraBtn.style.display = 'none';
        }
    });
}


function setScreenShareBtn(){
    if (!isMobileDevice && (navigator.getDisplayMedia || navigator.mediaDevices.getDisplayMedia)){
        screenShareBtn.addEventListener('click', (e) =>{
            toggleScreenSharing();
        });
    } else{
        screenShareBtn.style.display = "none";
    }
}

function setRecordStreamBtn(){
    recordStreamBtn.addEventListener('click', (e) =>{
        if (isStreamRecording) {
            stopStreamRecording();
        } else{
            startStreamRecording();
        }
    });
}


function setFullScreenBtn(){
    if(DetectRTC.browsere.name != 'Safari'){
        document.addEventListener('fullscreenchange', (e) =>{
            let fullscreenElement = document.fullscreenElement;
            if(!fullscreenElement){
                fullScreenBtn.className = 'fa fas-expand-alt';
                isDocumentOnFullScreen = false;

                if (!isMobileDevic){
                    tippy(fullscreenBtn, {
                        content: 'VIEW full screen',
                        placement: 'top',
                    });
                }
            }
        });
        fullScreenBtn.addEventListener('click', (e) =>{
            toggleFullScreen();
        });
    } else{
        fullScreenBtn.style.display = "none";
    }

}

function setChatRoomBtn(){
    setChatRoomForMobile();

    chatRoomBtn.addEventListener('click', (e) =>{
        if (!isChatRoomVisible){
            showChatRoomDraggable();
        } else {
            hideChatRoomDraggable();
            e.target.className = 'fas fa-comment';
        }
    });

    // ...I still have to implent other functions under this one.
}

function getRoomId() {
    // skip /join/
    let roomId = location.pathname.substring(6);
    // if not specified room id, create one random
    if (roomId == '') {
        roomId = makeId(12);
        const newurl = signalingServer + '/join/' + roomId;
        window.history.pushState({ url: newurl }, roomId, newurl);
    }
    return roomId;
}

function makeId(length) {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function setMyHandBtn(){
    myHandBtn.addEventListener('click', async (e) =>{
        setMyHandStatus();
    });
}

function setMyWhiteboardBtn(){
    if (isMobileDevice){
        whiteboardBtn.style.display = 'none';
        return;
    }

    setupCanvas();

    whiteboardBtn.addEventListener('click', (e) =>{
        if (isWhiteboardVisible){
            whiteboardClose();
            remoteWbAction('close');
        } else{
            whiteboardOpen();
            remoteWbAction('open');
        }
    });

    whiteboardCloseBtn.addEventListener('click', (e) =>{
        whiteboardClose();
        remoteWbAction('open');
    });

    whiteboardFsBtn.addEventListener('click', (e) =>{
        whiteboardResize();
        remoteWbAction('resize');
    });

    whiteboardEraserBtn.addEventListener('click', (e) =>{
        setEraser();
    });

    whiteboardSaveBtn.addEventListener('click', (e) => {
        saveWbCanvas();
    });

    whiteboardCleanBtn.addEventListener('click', (e) => {
        confirmCleanBoard();
    });
}

function setMyFileShareBtn(){
    if (!isMobileDevice) dragElement(document.getElementById('sendFileDiv', document.getElementById('imgShare')));

    fileShareBtn.addEventListener('click', (e) =>{
        selectFileToShare();
    });
    sendAbortBtn.addEventListener('click', (e) =>{
        abortFileTranfer();
    })
}

function getSignalingServer() {
    if (isHttps) {
        return 'https://' + 'localhost' + ':' + signalingServerPort;
        // outside of localhost change it with YOUR-SERVER-DOMAIN
    }
    return (
        'http' +
        (location.hostname == 'localhost' ? '' : 's') +
        '://' +
        location.hostname +
        (location.hostname == 'localhost' ? ':' + signalingServerPort : '')
    );
}
function userLog(type, message){
    switch (type) {
        case 'error':
            Swal.fire({
                background: swalBackground,
                position: 'center',
                icon: 'error',
                title: 'Ohh No !!!!',
                text: message,
            });
            break;
        case 'info':
            swal.fire({                
                background: swalBackground,
                position: 'center',
                icon: 'info',
                title: 'Info',
                text: message,
                showClass: {
                    popup: 'animate__animated animate__fadeInDown',

                },
                hideClass: {
                    popup: 'animate__animated animate__fadeOutUp',
                },
            });
            break;
        case 'success':
            swal.fire({                
                background: swalBackground,
                position: 'center',
                icon: 'success',
                title: 'success',
                text: message,
                showClass: {
                    popup: 'animate__animated animate__fadeInDown',

                },
                hideClass: {
                    popup: 'animate__animated animate__fadeOutUp',
                },
            });
            break;
        case 'success-html':
            swal.fire({                
                background: swalBackground,
                position: 'center',
                icon: 'success',
                title: 'success',
                text: message,
                showClass: {
                    popup: 'animate__animated animate__fadeInDown',

                },
                hideClass: {
                    popup: 'animate__animated animate__fadeOutUp',
                },
            });
            break;
        case 'toast':
            const Toast = Swal.mixin({
                background: swalBackground,
                toast: true,
                position: top-end,
                showConfirmButton: false,
                timer: 3000,
            });
            break;
        default:
            alert(message)      
    }
}

async function shareRoomUrl(){
    const myRoomUrl = window.location.href;

    let isSupportedNavigatorShare = false;
    let errorNavigatorshare = false;

    if(navigator.share){
        isSupportedNavigatorShare = true;

        try{
            await navigator.share({url: myRoomUrl});
            userLog('toast', 'Room Shared Successfully!');
        } catch (err){
            errorNavigatorshare = true;

            /* This will be tested later on
            console.error("navigator.share", err);
            */
        }
    }

    if(!isSupportedNavigatorShare || (isSupportedNavigatorShare && errorNavigatorshare)){
        playSound('newMessage');
        Swal.fire({
            background: swalBackground,
            position: 'center',
            title: 'Share the Room',
            html:
            `
            <br/>
            <div id="qrRoomContainer">
                <canvas id="qrRoom"></canvas>
            </div>
            <br/><br/>
            <p style="color: white;"> Share this room and invite other peers to join. </p>
            <p style="color:rgb(8,189,89);">` + myRoomUrl +
            `</p>`,
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: `Copy meeting URL`,
            denyButtonText: `Email invite`,
            cancelButtonText: `Close`,
            showClass: {
                popup: 'animate__animated animate__fadeInDown',
            },
            hideClass: {
                popup: 'animate__animated animate__fadeOutUp',
            },
            
        }).then((results) => {
            if (results.isConfirmed) {
                copyRoomURL();
            } else if (results.isDenied){
                let message = {
                    email: '',
                    subject: 'Please join our meeting video chat',
                    body: 'Please click this link to joint the meeting: ' + myRoomUrl,
                };
                shareRoomByEmail(message);
            }
        });
        makeRoomQR();
    }
}

function makeRoomQR(){
    let qr = new QRious({
        element: document.getElementById('qrRoom'),
        value: window.location.href,
    });
    qr.set({
        size: 128,
    });
}

function copyRoomURL(){
    let roomURL = window.location.href;
    let tmpInput = document.createElement('input');
    document.body.appendChild(tmpInput);
    tmpInput.value = roomURL;
    tmpInput.select();
    tmpInputsetSelectedRange(0, 99999);
    document.execCommand('copy');
    console.log('Copied to clipboard join Link');
}

function shareRoomByEmail(message){
    let email = message.email;
    let subject = message.subject;
    let emailBody = message.body;
    document.location = 'mailto:' + email + '?subject=' + subject + '&body=' + emailBody;
}


function handleAudio(e, init){
    localMediaStream.getAudioTracks()[0].enabled = !localMediaStream.getAudioTracks()[0].enabled;
    myAudioStatus = localMediaStream.getAudioTracks()[0].enabled;
    e.target.className = 'fas fa-microphone' + (myAudioStatus ? '' : '-slash');
    if (init) {
        audioBtn.className = 'fas fa-microphone' + (myAudioStatus ? '' : '-slash');
        if (!isMobileDevice) {
            tippy(initAudioBtn, {
                content: myAudioStatus ? 'Click to OFF audio' : 'Click to ON audio',
                placement: 'top',
            });
        }
    }
    setMyAudioStatus(myAudioStatus);
}

function setMyAudioStatus(status) {
    myAudioStatusIcon.className = 'fas fa-microphone' + (status ? '' : '-slash');
    emitPeerStatus('audio', status);
    tippy(myAudioStatusIcon, {
        content: status ? 'My audio is ON' : 'My audio is OFF',
    });
    status ? playSound('on') : playSound('off');
    
    if(!isMobileDevice){
        tippy(audioBtn, {
            content: status ? 'Click to switch audio OFF' : 'Click to switch audio ON',
            placement: 'top',
        });
    }
}



function manageLeftButtons(){
    setShareRoomBtn();
    setAudioBtn();
    setVideoBtn();
    setSwapCameraBtn();
    setScreenShareBtn();
    setRecordStreamBtn();
    setFullScreenBtn();
    setChatRoomBtn();
    setMyHandBtn();
    setMyWhiteboardBtn();
    setMyFileShareBtn();
    setLeaveRoomBtn();
    showButtonsBarAndMenu();
}

getHtmlElementsById();
setButtonsTitle();





// Get Html elements by Id
function getId(id){
    return document.getElementById(id);
}

// Get Html elements by selector.
function getSl(selector) {
    return document.querySelector(selector);
}

// Get Html elements by ClassName.
function getEcN(className) {
    return document.getElementsByClassName(className);
}


// Show or Hide all elements group by class name
function toggleClassElements(className, displayState){
    let elements = getEcN(className);
    for (let i = 0; i <elements.length; i++){
        elements[i].style.display = displayState;
    }
}

// Format date to DD-MM-YYYY-HH:MM:SS
function getDataTimeString(){
    const d = new Date();
    const date = d.toISOString().split('T')[0];
    const time = d.toTimeString().split(' ')[0];
    return `${date}-${time}`;
}

// Covert Bytes to KB-MB-GB-TB
function bytesToSize(bytes){
    let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Byte';
    let i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}


// Fuction to make an Element draggable.
function dragElement(elmnt, dragObj){
    let pos1 = 0,
        pos2 = 0,
        pos3 = 0,
        pos4 = 0;
    if (dragObj){
        dragObj.onmousedown = dragMouseDown;
    } else{
        elmnt.onmousedown = dragMouseDown;
    }
    function dragMouseDown(e){
        e = e || window.event;
        e.preventDefault();

        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;

        document.onmousemove = elementDrag;
    }
    function elementDrag(e){
        e = e || window.event;
        e.preventDefault();

        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;

        elmnt.style.top = elmnt.offsetTop - pos2 + 'px';
        elmnt.style.left = elmnt.offsetLeft - pos1 + 'px';
    }

    function closeDragElement(){
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

// Handle file transfer 
function handleFileAbort(){
    receiveBuffer = [];
    incomingFileData = [];
    receivedSize = 0;
    console.log('File transfer aborted');
    userLog('toast', 'File transfer aborted');
}



// Abort File transfer
function abortFileTranfer(){
    if (fileReader && fileReader.readyState == 1){
        fileReader.abort();
        sendFileDiv.style.display = 'none';
        sendInProgress = false;
        sendToServer('fileAbort', {
            room_id: roomId,
            peer_name: myPeerName,
        });
    }
}


// Select File to Share. 
function selectFileToShare(){
    playSound('newMessage');

    Swal.fire({
        allowOutsideClick: false,
        position : 'center',
        title: 'Share the file',
        input: 'file',
        inputeAtributes: {
            accept: fileSharingInput,
            'aria-label': 'Select the file',
        },
        showDenyButton: true,
        confirmButtonText: `Send`,
        denyButtonText: `Camcel`,
        chowClass: {
            popup: 'animate__animated animate__fadeInDown',
        },
        hideClass: {
            popup: 'animate__animated animate__fadeOutUp',
        },

    }).then((result) =>{
        if(result.isConfirmed){
            fileToSend = result.value;
            if(fileToSend && fileToSend.size > 0){
                if(!thereIsPeerConnections()){
                    userLog('info', 'No participants Found');
                    return;
                }
                sendToServer('fileInfo', {
                    room_id: roomId,
                    peer_name: myPeerName,
                    file: {
                        fileName: fileToSend.name,
                        fileSize: fileToSend.size,
                        fileType: fileToSend.type,
                    },

                });

                setTimeout(() =>{
                    sendFileData();
                }, 1000);
            } else {
                userLog('error', 'File not selected or Empty');
            }
        }
    });
}


// Send File Data through datachanel
function sendFileData(){
    console.log('Send file ' + fileToSend.name + ' size ' + bytesToSize(fileToSend.size) + ' type ' + fileToSend.type);

    sendInProgress = true;

    sendFileInfo.innerHTML = 
        'File name: ' + fileToSend.name + 
        '<br>' + 'File type: ' +
        fileToSend.type + '<br>' + 
        'File size: ' + bytesToSize(fileToSend.size) + '<br>';

    sendFileDiv.style.display = 'inline';
    sendProgress.max = fileToSend.size;
    fileReader = new FileReader();
    let offset = 0;

    fileReader.addEventListener('error', (err) => console.error('FileReader error', err));
    fileReader.addEventListener('abort', (e) => console.log('fileReader Aborted', e));
    fileReader.addEventListener('load', (e) => {
        if (!sendInProgress) return;

        sendFSData(e.target.result);
        offset += e.target.result.byteLength;

        sendProgress.value = offset;
        sendFilePercentage.innerHTML = 'Send progress: ' + ((offset / fileToSend.size) * 100).toFixed(2) + '%';


        if (offset === fileToSend.size){
            sendInProgress = false;
            sendFileDiv.style.display = 'none';
            userLog('success', 'The file ' + fileToSend.name + ' was send successfull.');
        }

        if(offset < fileToSend.size) readSlice(offset);
    });
    const readSlice = (o) => {
        const slice = fileToSend.slice(offset, o + chunkSize);
        fiileReader.readAsArrayBuffer(slice);
    };
    readSlice(0);
}

function thereIsPeerConnections() {
    if (Object.keys(peerConnections).length === 0) return false;
    return true;
}

function initClientPeer() {
    setTheme(mirotalkTheme);

    if (!isWebRTCSupported) {
        userLog('error', 'This browser seems not supported WebRTC!');
        return;
    }

    console.log('Connecting to signaling server');
    signalingSocket = io(signalingServer);

    // on receiving data from signaling server...
    signalingSocket.on('connect', handleConnect);
    signalingSocket.on('roomIsLocked', handleRoomLocked);
    signalingSocket.on('roomStatus', handleRoomStatus);
    signalingSocket.on('addPeer', handleAddPeer);
    signalingSocket.on('sessionDescription', handleSessionDescription);
    signalingSocket.on('iceCandidate', handleIceCandidate);
    signalingSocket.on('peerName', handlePeerName);
    signalingSocket.on('peerStatus', handlePeerStatus);
    signalingSocket.on('peerAction', handlePeerAction);
    signalingSocket.on('wb', handleWhiteboard);
    signalingSocket.on('kickOut', handleKickedOut);
    signalingSocket.on('fileInfo', handleFileInfo);
    signalingSocket.on('fileAbort', handleFileAbort);
    signalingSocket.on('videoPlayer', handleVideoPlayer);
    signalingSocket.on('disconnect', handleDisconnect);
    signalingSocket.on('removePeer', handleRemovePeer);
}

function sendFSData(data){
    for (let peer_id in fileDataChannels){
        if (fileDataChannels[peer_id].readyState === 'open') fileDataChannels[peer_id].send(data);
    }
}

function handleDisconnect() {
    console.log('Disconnected from signaling server');
    for (let peer_id in peerMediaElements) {
        document.body.removeChild(peerMediaElements[peer_id].parentNode);
        resizeVideos();
    }
    for (let peer_id in peerConnections) {
        peerConnections[peer_id].close();
        msgerRemovePeer(peer_id);
    }
    chatDataChannels = {};
    fileDataChannels = {};
    peerConnections = {};
    peerMediaElements = {};
}

function handleSessionDescription(config) {
    console.log('Remote Session Description', config);

    let peer_id = config.peer_id;
    let remote_description = config.session_description;


    let description = new RTCSessionDescription(remote_description);

    peerConnections[peer_id]
        .setRemoteDescription(description)
        .then(() => {
            console.log('setRemoteDescription done!');
            if (remote_description.type == 'offer') {
                console.log('Creating answer');

                peerConnections[peer_id]
                    .createAnswer()
                    .then((local_description) => {
                        console.log('Answer description is: ', local_description);
                        peerConnections[peer_id]
                            .setLocalDescription(local_description)
                            .then(() => {
                                sendToServer('relaySDP', {
                                    peer_id: peer_id,
                                    session_description: local_description,
                                });
                                console.log('Answer setLocalDescription done!');
                            })
                            .catch((err) => {
                                console.error('[Error] answer setLocalDescription', err);
                                userLog('error', 'Answer setLocalDescription failed ' + err);
                            });
                    })
                    .catch((err) => {
                        console.error('[Error] creating answer', err);
                    });
            } // end [if type offer]
        })
        .catch((err) => {
            console.error('[Error] setRemoteDescription', err);
        });
}

function handleIceCandidate(config) {
    let peer_id = config.peer_id;
    let ice_candidate = config.ice_candidate;
    peerConnections[peer_id].addIceCandidate(new RTCIceCandidate(ice_candidate)).catch((err) => {
        console.error('[Error] addIceCandidate', err);
    });
}

function handleRemovePeer(config) {
    console.log('Signaling server said to remove peer:', config);

    let peer_id = config.peer_id;

    if (peer_id in peerMediaElements) {
        document.body.removeChild(peerMediaElements[peer_id].parentNode);
        resizeVideos();
    }
    if (peer_id in peerConnections) peerConnections[peer_id].close();

    msgerRemovePeer(peer_id);

    delete chatDataChannels[peer_id];
    delete fileDataChannels[peer_id];
    delete peerConnections[peer_id];
    delete peerMediaElements[peer_id];

}

function gotStream(stream) {
    refreshMyStreamToPeers(stream, true);
    refreshMyLocalStream(stream, true);
    if (myVideoChange) {
        setMyVideoStatusTrue();
        if (isMobileDevice) myVideo.classList.toggle('mirror');
    }
    // Refresh button list in case labels have become available
    return navigator.mediaDevices.enumerateDevices();
}

function refreshMyStreamToPeers(stream, localAudioTrackChange = false) {
    if (!thereIsPeerConnections()) return;

    // refresh my stream to peers
    for (let peer_id in peerConnections) {
        let videoSender = peerConnections[peer_id]
            .getSenders()
            .find((s) => (s.track ? s.track.kind === 'video' : false));
        videoSender.replaceTrack(stream.getVideoTracks()[0]);

        if (localAudioTrackChange) {
            let audioSender = peerConnections[peer_id]
                .getSenders()
                .find((s) => (s.track ? s.track.kind === 'audio' : false));
            audioSender.replaceTrack(stream.getAudioTracks()[0]);
        }
    }
}

function refreshMyLocalStream(stream, localAudioTrackChange = false) {
    stream.getVideoTracks()[0].enabled = true;

    // enable audio
    if (localAudioTrackChange && myAudioStatus === false) {
        audioBtn.className = 'fas fa-microphone';
        setMyAudioStatus(true);
        myAudioStatus = true;
    }

    const newStream = new MediaStream([
        stream.getVideoTracks()[0],
        localAudioTrackChange ? stream.getAudioTracks()[0] : localMediaStream.getAudioTracks()[0],
    ]);
    localMediaStream = newStream;

    // log newStream devices
    logStreamSettingsInfo('refreshMyLocalStream', localMediaStream);

    // attachMediaStream is a part of the adapter.js library
    attachMediaStream(myVideo, localMediaStream); // newstream

    // on toggleScreenSharing video stop
    stream.getVideoTracks()[0].onended = () => {
        if (isScreenStreaming) toggleScreenSharing();
    };

   
    if (myVideoStatus === false) localMediaStream.getVideoTracks()[0].enabled = false;
}

function startRecordingTime() {
    recStartTime = Date.now();
    let rc = setInterval(function printTime() {
        if (isStreamRecording) {
            recElapsedTime = Date.now() - recStartTime;
            myVideoParagraph.innerHTML = myPeerName + '&nbsp;&nbsp; 🔴 REC ' + getTimeToString(recElapsedTime);
            return;
        }
        clearInterval(rc);
    }, 1000);
}


function getSupportedMimeTypes() {
    const possibleTypes = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm;codecs=h264,opus',
        'video/mp4;codecs=h264,aac',
        'video/mp4',
    ];
    return possibleTypes.filter((mimeType) => {
        return MediaRecorder.isTypeSupported(mimeType);
    });
}

function handleMediaRecorderStart(event) {
    playSound('recStart');
    if (isRecScreenSream) {
        emitPeersAction('recStart');
        emitPeerStatus('rec', isRecScreenSream);
    }
    console.log('MediaRecorder started: ', event);
    isStreamRecording = true;
    recordStreamBtn.style.setProperty('background-color', 'red');
    startRecordingTime();
    // only for desktop
    if (!isMobileDevice) {
        tippy(recordStreamBtn, {
            content: 'STOP recording',
            placement: 'right-start',
        });
    } else {
        swapCameraBtn.style.display = 'none';
    }
}

function handleMediaRecorderData(event) {
    console.log('MediaRecorder data: ', event);
    if (event.data && event.data.size > 0) recordedBlobs.push(event.data);
}

function handleMediaRecorderStop(event) {
    playSound('recStop');
    console.log('MediaRecorder stopped: ', event);
    console.log('MediaRecorder Blobs: ', recordedBlobs);
    myVideoParagraph.innerHTML = myPeerName + ' (me)';
    isStreamRecording = false;
    if (isRecScreenSream) {
        recScreenStream.getTracks().forEach((track) => {
            if (track.kind === 'video') track.stop();
        });
        isRecScreenSream = false;
        emitPeersAction('recStop');
        emitPeerStatus('rec', isRecScreenSream);
    }
    setRecordButtonUi();
    downloadRecordedStream();
    if (!isMobileDevice) { 
        tippy(recordStreamBtn, {
            content: 'START recording',
            placement: 'right-start',
        });
    } else {
        swapCameraBtn.style.display = 'block';
    }
}

function stopStreamRecording() {
    mediaRecorder.stop();
}


function setRecordButtonUi() {
    recordStreamBtn.style.setProperty('background-color', 'white');
}

function downloadRecordedStream() {
    try {
        const type = recordedBlobs[0].type.includes('mp4') ? 'mp4' : 'webm';
        const blob = new Blob(recordedBlobs, { type: 'video/' + type });
        const recFileName = getDataTimeString() + '-REC.' + type;
        const currentDevice = isMobileDevice ? 'MOBILE' : 'PC';
        const blobFileSize = bytesToSize(blob.size);

        userLog(
            'success-html',
            `<div style="text-align: left;">
                Recording Info <br/>
                FILE: ${recFileName} <br/>
                SIZE: ${blobFileSize} <br/>
                Please wait to be processed, then will be downloaded to your ${currentDevice} device.
            </div>`,
        );

        saveBlobToFile(blob, recFileName);
    } catch (err) {
        userLog('error', 'Recording save failed: ' + err);
    }
}

function setupCanvas() {
    fitToContainer(canvas);

    // whiteboard touch listeners
    canvas.addEventListener('touchstart', touchStart);
    canvas.addEventListener('touchmove', touchMove);
    canvas.addEventListener('touchend', touchEnd);

    // whiteboard mouse listeners
    canvas.addEventListener('mousedown', mouseDown);
    canvas.addEventListener('mousemove', mouseMove);
    canvas.addEventListener('mouseup', mouseUp);

    function mouseDown(e) {
        startDrawing(e.offsetX, e.offsetY);
    }

    function touchStart(e) {
        startDrawing(e.touches[0].pageX, e.touches[0].pageY);
    }

    function mouseMove(e) {
        if (!isDrawing) return;

        draw(e.offsetX, e.offsetY, x, y);
        sendDrawRemote(e.offsetX, e.offsetY, x, y);

        x = e.offsetX;
        y = e.offsetY;
    }

    function touchMove(e) {
        if (!isDrawing) return;

        draw(e.touches[0].pageX, e.touches[0].pageY, x, y);
        sendDrawRemote(e.touches[0].pageX, e.touches[0].pageY, x, y);

        x = e.touches[0].pageX;
        y = e.touches[0].pageY;
    }

    function mouseUp() {
        stopDrawing();
    }

    function touchEnd(e) {
        stopDrawing();
    }

    window.onresize = reportWindowSize;
}

function startDrawing(ex, ey) {
    x = ex;
    y = ey;
    isDrawing = true;
}


function sendDrawRemote(newx, newy, ex, ey) {
    if (thereIsPeerConnections()) {
        sendToServer('wb', {
            room_id: roomId,
            peer_name: myPeerName,
            act: 'draw',
            newx: newx,
            newy: newy,
            prevx: ex,
            prevy: ey,
            color: color,
            size: drawsize,
        });
    }
}


function stopDrawing() {
    if (isDrawing) isDrawing = false;
}


function saveWbCanvas() {
    let link = document.createElement('a');
    link.download = getDataTimeString() + 'WHITEBOARD.png';
    link.href = canvas.toDataURL();
    link.click();
    link.delete;
}


function remoteWbAction(action) {
    if (thereIsPeerConnections()) {
        sendToServer('wb', {
            room_id: roomId,
            peer_name: myPeerName,
            act: action,
        });
    }
}

function createFileSharingDataChannel(peer_id) {
    fileDataChannels[peer_id] = peerConnections[peer_id].createDataChannel('mirotalk_file_sharing_channel');
    fileDataChannels[peer_id].binaryType = 'arraybuffer';
    fileDataChannels[peer_id].onopen = (event) => {
        console.log('fileDataChannels created', event);
    };
}


function handleDataChannelFileSharing(data) {
    receiveBuffer.push(data);
    receivedSize += data.byteLength;

    // let getPercentage = ((receivedSize / incomingFileInfo.fileSize) * 100).toFixed(2);
    // console.log("Received progress: " + getPercentage + "%");

    if (receivedSize === incomingFileInfo.fileSize) {
        incomingFileData = receiveBuffer;
        receiveBuffer = [];
        endDownload();
    }
}


function joinToChannel() {
    console.log('join to channel', roomId);
    sendToServer('join', {
        channel: roomId,
        peer_info: peerInfo,
        peer_geo: peerGeo,
        peer_name: myPeerName,
        peer_video: myVideoStatus,
        peer_audio: myAudioStatus,
        peer_hand: myHandStatus,
        peer_rec: isRecScreenSream,
    });
}

function whoAreYou() {

    Swal.fire({
        allowOutsideClick: false,
        allowEscapeKey: false,
        background: swalBackground,
        position: 'center',
        imageUrl: welcomeImg,
        title: 'Enter your name',
        input: 'text',
        html: `<br>
        <div style="overflow: hidden;">
            <button id="initAudioBtn" class="fas fa-microphone" onclick="handleAudio(event, true)"></button>
            <button id="initVideoBtn" class="fas fa-video" onclick="handleVideo(event, true)"></button>
        </div>`,
        confirmButtonText: `Join meeting`,
        showClass: {
            popup: 'animate__animated animate__fadeInDown',
        },
        hideClass: {
            popup: 'animate__animated animate__fadeOutUp',
        },
        inputValidator: (value) => {
            if (!value) return 'Please enter your name';

            document.body.style.backgroundImage = 'none';
            myVideoWrap.style.display = 'inline';
            logStreamSettingsInfo('localMediaStream', localMediaStream);
            attachMediaStream(myVideo, localMediaStream);
            resizeVideos();

            myPeerName = value;
            myVideoParagraph.innerHTML = myPeerName + ' (me)';
            setPeerAvatarImgName('myVideoAvatarImage', myPeerName);
            setPeerChatAvatarImgName('right', myPeerName);
            joinToChannel();
        },
    }).then(() => {
        welcomeUser();
    });

    if (isMobileDevice) return;

    initAudioBtn = getId('initAudioBtn');
    initVideoBtn = getId('initVideoBtn');

    tippy(initAudioBtn, {
        content: 'Click to audio OFF',
        placement: 'top',
    });
    tippy(initVideoBtn, {
        content: 'Click to video OFF',
        placement: 'top',
    });
}

function handleConnect() {
    console.log('Connected to signaling server');
    if (localMediaStream) joinToChannel();
    else
        setupLocalMedia(() => {
            whoAreYou();
        });
}

function welcomeUser() {
    const myRoomUrl = window.location.href;
    Swal.fire({
        background: swalBackground,
        position: 'center',
        title: '<strong>Welcome ' + myPeerName + '</strong>',
        html:
            `
        <br/> 
        <p style="color:white;">Share this meeting invite others to join.</p>
        <p style="color:rgb(8, 189, 89);">` +
            myRoomUrl +
            `</p>`,
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: `Copy meeting URL`,
        denyButtonText: `Email invite`,
        cancelButtonText: `Close`,
        showClass: {
            popup: 'animate__animated animate__fadeInDown',
        },
        hideClass: {
            popup: 'animate__animated animate__fadeOutUp',
        },
    }).then((result) => {
        if (result.isConfirmed) {
            copyRoomURL();
        } else if (result.isDenied) {
            let message = {
                email: '',
                subject: 'Please join our MiroTalk Video Chat Meeting',
                body: 'Click to join: ' + myRoomUrl,
            };
            shareRoomByEmail(message);
        }
    });
}

function handleAddPeer(config) {
    // console.log("addPeer", JSON.stringify(config));

    let peer_id = config.peer_id;
    let peers = config.peers;
    let should_create_offer = config.should_create_offer;
    let iceServers = config.iceServers;

    if (peer_id in peerConnections) {
        
        console.log('Already connected to peer', peer_id);
        return;
    }

    if (!iceServers) iceServers = backupIceServers;
    console.log('iceServers', iceServers[0]);

  
    peerConnection = new RTCPeerConnection({ iceServers: iceServers });
    peerConnections[peer_id] = peerConnection;

    msgerAddPeers(peers);
    handleOnIceCandidate(peer_id);
    handleOnTrack(peer_id, peers);
    handleAddTracks(peer_id);
    handleRTCDataChannels(peer_id);
    if (should_create_offer) handleRtcOffer(peer_id);
    
}

function handleOnIceCandidate(peer_id) {
    peerConnections[peer_id].onicecandidate = (event) => {
        if (!event.candidate) return;
        sendToServer('relayICE', {
            peer_id: peer_id,
            ice_candidate: {
                sdpMLineIndex: event.candidate.sdpMLineIndex,
                candidate: event.candidate.candidate,
            },
        });
    };
}

function handleOnTrack(peer_id, peers) {
    peerConnections[peer_id].ontrack = (event) => {
        console.log('handleOnTrack', event);
        if (event.track.kind === 'video') {
            loadRemoteMediaStream(event.streams[0], peers, peer_id);
        }
    };
}

function handleAddTracks(peer_id) {
    localMediaStream.getTracks().forEach((track) => {
        peerConnections[peer_id].addTrack(track, localMediaStream);
    });
}

function handleRTCDataChannels(peer_id) {
    peerConnections[peer_id].ondatachannel = (event) => {
        console.log('handleRTCDataChannels ' + peer_id, event);
        event.channel.onmessage = (msg) => {
            switch (event.channel.label) {
                case 'chat_channel':
                    try {
                        let dataMessage = JSON.parse(msg.data);
                        handleDataChannelChat(dataMessage);
                    } catch (err) {
                        console.error('handleDataChannelChat', err);
                    }
                    break;
                case 'file_sharing_channel':
                    try {
                        let dataFile = msg.data;
                        handleDataChannelFileSharing(dataFile);
                    } catch (err) {
                        console.error('handleDataChannelFS', err);
                    }
                    break;
            }
        };
    };
    createChatDataChannel(peer_id);
    createFileSharingDataChannel(peer_id);
}

function handleRtcOffer(peer_id) {
    console.log('Creating RTC offer to', peer_id);
    peerConnections[peer_id]
        .createOffer()
        .then((local_description) => {
            console.log('Local offer description is', local_description);
            peerConnections[peer_id]
                .setLocalDescription(local_description)
                .then(() => {
                    sendToServer('relaySDP', {
                        peer_id: peer_id,
                        session_description: local_description,
                    });
                    console.log('Offer setLocalDescription done!');
                })
                .catch((err) => {
                    console.error('[Error] offer setLocalDescription', err);
                    userLog('error', 'Offer setLocalDescription failed ' + err);
                });
        })
        .catch((err) => {
            console.error('[Error] sending offer', err);
        });
}

function handleSessionDescription(config) {
    console.log('Remote Session Description', config);

    let peer_id = config.peer_id;
    let remote_description = config.session_description;
    let description = new RTCSessionDescription(remote_description);

    peerConnections[peer_id]
        .setRemoteDescription(description)
        .then(() => {
            console.log('setRemoteDescription done!');
            if (remote_description.type == 'offer') {
                console.log('Creating answer');
                peerConnections[peer_id]
                    .createAnswer()
                    .then((local_description) => {
                        console.log('Answer description is: ', local_description);
                        peerConnections[peer_id]
                            .setLocalDescription(local_description)
                            .then(() => {
                                sendToServer('relaySDP', {
                                    peer_id: peer_id,
                                    session_description: local_description,
                                });
                                console.log('Answer setLocalDescription done!');
                            })
                            .catch((err) => {
                                console.error('[Error] answer setLocalDescription', err);
                                userLog('error', 'Answer setLocalDescription failed ' + err);
                            });
                    })
                    .catch((err) => {
                        console.error('[Error] creating answer', err);
                    });
            } // end [if type offer]
        })
        .catch((err) => {
            console.error('[Error] setRemoteDescription', err);
        });
}


function setupLocalMedia(callback, errorback) {
    // if we've already been initialized do nothing
    if (localMediaStream != null) {
        if (callback) callback();
        return;
    }

    getPeerGeoLocation();

    console.log('Requesting access to local audio / video inputs');

    let videoConstraints =
        myBrowserName === 'Firefox' ? getVideoConstraints('useVideo') : getVideoConstraints('default');

    const constraints = {
        audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 44100,
        },
        video: videoConstraints,
    };

    navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream) => {
            loadLocalMedia(stream);
            if (callback) callback();
        })
        .catch((err) => {
            console.error('Access denied for audio/video', err);
            playSound('error');
            window.location.href = `/permission?roomId=${roomId}&getUserMediaError=${err.toString()}`;
            if (errorback) errorback();
        });
}

function logStreamSettingsInfo(name, stream) {
    console.log(name, {
        video: {
            label: stream.getVideoTracks()[0].label,
            settings: stream.getVideoTracks()[0].getSettings(),
        },
        audio: {
            label: stream.getAudioTracks()[0].label,
            settings: stream.getAudioTracks()[0].getSettings(),
        },
    });
}


// ======================================================================================================================

function loadLocalMedia(stream) {
    console.log('Access granted to audio/video');
    // hide loading div
    getId('loadingDiv').style.display = 'none';

    localMediaStream = stream;

    // local video elemets
    const videoWrap = document.createElement('div');
    const localMedia = document.createElement('video');

    // handle my peer name video audio status
    const myStatusMenu = document.createElement('div');
    const myCountTimeImg = document.createElement('i');
    const myCountTime = document.createElement('p');
    const myVideoParagraphImg = document.createElement('i');
    const myVideoParagraph = document.createElement('h4');
    const myHandStatusIcon = document.createElement('button');
    const myVideoStatusIcon = document.createElement('button');
    const myAudioStatusIcon = document.createElement('button');
    const myVideoFullScreenBtn = document.createElement('button');
    const myVideoAvatarImage = document.createElement('img');

    // menu Status
    myStatusMenu.setAttribute('id', 'myStatusMenu');
    myStatusMenu.className = 'statusMenu';

    // session time
    myCountTimeImg.setAttribute('id', 'countTimeImg');
    myCountTimeImg.className = 'fas fa-clock';
    myCountTime.setAttribute('id', 'countTime');
    tippy(myCountTime, {
        content: 'Session Time',
    });
    // my peer name
    myVideoParagraphImg.setAttribute('id', 'myVideoParagraphImg');
    myVideoParagraphImg.className = 'fas fa-user';
    myVideoParagraph.setAttribute('id', 'myVideoParagraph');
    myVideoParagraph.className = 'videoPeerName';
    tippy(myVideoParagraph, {
        content: 'My name',
    });
    // my hand status element
    myHandStatusIcon.setAttribute('id', 'myHandStatusIcon');
    myHandStatusIcon.className = 'fas fa-hand-paper pulsate';
    myHandStatusIcon.style.setProperty('color', 'rgb(0, 255, 0)');
    tippy(myHandStatusIcon, {
        content: 'My hand is RAISED',
    });
    // my video status element
    myVideoStatusIcon.setAttribute('id', 'myVideoStatusIcon');
    myVideoStatusIcon.className = 'fas fa-video';
    tippy(myVideoStatusIcon, {
        content: 'My video is ON',
    });
    // my audio status element
    myAudioStatusIcon.setAttribute('id', 'myAudioStatusIcon');
    myAudioStatusIcon.className = 'fas fa-microphone';
    tippy(myAudioStatusIcon, {
        content: 'My audio is ON',
    });
    // my video full screen mode
    myVideoFullScreenBtn.setAttribute('id', 'myVideoFullScreenBtn');
    myVideoFullScreenBtn.className = 'fas fa-expand';
    tippy(myVideoFullScreenBtn, {
        content: 'Full screen mode',
    });
    // my video avatar image
    myVideoAvatarImage.setAttribute('id', 'myVideoAvatarImage');
    myVideoAvatarImage.className = 'videoAvatarImage pulsate';

    // add elements to myStatusMenu div
    myStatusMenu.appendChild(myCountTimeImg);
    myStatusMenu.appendChild(myCountTime);
    myStatusMenu.appendChild(myVideoParagraphImg);
    myStatusMenu.appendChild(myVideoParagraph);
    myStatusMenu.appendChild(myHandStatusIcon);
    myStatusMenu.appendChild(myVideoStatusIcon);
    myStatusMenu.appendChild(myAudioStatusIcon);
    myStatusMenu.appendChild(myVideoFullScreenBtn);

    // hand display none on default menad is raised == false
    myHandStatusIcon.style.display = 'none';

    localMedia.setAttribute('id', 'myVideo');
    localMedia.setAttribute('playsinline', true);
    localMedia.className = 'mirror';
    localMedia.autoplay = true;
    localMedia.muted = true;
    localMedia.volume = 0;
    localMedia.controls = false;

    videoWrap.className = 'video';
    videoWrap.setAttribute('id', 'myVideoWrap');

    // add elements to video wrap div
    videoWrap.appendChild(myStatusMenu);
    videoWrap.appendChild(myVideoAvatarImage);
    videoWrap.appendChild(localMedia);

    document.body.appendChild(videoWrap);
    videoWrap.style.display = 'none';

    getHtmlElementsById();
    setButtonsTitle();
    manageLeftButtons();
    handleBodyOnMouseMove();
    setupMySettings();
    setupVideoUrlPlayer();
    startCountTime();
    handleVideoPlayerFs('myVideo', 'myVideoFullScreenBtn');
}


 // Load Remote Media Stream obj
 
function loadRemoteMediaStream(stream, peers, peer_id) {
    // get data from peers obj
    let peer_name = peers[peer_id]['peer_name'];
    let peer_video = peers[peer_id]['peer_video'];
    let peer_audio = peers[peer_id]['peer_audio'];
    let peer_hand = peers[peer_id]['peer_hand'];
    let peer_rec = peers[peer_id]['peer_rec'];

    remoteMediaStream = stream;

    // remote video elements
    const remoteVideoWrap = document.createElement('div');
    const remoteMedia = document.createElement('video');

    // handle peers name video audio status
    const remoteStatusMenu = document.createElement('div');
    const remoteVideoParagraphImg = document.createElement('i');
    const remoteVideoParagraph = document.createElement('h4');
    const remoteHandStatusIcon = document.createElement('button');
    const remoteVideoStatusIcon = document.createElement('button');
    const remoteAudioStatusIcon = document.createElement('button');
    const remotePrivateMsgBtn = document.createElement('button');
    const remoteYoutubeBtnBtn = document.createElement('button');
    const remotePeerKickOut = document.createElement('button');
    const remoteVideoFullScreenBtn = document.createElement('button');
    const remoteVideoAvatarImage = document.createElement('img');

    // menu Status
    remoteStatusMenu.setAttribute('id', peer_id + '_menuStatus');
    remoteStatusMenu.className = 'statusMenu';

    // remote peer name element
    remoteVideoParagraphImg.setAttribute('id', peer_id + '_nameImg');
    remoteVideoParagraphImg.className = 'fas fa-user';
    remoteVideoParagraph.setAttribute('id', peer_id + '_name');
    remoteVideoParagraph.className = 'videoPeerName';
    tippy(remoteVideoParagraph, {
        content: 'Participant name',
    });
    const peerVideoText = document.createTextNode(peers[peer_id]['peer_name']);
    remoteVideoParagraph.appendChild(peerVideoText);
    // remote hand status element
    remoteHandStatusIcon.setAttribute('id', peer_id + '_handStatus');
    remoteHandStatusIcon.style.setProperty('color', 'rgb(0, 255, 0)');
    remoteHandStatusIcon.className = 'fas fa-hand-paper pulsate';
    tippy(remoteHandStatusIcon, {
        content: 'Participant hand is RAISED',
    });
    // remote video status element
    remoteVideoStatusIcon.setAttribute('id', peer_id + '_videoStatus');
    remoteVideoStatusIcon.className = 'fas fa-video';
    tippy(remoteVideoStatusIcon, {
        content: 'Participant video is ON',
    });
    // remote audio status element
    remoteAudioStatusIcon.setAttribute('id', peer_id + '_audioStatus');
    remoteAudioStatusIcon.className = 'fas fa-microphone';
    tippy(remoteAudioStatusIcon, {
        content: 'Participant audio is ON',
    });
    // remote peer YouTube video
    remoteYoutubeBtnBtn.setAttribute('id', peer_id + '_youtube');
    remoteYoutubeBtnBtn.className = 'fab fa-youtube';
    tippy(remoteYoutubeBtnBtn, {
        content: 'Send YouTube video',
    });
    // remote private message
    remotePrivateMsgBtn.setAttribute('id', peer_id + '_privateMsg');
    remotePrivateMsgBtn.className = 'fas fa-paper-plane';
    tippy(remotePrivateMsgBtn, {
        content: 'Send private message',
    });
    // remote peer kick out
    remotePeerKickOut.setAttribute('id', peer_id + '_kickOut');
    remotePeerKickOut.className = 'fas fa-sign-out-alt';
    tippy(remotePeerKickOut, {
        content: 'Kick out',
    });
    // remote video full screen mode
    remoteVideoFullScreenBtn.setAttribute('id', peer_id + '_fullScreen');
    remoteVideoFullScreenBtn.className = 'fas fa-expand';
    tippy(remoteVideoFullScreenBtn, {
        content: 'Full screen mode',
    });
    // my video avatar image
    remoteVideoAvatarImage.setAttribute('id', peer_id + '_avatar');
    remoteVideoAvatarImage.className = 'videoAvatarImage pulsate';

    // add elements to remoteStatusMenu div
    remoteStatusMenu.appendChild(remoteVideoParagraphImg);
    remoteStatusMenu.appendChild(remoteVideoParagraph);
    remoteStatusMenu.appendChild(remoteHandStatusIcon);
    remoteStatusMenu.appendChild(remoteVideoStatusIcon);
    remoteStatusMenu.appendChild(remoteAudioStatusIcon);
    remoteStatusMenu.appendChild(remoteYoutubeBtnBtn);
    remoteStatusMenu.appendChild(remotePrivateMsgBtn);
    remoteStatusMenu.appendChild(remotePeerKickOut);
    remoteStatusMenu.appendChild(remoteVideoFullScreenBtn);

    remoteMedia.setAttribute('id', peer_id + '_video');
    remoteMedia.setAttribute('playsinline', true);
    remoteMedia.mediaGroup = 'remotevideo';
    remoteMedia.autoplay = true;
    isMobileDevice ? (remoteMediaControls = false) : (remoteMediaControls = remoteMediaControls);
    remoteMedia.controls = remoteMediaControls;
    peerMediaElements[peer_id] = remoteMedia;

    remoteVideoWrap.className = 'video';

    // add elements to videoWrap div
    remoteVideoWrap.appendChild(remoteStatusMenu);
    remoteVideoWrap.appendChild(remoteVideoAvatarImage);
    remoteVideoWrap.appendChild(remoteMedia);

    document.body.appendChild(remoteVideoWrap);

    // attachMediaStream is a part of the adapter.js library
    attachMediaStream(remoteMedia, remoteMediaStream);
    // resize video elements
    resizeVideos();
    // handle video full screen mode
    handleVideoPlayerFs(peer_id + '_video', peer_id + '_fullScreen', peer_id);
    // handle kick out button event
    handlePeerKickOutBtn(peer_id);
    // refresh remote peers avatar name
    // setPeerAvatarImgName(peer_id + '_avatar', peer_name);
    // refresh remote peers hand icon status and title
    setPeerHandStatus(peer_id, peer_name, peer_hand);
    // refresh remote peers video icon status and title
    setPeerVideoStatus(peer_id, peer_video);
    // refresh remote peers audio icon status and title
    setPeerAudioStatus(peer_id, peer_audio);
    // handle remote peers audio on-off
    handlePeerAudioBtn(peer_id);
    // handle remote peers video on-off
    handlePeerVideoBtn(peer_id);
    // handle remote private messages
    // handlePeerPrivateMsg(peer_id, peer_name);
    // handle remote youtube video
    // handlePeerYouTube(peer_id);
    // show status menu
    toggleClassElements('statusMenu', 'inline');
    // notify if peer started to recording own screen + audio
    if (peer_rec) notifyRecording(peer_name, 'Started');
}
// =====================================================================================================================

function handleVideoPlayerFs(videoId, videoFullScreenBtnId, peer_id = null) {
    let videoPlayer = getId(videoId);
    let videoFullScreenBtn = getId(videoFullScreenBtnId);

    // handle Chrome Firefox Opera Microsoft Edge videoPlayer ESC
    videoPlayer.addEventListener('fullscreenchange', (e) => {
        // if Controls enabled, or document on FS do nothing
        if (videoPlayer.controls || isDocumentOnFullScreen) return;
        let fullscreenElement = document.fullscreenElement;
        if (!fullscreenElement) {
            videoPlayer.style.pointerEvents = 'auto';
            isVideoOnFullScreen = false;
            // console.log("Esc FS isVideoOnFullScreen", isVideoOnFullScreen);
        }
    });

    // handle Safari videoPlayer ESC
    videoPlayer.addEventListener('webkitfullscreenchange', (e) => {
        // if Controls enabled, or document on FS do nothing
        if (videoPlayer.controls || isDocumentOnFullScreen) return;
        let webkitIsFullScreen = document.webkitIsFullScreen;
        if (!webkitIsFullScreen) {
            videoPlayer.style.pointerEvents = 'auto';
            isVideoOnFullScreen = false;
            // console.log("Esc FS isVideoOnFullScreen", isVideoOnFullScreen);
        }
    });

    // on button click go on FS mobile/desktop
    videoFullScreenBtn.addEventListener('click', (e) => {
        gotoFS();
    });

    // on video click go on FS
    videoPlayer.addEventListener('click', (e) => {
        // not mobile on click go on FS or exit from FS
        if (!isMobileDevice) {
            gotoFS();
        } else {
            // mobile on click exit from FS, for enter use videoFullScreenBtn
            if (isVideoOnFullScreen) handleFSVideo();
        }
    });

    function gotoFS() {
        // handle remote peer video fs
        if (peer_id !== null) {
            let remoteVideoStatusBtn = getId(peer_id + '_videoStatus');
            if (remoteVideoStatusBtn.className === 'fas fa-video') {
                handleFSVideo();
            } else {
                showMsg();
            }
        } else {
            // handle local video fs
            if (myVideoStatusIcon.className === 'fas fa-video') {
                handleFSVideo();
            } else {
                showMsg();
            }
        }
    }

    function showMsg() {
        userLog('toast', 'Full screen mode work when video is on');
    }

    function handleFSVideo() {
        // if Controls enabled, or document on FS do nothing
        if (videoPlayer.controls || isDocumentOnFullScreen) return;

        if (!isVideoOnFullScreen) {
            if (videoPlayer.requestFullscreen) {
                // Chrome Firefox Opera Microsoft Edge
                videoPlayer.requestFullscreen();
            } else if (videoPlayer.webkitRequestFullscreen) {
                // Safari request full screen mode
                videoPlayer.webkitRequestFullscreen();
            } else if (videoPlayer.msRequestFullscreen) {
                // IE11 request full screen mode
                videoPlayer.msRequestFullscreen();
            }
            isVideoOnFullScreen = true;
            videoPlayer.style.pointerEvents = 'none';
            // console.log("Go on FS isVideoOnFullScreen", isVideoOnFullScreen);
        } else {
            if (document.exitFullscreen) {
                // Chrome Firefox Opera Microsoft Edge
                document.exitFullscreen();
            } else if (document.webkitCancelFullScreen) {
                // Safari exit full screen mode ( Not work... )
                document.webkitCancelFullScreen();
            } else if (document.msExitFullscreen) {
                // IE11 exit full screen mode
                document.msExitFullscreen();
            }
            isVideoOnFullScreen = false;
            videoPlayer.style.pointerEvents = 'auto';
            // console.log("Esc FS isVideoOnFullScreen", isVideoOnFullScreen);
        }
    }
}

// ===========================================================================================================================























function handlePeerAction(config) {
    let peer_name = config.peer_name;
    let peer_action = config.peer_action;

    switch (peer_action) {
        case 'muteAudio':
            setMyAudioOff(peer_name);
            break;
        case 'hideVideo':
            setMyVideoOff(peer_name);
            break;
        case 'recStart':
            notifyRecording(peer_name, 'Started');
            break;
        case 'recStop':
            notifyRecording(peer_name, 'Stopped');
            break;
    }
}

function emitPeersAction(peerAction) {
    if(!thereIsPeerConnections()) return;

    sendToServer('peerAction', {
        room_id: roomId,
        peer_name: myPeerName,
        peer_id: null,
        peer_action: peerAction,
    });
}

function emitPeersAction(peer_id, peerAction) {
    if(!thereIsPeerConnections()) return;

    sendToServer('peerAction', {
        room_id: roomId,
        peer_id: peer_id,
        peer_name: myPeerName,
        peer_action: peerAction,
    });
}

async function sendToServer(msg, config = {}) {
    await signalingSocket.emit(msg, config);
}





// End of Edits of Features
// ====================================================================================================================================================

const pc = new RTCPeerConnection(iceServers);
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