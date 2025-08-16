const fs = require('fs');
const readline = require('node:readline');

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

const simpanKontak = (nama, email, noHP) => {
    const contact = { nama, email, noHP };
    const fileBuffer = fs.readFileSync(dataPath, 'utf8');
    const contacts = JSON.parse(fileBuffer);
    contacts.push(contact);
    fs.writeFileSync(dataPath, JSON.stringify(contacts, null, 2), 'utf8');
    console.log(`Terimakasih ${nama} sudah memasukan ${email}`);
    rl.close();
}

module.exports = { pertanyaan, simpanKontak };