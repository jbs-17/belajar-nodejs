//core module
//File System
const fs = require('fs');

//menulis string ke file sync
// try {
//     fs.writeFileSync('data/test.txt', 'Hello World! Secara syncronous!');
// } catch (e) {
//     console.log(e)
// }

// //menulis string ke file async
// fs.writeFile('data/test.txt', 'Hello World! Secara asyncronous!', (e) => {
//     console.log(e);
// });



//membaca isi file sync
// console.log(fs.readFileSync('data/test.txt', 'utf8'));

//membaca isi file async
// fs.readFile('data/test.txt', { encoding: 'utf-8' }, (err, data) => {
//     if (err) throw err;
//     console.log(data);
// });


//readline
const readline = require('node:readline');
const { stdin: input, stdout: output } = require('node:process');

const rl = readline.createInterface({ input, output });

// rl.question('Masukan nama anda: ', (nama) => {
//     console.log(`Terimakasih ${nama}`);
//     rl.close();
// });

// rl.question('masukan nama: ', (nama) => {
//     rl.question('masukan no hp: ', (no) => {
//         console.log(`nama anda ${nama} dan no hp anda ${no}`);
//         rl.close();
//     });
// });




//tugas
fs.readFile('data/contact.json', 'utf-8', (err, data) => {
    data = JSON.parse(data);
    if (err) throw err;
    rl.question('Masukan nama anda : ', (nama) => {
        rl.question('Masukam noHP anda : ', (noHP) => {
            const contact = { nama, noHP };
            data.push(contact)
            data = JSON.stringify(data, null, 2);
            fs.writeFile('data/contact.json', data, (err) => {
                if (err) throw err;
                console.log(`Terimakasih ${nama} sudah memasukan ${noHP}`);
                rl.close();
            })
        })
    })
})