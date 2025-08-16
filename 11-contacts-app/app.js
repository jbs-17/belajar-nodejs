const yargs = require('yargs');
const { simpanKontak, listContact, detailContact, deleteContact } = require('./contacts');


yargs.command({
    command: 'add',
    describe: "Tambah kontak baru",
    builder: {
        nama: {
            describe: "nama lengkap",
            demandOption: true,
            type: "string",
        },
        email: {
            describe: 'email',
            demandOption: false,
            type: 'string'
        },
        noHP: {
            describe: 'no hp',
            demandOption: true,
            type: 'string'
        }
    },
    handler(argv) {
        simpanKontak(argv.nama, argv.email, argv.noHP);
    }
}).demandCommand();

//menampilkan daftar semua nama & noHP kontak
yargs.command({
    command: 'list',
    describe: "Menampilkan list kontak",
    handler() {
        listContact();
    }
})


//menampilkan detail
yargs.command({
    command: 'detail',
    describe: "Menampilkan detail sebuah kontak berdasarkan nama",
    builder: {
        nama: {
            describe: "nama lengkap",
            demandOption: true,
            type: "string",
        }
    },
    handler(argv) {
        detailContact(argv.nama);
    }
})

//menghaps kontak berdasarkan nama
yargs.command({
    command: 'delete',
    describe: "Menghaps kontak berdasarkan nama",
    builder: {
        nama: {
            describe: "nama lengkap",
            demandOption: true,
            type: "string",
        }
    },
    handler(argv) {
        deleteContact(argv.nama);
    }
})








yargs.parse();



















