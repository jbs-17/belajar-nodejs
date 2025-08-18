const fs = require('node:fs');

//membuat folder data jika belum ada
const dirPath = './data';
if (!fs.existsSync(dirPath)) {
  fs.mkdirSync('./data');
}


//buat file contacts.json jika belum ada
const dataPath = './data/contacts.json'
if (!fs.existsSync(dataPath)) {
  fs.writeFileSync(dataPath, '[]', 'utf8');
}

function loadContacts() {
  const fileBuffer = fs.readFileSync(dataPath, 'utf8');
  const contacts = JSON.parse(fileBuffer);
  return contacts;
}

const findContact = (nama) => loadContacts().find(contact => contact.nama.toLowerCase() === nama.toLowerCase());

module.exports = {
  loadContacts,
  findContact
}