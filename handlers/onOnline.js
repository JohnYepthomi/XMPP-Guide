async function onOnline(address, xmppObj){
    await xmppObj.send(xml("presence"));

    let div_status = document.getElementById("status");
    div_status.innerText = `${address} is back online`;

    setTimeout(()=>{
        div_status.style = "display: none";
    }, 1000);
}