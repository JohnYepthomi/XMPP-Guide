let conversationView = {
    initConversationView: function (root, { senderJID }, messageStore){
        window.activeView = 'conversationView';

        let messageHeader = `
            <div class="message-header">
                <div class="back-button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" class="bi bi-arrow-left" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
                    </svg>
                </div>  

                <div class="user-Info">
                    <div class="user-name">${senderJID.split('@')[0]}</div>
                </div>

                <div class="message-buttons">
                    <div class="more">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" class="bi bi-three-dots" viewBox="0 0 16 16">
                            <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
                        </svg>
                    </div>
                </div>
            </div>
        `;

        root.insertAdjacentHTML('afterbegin', messageHeader);

        let inputTemplate = `
            <div class="message-input-container">
                <input type="text" class="message-input" placeholder="Type a message...">
                <div class="message-send-button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" class="bi bi-send-fill" viewBox="0 0 16 16">
                        <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083l6-15Zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471-.47 1.178Z"/>
                    </svg>
                </div>
            </div>
        `;

        let div = document.createElement('div');
        div.classList.add('message-view-container');

        root.insertAdjacentHTML('beforeend', inputTemplate);
        
        
        addMessageViewListeners(div);
        
        root.appendChild(div);
        root.querySelector('.message-input').focus();
        
        messageStore.forEach(message => {
            updateUserMessageView({senderJID, oldMessage: message});
        });
        
        function addMessageViewListeners(messageViewContainer){
            let root = document.querySelector('.root');
        
            root.querySelector('.back-button').addEventListener('click', (e)=>{
                window.activeView = 'home';
                window.currentConversation = null;
                let senderJID = messageViewContainer.querySelector('.from').getAttribute('senderJID');
                viewNavigator('home', {senderJID});
            });
        
            root.querySelector('.message-send-button').addEventListener('click', (e)=>{
                let message = root.querySelector('.message-input').value;
                let senderJID = messageViewContainer.querySelector('.from').getAttribute('senderJID');
                if(message !== ''){
                    sendMessage(senderJID, message);
                    root.querySelector('.message-input').value = '';
                    root.querySelector('.message-input').focus();
                    appendCurrentUserMessage(senderJID, message);
                    scrollToLastMessage();
                }
            });
        
            root.querySelector('.message-input').addEventListener('keyup', (e)=>{
                if(e.keyCode === 13){
                    let message = e.target.value;
                    let senderJID = e.target.parentElement.parentElement.parentElement.querySelector('.from').getAttribute('senderJID');
                    if(message !== ''){
                        sendMessage(senderJID, message);
                        e.target.value = '';
                        e.target.focus();
                        appendCurrentUserMessage(senderJID, message);
                        scrollToLastMessage();
                    }
                }
            });
        }

        function appendCurrentUserMessage(senderJID, message, isBeingRestored){
            let clientMessageTemplate = `
                <div class="self">
                    <div class="message-body"> ${message} </div>
                </div>`;
            
            let parent= document.querySelector('.message-view-container');
            parent.insertAdjacentHTML('afterbegin', clientMessageTemplate);

            if(!isBeingRestored)
                messageAccumulator({from: senderJID, type: 'chat', body: message}, true);
        }

        function updateUserMessageView({senderJID, oldMessage}){
            if(oldMessage.isClientMessage){
                appendCurrentUserMessage(senderJID, oldMessage.chat, true);
            }else{
                let fromTemplate = `
                    <div class="from" senderJID="${senderJID}">
                        <div class="from-username">
                            ${senderJID.split('@')[0]}
                        </div>
                        <div class="message-body">
                            ${oldMessage}
                        </div>
                    </div>
                `;
        
                let root = document.querySelector('.message-view-container');
                root.insertAdjacentHTML('afterbegin', fromTemplate);
            }
        }
    },

    updateSenderConversationView: function ({senderJID, newMessage}){
        let fromTemplate = `
            <div class="from" senderJID="${senderJID}">
                <div class="from-username">
                    ${senderJID.split('@')[0]}
                </div>
                <div class="message-body">
                    ${newMessage}
                </div>
            </div>
        `;

        let root = document.querySelector('.message-view-container');
        root.insertAdjacentHTML('afterbegin', fromTemplate);
        scrollToLastMessage();
    }
};

function scrollToLastMessage(){
    let $messageViewContainer = document.querySelector('.message-view-container');
    $messageViewContainer.scrollTop = $messageViewContainer.scrollHeight;
}