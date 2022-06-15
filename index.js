let root = document.querySelector('.root');
let conversationsStore = [];
const { client, xml, jid} = window.XMPP;

viewNavigator('login');