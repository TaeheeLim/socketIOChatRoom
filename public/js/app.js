const socket = io();

const welcome = document.getElementById('welcome')
const form = welcome.querySelector("form");
const room = document.getElementById('room')

room.hidden = true

let roomName = ''

function addMessage(message){
    const ul = room.querySelector('ul')
    const li = document.createElement('li')
    li.innerText = message
    ul.appendChild(li)
}

function handleMessageSubmit(event){
    event.preventDefault();
    const input = room.querySelector('input')
    const value = input.value
    socket.emit("new_message", input.value, roomName, () => {
        addMessage(`You : ${value}`);
    })
    input.value = ''
}

function showRoom(){
    welcome.hidden = true
    room.hidden = false
    const h3 = room.querySelector('h3');
    h3.innerText = `Room ${roomName}`
    const form = room.querySelector("form")
    form.addEventListener("submit", handleMessageSubmit)
}

//서버에 socket emit해서 방 이름 전송
//그리고 서버에서 프론트의 showRoom 메소드를 실행
function handleRoomSubmit(event){
    event.preventDefault();
    const input = form.querySelector('input')
    socket.emit(
        "enter_room", 
        input.value,
        showRoom
        )
        roomName = input.value
    input.value = ''
}

form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", () => {
    addMessage("someone joined!!")
}) 

socket.on("bye", () => {
    addMessage("someone left!!")
})

socket.on("new_message", addMessage)
















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