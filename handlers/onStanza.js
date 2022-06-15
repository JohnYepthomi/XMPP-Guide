function onStanza(stanza){
    let from = stanza.attrs.from;
    let message_body = stanza.getChild("body").text();
}