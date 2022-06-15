let messagesListView = (root) => {
    let messageStore = conversationsStore;

    let template = `
        <div class="messages-container">
            <ul class="messages-list">
            </ul>
        </div>
    `;

    let div = document.createElement('div');
    div.innerHTML = template;

    if(messageStore.length === 0){
        div.querySelector('.messages-list').innerHTML = '<div class="no-messages">No Messages</div>';
        root.appendChild(div);
        return;
    }

    let grouplistitems = createGroupMessageListItems(messageStore);
    let directlistitems = createDirectMessageListItems(messageStore);

    if(grouplistitems)
        div.querySelector('.messages-list').appendChild(grouplistitems);
    if(directlistitems)
        div.querySelector('.messages-list').appendChild(directlistitems);

    root.appendChild(div);
};

let createGroupMessageListItems = (messageStore)=>{
    
    let ul = document.createElement('ul');
    ul.classList.add('group-messages');
    
    messageStore.forEach(messages => {
        let jid = Object.keys(messages)[0];

        Object.values(messages).forEach(message => {
            let type = Object.keys(message[0])[0];
            if( type !== 'groupchat'){
                return;
            }
            
            let li = document.createElement('li');
            li.innerText = jid.split('@')[0];
            li.setAttribute('jid', jid);
            addMessageItemListener(li);
            ul.appendChild(li);
        });
    });

    return ul;
}

let createDirectMessageListItems = (messageStore)=>{
    let ul = document.createElement('ul');
    ul.classList.add('direct-messages');

    messageStore.forEach(messages => {
        let jid = Object.keys(messages)[0];

        Object.values(messages).forEach(message => {
            let type = Object.keys(message[0])[0];
            if(type !== 'chat'){
                return;
            }
    
            let li = document.createElement('li');
            li.innerText = jid.split('@')[0];
            li.setAttribute('jid', jid);
            addMessageItemListener(li);
            ul.appendChild(li);
        });
    });

    return ul
};

function addMessageItemListener(message_item){
    message_item.addEventListener('click', (e)=>{
        let senderJID = e.target.getAttribute('jid');
        window.activeView = 'conversationView';
        // window.currentConversation = {jid, status: 'closed'};
        viewNavigator('conversationView', {senderJID});
    });
}