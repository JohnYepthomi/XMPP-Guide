function sendMessage(to, body){
    let message = xml("message", { type: "chat", to: to}, xml("body", {}, body));
    window.xmppObj.send(message);
}