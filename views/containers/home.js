function homeView(root, extra){
    // it should contain -> extra = {jid, newMessage}
    window.activeView = 'home';
    headerView(root);
    messagesListView(root);
}