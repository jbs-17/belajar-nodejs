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

//cek nama sudah ada atau tidak
const cekDuplikat = (nama) => loadContacts().find(contact => contact.nama === nama);

//hapus contact dari nama
const deleteContact = (nama) => {
  const contacts = loadContacts().filter(contact => contact.nama !== nama);
  saveContacts(contacts);
};

//update contact
const updateContacts = newContact => {
  const contacts = loadContacts();
  //hilangkan kontak lama yang nama nya sama dnegan oldNama newContact
  const filteredContacts = contacts.filter(contact => contact.nama !== newContact.oldNama);
  delete newContact.oldNama;
  filteredContacts.push(newContact);
  saveContacts(filteredContacts);
}

module.exports = {
  loadContacts,
  findContact,
  addContact,
  cekDuplikat,
  deleteContact,
  updateContacts
}