import { Server as SocketServer} from "socket.io"
import { Server as HttpServer } from "http";
import { chatDB, messageDB } from "../database/conversationschemas";

export function socketSetup(server: HttpServer){
    const io = new SocketServer(server);

    io.on("connection", socket => {
        socket.on("join", chatId => socket.join(chatId));

        socket.on("sendMsg", async data => {
            const msg = await messageDB.create({
                sender: data.sender,
                content: data.content,
            });

             await chatDB.findByIdAndUpdate(
                data.chatId,
                { $push: { messages: msg._id }}
             )

            io.to(data.chatId).emit("newMsg", msg);
        })
    })
}