import * as bcrypt from 'bcrypt';


// buat hash pw
const hashPassword = (password, salt) => {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, salt, (error, result) => {
      if (error) {
        return reject(error);
      }
      resolve(result);
    });
  })
};
//cek
const compareHash = (password, hash) => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, hash, (error, same) => {
      if (error) { reject(error) };
      resolve(same);
    })
  })
}

const email = 'akunguest@gmail.com';
const password = 'password akun free fire akun guest';
const hasedPassword = await hashPassword(password, email);
const compareF = await compareHash('aku hengker', hasedPassword);
const compareT = await compareHash(password, hasedPassword);

console.log({
  cred:
  { password, email },
  hasedPassword,
  compareF,
  compareT

});
