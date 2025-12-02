let socket;

function initChat(chatId, userId) {
    socket = io();

    socket.on("connect", () => console.log("connected to server"));

    socket.emit("join", chatId);
    console.log("joined room", chatId);

    socket.on("newMsg", msg => {
        const chatWindow = document.getElementById("chat-window");
        const div = document.createElement("div");
        div.textContent = `${msg.sender}: ${msg.content}`;
        chatWindow.appendChild(div);
    });
}

function sendMessage(){
    const input = document.getElementById("message-input");
    if (!input.value) return;

    socket.emit("sendMsg", {
        chatId: window.chatId,
        sender: window.userId,
        content: input.value
    });

    console.log("message sent")

    input.value = "";
}