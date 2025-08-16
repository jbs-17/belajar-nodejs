
const cetakNama = nama => `Hi, nama saya ${nama}`;

const PI = 3.14;

const mahasiswa = {
    nama: "Dody Hermawan",
    umur: 18,
    cetakMahasiswa() {
        return `Nama saya ${this.nama}, saya ${this.umur} tahun.`;
    }
}

class Orang {
    constructor() {
        console.log("Objek Orang dibuat!")
    }
}

// module.exports.cetakNama = cetakNama;
// module.exports.PI = PI;
// module.exports.mahasiswa = mahasiswa;
// module.exports.Orang = Orang;

module.exports = {
    cetakNama,
    PI,
    mahasiswa,
    Orang
}