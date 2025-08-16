const fs = require('fs');
const readline = require('node:readline');
const chalk = require('chalk');
const validator = require('validator');

const { stdin: input, stdout: output } = require('node:process');
const rl = readline.createInterface({ input, output });

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

function pertanyaan(pertanyaan) {
    return new Promise((resolve, rejects) => {
        rl.question(pertanyaan, (jawaban) => {
            resolve(jawaban);
        });
    });
}



function loadContacts() {
    const fileBuffer = fs.readFileSync(dataPath, 'utf8');
    const contacts = JSON.parse(fileBuffer);
    return contacts;
}


const simpanKontak = (nama, email, noHP) => {
    const contact = { nama, email, noHP };
    const contacts = loadContacts();

    //cek duplikat
    const duplikat = contacts.find(contact => contact.nama === nama)
    if (duplikat) {
        console.log(chalk.red.inverse.bold`Nama ${nama} sudah terdaftar , gunakan nama lain`);
        rl.close();
        return false;
    }

    //cek email
    if (email) {
        if (!validator.isEmail(email)) {
            console.log(chalk.red.inverse.bold`Email tidak valid!`);
            rl.close();
            return false;
        }
    }

    //cek noHP
    if (!validator.isMobilePhone(noHP)) {
        console.log(chalk.red.inverse.bold`noHP tidak valid!`);
        rl.close();
        return false;
    }


    contacts.push(contact);
    fs.writeFileSync(dataPath, JSON.stringify(contacts, null, 2), 'utf8');
    console.log(chalk.bgGreen.black.bold`Terimakasih ${nama} sudah memasukan data`);
    rl.close();
}



const listContact = () => {
    const contacts = loadContacts();
    console.log(chalk.black.bold.bgBlue(`LIST KONTAK : `));
    contacts.forEach((contact, i) => {
        (i % 2 == 0) ?
            console.log(chalk.bgWhiteBright.black(` ${i + 1}. ${contact.nama} - ${contact.noHP} `)) :
            console.log(chalk.bgBlueBright.white(` ${i + 1}. ${contact.nama} - ${contact.noHP} `));
    });
    rl.close();
    return
}

//
const detailContact = (nama) => {
    const contacts = loadContacts();
    const contact = contacts.find((contact) => { return contact.nama.toLowerCase() === nama.toLowerCase() });
    !contact ?
        console.log(chalk.bgRed.black.bold(` kontak ${nama} tidak ditemukan `)) :
        console.log(chalk.bgBlue.white(` ${contact.nama} - ${contact.noHP} - ${contact.email || ` tidak ada email `} `));
    rl.close();
    return
}

//
const deleteContact = (nama) => {
    const contacts = loadContacts();
    const contact = contacts.find((contact) => { return contact.nama.toLowerCase() === nama.toLowerCase() });
    const newcontacts = contacts.filter((contact) => { return contact.nama.toLowerCase() !== nama.toLowerCase() });
    fs.writeFileSync(dataPath, JSON.stringify(newcontacts, null, 2), 'utf8');
    const sukses = Boolean(contacts.length - newcontacts.length === 1);
    !sukses ?
        console.log(chalk.bgRed.black.bold(` kontak ${nama} gagal dihapus atau tidak ada `)) :
        console.log(chalk.bgWhite.black.bold(` Berhasil menghapus kontak "${contact.nama} - ${contact.noHP} - ${contact.email || ` tidak ada email `}" `));
    rl.close();
    return
}



module.exports = { simpanKontak, listContact, detailContact, deleteContact };