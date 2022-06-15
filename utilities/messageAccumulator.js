/** 
 * @param stanza Object : contains the new xmpp message
 * @variable conversationsStore Object :  [{senderJID : { 'messageType' : ['message', 'message', ...] }}]
 **/

function messageAccumulator(stanza, isClientMessage = false){
    let isMsgExist = false;
    let from, type, body;

    if(!isClientMessage){
        from = stanza.attrs.from;
        type = stanza.attrs.type;
        body = stanza.getChild("body").text();
    }else{
        from = stanza.from;
        type = stanza.type;
        body = stanza.body;
    }

    conversationsStore.forEach((conversation, idx) => {
        if(conversationsStore[idx][from]){
            let oldMessagesObjectsArray = Object.values(conversation)[0];
            if(!isClientMessage){
                let newMessageObj = {[type]: body};
                conversationsStore[idx] = {[from]: [...oldMessagesObjectsArray, newMessageObj]};
            }else{
                let newMessageObj = {[type]: body, 'isClientMessage': true};
                conversationsStore[idx] = {[from]: [...oldMessagesObjectsArray, newMessageObj]};
            }
            isMsgExist = true;
        }
    });
    
    if(!isMsgExist){
        conversationsStore.push({[from]: [{[type]: body}]});
    }
}