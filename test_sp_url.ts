const listId = 'https://graph.microsoft.com/v1.0/sites/fassolutions.sharepoint.com:/sites/FASMainS:/lists/806742de-dd6a-4d7a-8bd1-a3fcfb6fcda0';
let url = listId;
if (listId && listId.includes('graph.microsoft.com')) {
    url = listId.split('?')[0].replace(/\/items.*$/, '') + '/items';
}
console.log(url);
