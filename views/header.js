function headerView(root){
    let headerTemplate = `
        <div class="menu">
            <div class="menu-item" active="true">
                <div href="index.html">Messages</div>
            </div>
            
            <div class="menu-item">
                <div href="messages.html">Status</div>
            </div>
            
            <div class="menu-item">
                <div href="messages.html">Contacts</div>
            </div>
        </div>
    `;

    root.insertAdjacentHTML('beforeend', headerTemplate);
}