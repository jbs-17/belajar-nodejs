// console.log("file root / utama adalah index.js");
// const nama = "Jati";
// // console.log(nama)

// const cetakNama = nama => `Hi, nama saya ${nama}`
// // console.log(cetakNama('Jati Bangun S.'))
// console.log(cetakNama(nama))


const cetakNama = require('./satu.js'); //local module
console.log("halo dari index.js!");
// console.log(cetakNama("JatiBS")); //Error , tidak seperti js browser
console.log(cetakNama("JatiBS"));  //sudah bisa karena sudah di export dari satu.js