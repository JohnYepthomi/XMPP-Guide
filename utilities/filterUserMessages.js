function filterUserMessages({senderJID}){
    let filtered_messages = [];

    conversationsStore.forEach(conversation => {
        let stored_jid = Object.keys(conversation)[0];
        if(stored_jid === senderJID){
            conversation[senderJID].forEach(message => {
                let type = Object.keys(message)[0];
                // let messageBody = message[type];
                let messageBody = (message.isClientMessage ? message: message[type]);
                filtered_messages.push(messageBody);
            });
        }
    });

    return filtered_messages;
}