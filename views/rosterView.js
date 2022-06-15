let rosterView = () =>{
    let root = document.getElementById('root');

    let roster_template = `
        <div class="roster-container">
            <ul class="roster-whitelist">
            </ul>
    
            <ul class="roster-blacklist">
            </ul>
        </div>
    `;

    let div = document.createElement('div');
    div.innerHTML = roster_template;
}
    