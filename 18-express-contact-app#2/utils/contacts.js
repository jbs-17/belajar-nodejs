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

//muat semua kontak yan gada
function loadContacts() {
  const fileBuffer = fs.readFileSync(dataPath, 'utf8');
  const contacts = JSON.parse(fileBuffer);
  return contacts;
}

//cari kontak dari nama
const findContact = (nama) => loadContacts().find(contact => contact.nama.toLowerCase() === nama.toLowerCase());

//tulis/timpa contacs.json dengan yang baru
const saveContacts = contacts => fs.writeFileSync('data/contacts.json', JSON.stringify(contacts), 'utf-8');

//tambah kontak
const addContact = (contact) => {
  const contacts = loadContacts();
  contacts.push(contact);
  saveContacts(contacts);
}

const cekDuplikat = (nama) => loadContacts().find(contact => contact.nama === nama);


module.exports = {
  loadContacts,
  findContact,
  addContact,
  cekDuplikat
}