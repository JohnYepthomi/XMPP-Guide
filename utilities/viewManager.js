function viewNavigator(viewname, extra){
    let activePage = window.activeView;
    
    if(viewname === 'login'){
        clearRootView();
        loginView(root);
    }
    
    else if(viewname === 'home'){
        if(!activePage || activePage === 'home'){
            clearRootView();
            homeView(root, extra);
            genericStateManager.setState('conversationView', {status: 'closed'});
        }
    }

    else if(viewname === 'conversationView'){
        let currentState = genericStateManager.getState('conversationView');
        if(activePage === 'conversationView'){
            if(currentState === 'open'){
                conversationView.updateSenderConversationView(extra);
            }else if(!currentState || currentState === 'closed'){
                clearRootView();
                genericStateManager.setState('conversationVIew', {status: 'open'});
                let filteredMessages = filterUserMessages(extra);
                conversationView.initConversationView(root, extra, filteredMessages);
            }
        }else if(activePage === 'home'){
            clearRootView();
            homeView(root, extra);
        }
    }
    
    function clearRootView(){
        let root = document.querySelector('.root');
        root.innerHTML = '';
    }
}


class genericStateManager{
    static state = [];

    static setState(name, newState){
        if(this.state[name] !== newState){
            this.state.push({[name]: newState});
        }else{
            console.log('State already set');
        }
    }

    static getState(name){
        this.state.forEach(state => {
            if(Object.keys(state)[0] === name){
                return state[name];
            }
        });
    };

    static removeState(name){
        this.state.forEach((state, idx) => {
            if(Object.keys(state)[0] === name){
                this.state.splice(idx, 1);
            }
        });
    }
}


// class conversationViewStateManager{
//     static conversationViewState = {'default': 'closed'};

//     static closeConversation(senderId){
//         if(senderId){
//             let { senderJID } = senderId;
//             this.conversationViewState[senderJID] = 'closed';
//         }
//     }

//     static openConversation({senderJID}){
//         this.conversationViewState[senderJID] = 'open';
//     }

//     static getConversationState({senderJID}){
//         if(this.conversationViewState[senderJID])
//             return this.conversationViewState[senderJID];
//         else
//             return this.conversationViewState['default'];
//     }
// }

