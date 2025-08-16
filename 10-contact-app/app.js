const { pertanyaan, simpanKontak } = require('./contacts');

const main = async () => {
    const nama = await pertanyaan('nama : ');
    const email = await pertanyaan('email : ');
    const noHP = await pertanyaan('no HP : ');
    simpanKontak(nama, email, noHP);
}
main()


