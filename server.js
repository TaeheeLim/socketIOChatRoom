import http from "http";
import SocketIO from "socket.io";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

wsServer.on("connection", (socket) => {
  socket.on("join_room", (roomName) => {
    socket.join(roomName);
    socket.to(roomName).emit("welcome");
  });
  socket.on("offer", (offer, roomName) => {
    socket.to(roomName).emit("offer", offer);
  });
  socket.on("answer", (answer, roomName) => {
    socket.to(roomName).emit("answer", answer);
  });
  socket.on("ice", (ice, roomName) => {
    socket.to(roomName).emit("ice", ice);
  });
});

const handleListen = () => console.log(`Listening on http://localhost:4000`);
httpServer.listen(4000, handleListen);
//이하 소켓 아이오
// private room 말고 public room 구함
// function publicRooms(){
//     const {
//         sockets : {
//             adapter : {sids, rooms},
//         },
//     } = wsServer
//     const publicRooms = []
//     rooms.forEach((_, key) => {
//         if(sids.get(key) === undefined){
//             publicRooms.push(key)
//         }
//     })
//     return publicRooms
// }

// function countRoom(roomName){
//     return wsServer.sockets.adapter.rooms.get(roomName)?.size;
    
// }

// wsServer.on("connection", socket => {
//     socket["nickname"] = "Anonymous"
//     socket.onAny((event) => {
//         console.log(`socket event : ${event}`)
//     })
//     socket.on("enter_room", (roomName, done) => {
//         //채팅방 입장
//         socket.join(roomName);
//         done();
//         socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
//         wsServer.sockets.emit("room_change", publicRooms())
//     });
//     //소켓연결이 끊기기 직전에
//     socket.on("disconnecting", () => {
//         socket.rooms.forEach(room => socket.to(room).emit("bye", socket.nickname, countRoom(room) -1))
//     })
//     //소켓연결이 끊기고나서
//     socket.on("disconnect", () => {
//         wsServer.sockets.emit("room_change", publicRooms())
//     })
//     socket.on("new_message", (msg, room, done) => {
//         socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
//         done();
//     })
//     socket.on("nickname", nickname => (socket["nickname"] = nickname))
// })

// function onSocketClose(){
//     console.log("Disconnected from the Browser")
// }



//이하 웹소켓
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

