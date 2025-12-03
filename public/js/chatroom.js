let socket;

function initChat(chatId, sendername) {
    socket = io("http://localhost:3001");

    socket.on("connect", () => console.log("connected to server"));

    socket.emit("join", chatId);

    socket.on("newMsg", msg => {
        const chatWindow = document.getElementById("chat-window");
        const div = document.createElement("div");
        div.textContent = `${msg.sender}: ${msg.content} (${msg.crDate})`;
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

    input.value = "";
}