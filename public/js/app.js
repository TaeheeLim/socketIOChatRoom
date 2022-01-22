const socket = io();

const myFace = document.getElementById("myFace")
const muteBtn = document.getElementById("mute")
const cameraBtn = document.getElementById("camera")
const camerasSelect = document.getElementById("cameras")


const call = document.getElementById("call")

call.hidden = true

let myStream;
let muted = false;
let cameraOff = false;
let roomName;
let myPeerConnection;

async function getCameras(){
    try{
        const devices = await navigator.mediaDevices.enumerateDevices()
        const cameras = devices.filter(device => device.kind === "videoinput")
        const currentCamera = myStream.getVideoTracks()[0]
        cameras.forEach(camera => {
            const option = document.createElement("option")
            option.value = camera.deviceId
            option.innerText = camera.label
            if(currentCamera.label === camera.label){
                option.selected = true
            }
            camerasSelect.appendChild(option)
        })
    }catch(e){
        console.log(e)
    }
}

async function getMedia(deviceId){
    const initialConstraints = {
        audio: true,
        video: { facingMode: "user" },
    }
    const cameraConstraints = {
        audio: true,
        video : { deviceId : { exact : deviceId} },
    }
    try {
        myStream = await navigator.mediaDevices.getUserMedia(
            deviceId ? cameraConstraints : initialConstraints
        );
        myFace.srcObject = myStream
        if(!deviceId) {
            await getCameras();
        }
        await getCameras();
    } catch(e){
        console.log(e)
    }
}

function handleMuteClick(){
    myStream
        .getAudioTracks()
        .forEach((track) => (track.enabled = !track.enabled));
    if(!muted){
        muteBtn.innerText = "Unmute"
        muted = true
    } else {
        muteBtn.innerText = "Mute"
        muted = false
    }
}

function handleCameraClick(){
    myStream
    .getVideoTracks()
    .forEach((track) => (track.enabled = !track.enabled));
    if(cameraOff){
        cameraBtn.innerText = "Turn Camera OFF"
        cameraOff = false
    } else {
        cameraBtn.innerText = "Turn Camera On"
        cameraOff = true
    }
}
async function handleCameraChange(){
    await getMedia(camerasSelect.value)
}

muteBtn.addEventListener("click", handleMuteClick)
cameraBtn.addEventListener("click", handleCameraClick)
camerasSelect.addEventListener("input", handleCameraChange)

//join a room
const welcome = document.getElementById("welcome")
const welcomeForm = welcome.querySelector("form")

async function initCall(){
    welcome.hidden = true
    call.hidden = false;
    await getMedia();
    makeConnection();
}

async function handleWelcomeSubmit(event){
    event.preventDefault();
    const input = welcomeForm.querySelector("input")
    await initCall();
    socket.emit("join_room", input.value)
    roomName = input.value
    input.value = ''
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit)


// Socket Code
socket.on("welcome", async () => {
    const offer = await myPeerConnection.createOffer();
    myPeerConnection.setLocalDescription(offer)
    console.log("send the offer")
    socket.emit("offer", offer, roomName)
})

socket.on("offer", async(offer) => {
    console.log("received the offer")
    myPeerConnection.setRemoteDescription(offer)
    const answer = await myPeerConnection.createAnswer()
    console.log(answer)
    myPeerConnection.setLocalDescription(answer)
    socket.emit("answer", answer, roomName)
    console.log("sent the answer")
})

socket.on("answer", (answer) => {
    console.log("received the answer")
    myPeerConnection.setRemoteDescription(answer)
})

socket.on("ice", (ice) => {
    console.log("received the candidate")
    myPeerConnection.addIceCandidate(ice)
})

function makeConnection(){
    myPeerConnection = new RTCPeerConnection();
    myPeerConnection.addEventListener("icecandidate", handleIce)
    myPeerConnection.addEventListener("addstream", handleAddStream)
    myStream
        .getTracks()
        .forEach((track) => myPeerConnection.addTrack(track, myStream))
}

function handleIce(data){
    console.log("sent the candidate")
    socket.emit("ice", data.candidate, roomName) 
}

function handleAddStream(data){
    const peerFace = document.getElementById("peerFace")
    console.log("got an event from my peer")
    console.log("Peer's Stream", data.stream)
    peerFace.srcObject = data.stream
    console.log("my stream", myStream)
} 


//이하 socketIO
// const welcome = document.getElementById('welcome')
// const form = welcome.querySelector("form");
// const room = document.getElementById('room')

// room.hidden = true

// let roomName = ''

// function addMessage(message){
//     console.log(message)
//     const ul = room.querySelector('ul')
//     const li = document.createElement('li')
//     li.innerText = message
//     ul.appendChild(li)
// }

// function handleMessageSubmit(event){
//     event.preventDefault();
//     const input = room.querySelector('#msg input')
//     const value = input.value
//     socket.emit("new_message", input.value, roomName, () => {
//         addMessage(`You : ${value}`);
//     })
//     input.value = ''
// }

// function handleNicknameSubmit(event){
//     event.preventDefault();
//     const input = room.querySelector('#name input')
//     socket.emit('nickname', input.value)
// }

// function showRoom(){
//     welcome.hidden = true
//     room.hidden = false
//     const h3 = room.querySelector('h3');
//     h3.innerText = `Room ${roomName}`
//     const msgForm = room.querySelector("#msg")
//     const nameForm = room.querySelector("#name")
//     msgForm.addEventListener("submit", handleMessageSubmit)
//     nameForm.addEventListener("submit", handleNicknameSubmit)
// }

// //서버에 socket emit해서 방 이름 전송
// //그리고 서버에서 프론트의 showRoom 메소드를 실행
// function handleRoomSubmit(event){
//     event.preventDefault();
//     const input = form.querySelector('input')
//     socket.emit(
//         "enter_room", 
//         input.value,
//         showRoom
//         )
//         roomName = input.value
//     input.value = ''
// }

// form.addEventListener("submit", handleRoomSubmit);

// socket.on("welcome", (user, newCount) => {
//     const h3 = room.querySelector('h3');
//     h3.innerText = `Room ${roomName} (${newCount})`
//     addMessage(`${user} arrived`)
// }) 

// socket.on("bye", (left, newCount) => {
//     const h3 = room.querySelector('h3');
//     h3.innerText = `Room ${roomName} (${newCount})`
//     addMessage(`${left} left`)
// })

// socket.on("new_message", addMessage)

// socket.on("room_change", (rooms) => {
//     const roomList = welcome.querySelector('ul')
//     if(rooms.length === 0 ){
//         roomList.innerHTML = ''
//         return
//     }
//     rooms.forEach(room => {
//         const li = document.createElement('li')
//         li.innerText = room
//         roomList.append(li)
//     })
// })















//이하 웹소켓
// const messageList = document.querySelector('ul');
// const messageForm = document.querySelector('#message');
// const nickForm = document.querySelector('#nick');
// const socket = new WebSocket(`ws://${window.location.host}`);

// function makeMessage(type, payload){
//     const msg = {type, payload}
//     return JSON.stringify(msg);
// }

// function handleOpen(){
//     console.log("Connected to Server")
// }

// socket.addEventListener("open", handleOpen)

// socket.addEventListener("message", (message) => {
//     const li = document.createElement('li')
//     li.innerText = message.data
//     messageList.append(li)
// })

// socket.addEventListener("close", () => {
//     console.log('server just closed')
// });

// function handleSubmit(event){
//     event.preventDefault();
//     const input = messageForm.querySelector('input');
//     socket.send(makeMessage("new_message", input.value));
//     const li = document.createElement('li')
//     li.innerText = `You : ${input.value}`
//     messageList.append(li)
//     input.value = ''
// }

// function handleNickSubmit(event){
//     event.preventDefault();
//     const input = nickForm.querySelector('input');
//     socket.send(makeMessage("nickname", input.value));
//     input.value = ''
// }

// messageForm.addEventListener('submit', handleSubmit);
// nickForm.addEventListener('submit', handleNickSubmit);