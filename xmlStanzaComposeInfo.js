/** 
 * @create_child_node => .c() - 
 * @create_text_node => .t() - 
 * @specify_next_node_as_sibling_with_up => .c().t().up() - here up() means that the next child added will be a sibling.
*/

/* The 'vCard' node is added as a child of the 'iq' node on a seperate call. Do not attach the child node to the parent node in the same call. */
let iq_get_vcard = new xml.Element('iq', {from: 'peter@localhost', type: 'get', id:'v1'});
iq_get_vcard.c('vCard', {xmlns: 'vcard-temp'});



/** 
 * @Set_An_Avatar_For_User
 */

let iq_set_vcard = new xml.Element('iq', {from: 'peter@localhost', type: 'get', id:'v1'});
iq_set_vcard.c('vCard', {xmlns: "vcard-temp"})
    .c('PHOTO')
    .c('TYPE').t('image/png').up()
    .c('BINVAL').t(base64Avatar);
