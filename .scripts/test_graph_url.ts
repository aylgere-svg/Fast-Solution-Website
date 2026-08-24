const listId = "my-list-id";
const siteInput = "fassolutions.sharepoint.com/sites/FASMainS";

let site = siteInput;
const parts = site.split('/');
site = `${parts[0]}:/${parts.slice(1).join('/')}:`;
