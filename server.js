import express from "express";
import http from "http";
import SocketIO from "socket.io"

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/")); 



const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

wsServer.on("connection", socket => {
    socket.onAny((event) => {
        console.log(`socket event : ${event}`)
    })
    socket.on("enter_room", (roomName, done) => {
        //채팅방 입장
        socket.join(roomName);
        done();
        socket.to(roomName).emit("welcome");
    });
    socket.on("disconnecting", () => {
        socket.rooms.forEach(room => socket.to(room).emit("bye"))
    })
    socket.on("new_message", (msg, room, done) => {
        socket.to(room).emit("new_message", msg);
        done();
    })
})

function onSocketClose(){
    console.log("Disconnected from the Browser")
}

// const sockets = [];

// wss.on("connection", (socket) => {
//     sockets.push(socket);
//     socket["nickname"] = "Anonymous";
//     console.log('connected to browser');
//     socket.on("close",onSocketClose)
//     socket.on("message", (msg) => {
//         const message = JSON.parse(msg)
//         switch(message.type){
//             case "new_message":
//                 sockets.forEach((aSocket) => aSocket.send(`${socket.nickname} : ${message.payload}`));
//                 break;
//             case "nickname":
//                 socket["nickname"] = message.payload;
//                 break;
//         }
//     });
// });

const handleListen = () => console.log(`Listening on http://localhost:3000`)
httpServer.listen(3000, handleListen);