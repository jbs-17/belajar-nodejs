const { MongoClient, ObjectId } = require("mongodb");

// const url = 'mongodb+srv://akuntamulaptophp:1248@cluster0.5bgwgkd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const url = 'mongodb://admin:1248@127.0.0.1:27017';
const dbName = 'belajar';


const connection = new MongoClient(url);

connection.connect().then(async client => {
  const db = client.db(dbName);
  const mahasiswa = db.collection('mahasiswa');

  //CREATE
  //insert satu dokumen
  // const insertOne = await mahasiswa.insertOne({
  //   nama: 'Ridho',
  //   email: 'ridho@email.id'
  // });
  // console.log(insertOne);

  //insert banyak dokumen
  // const insertMany = await mahasiswa.insertMany([
  //   {
  //     nama: 'Mahen',
  //     email: 'mahen@email.id'
  //   },
  //   {
  //     nama: 'Yohan',
  //     email: 'yohan@email.id'
  //   },
  // ]);
  // console.log(insertMany);

  //READ
  //tampilkan semua dokumen di collection mahasiswa
  // const find = await mahasiswa.find({}).toArray();
  // console.log(find);

  //berdasarkan kriteria
  // const find1 = await mahasiswa.find({ nama: 'Mahen'}).toArray();
  // console.log(find1);

  //dari ObjectId
  // const find2 = await mahasiswa.find({ '_id': new ObjectId('68a3230f9584d31191de6f51') }).toArray();
  // console.log(find2);


  //UPDATE
  //update satu dokumen
  // const updateOne = await mahasiswa.updateOne({ _id: new ObjectId('68a32522e1845c52ce3ada4d') }, { $set: { updatedAt: new Date() } });
  // console.log(updateOne);

  //update banyak data berdasarkan kriteria
  const updateMany = await mahasiswa.updateMany({ nama: 'Yohan' }, { $set: { updatedAt: new Date() } });
  console.log(updateMany);


  //DELETE
  //delete satu dokumen
  // const deleteOne = await mahasiswa.deleteOne({ _id: new ObjectId('68a32522e1845c52ce3ada4d') });
  // console.log(deleteOne);


  //update banyak data berdasarkan kriteria
  // const deleteMany = await mahasiswa.deleteMany({ nama: 'Yohan' }, { $set: { updatedAt: new Date() } });
  // console.log(deleteMany);


  // //buat anu
  // await mahasiswa.insertMany([
  //   {
  //     nama: 'Mahen',
  //     email: 'mahen@email.id',
  //     _id: new ObjectId('68a32522e1845c52ce3ada4d')
  //   },
  //   {
  //     nama: 'Yohan',
  //     email: 'yohan@email.id'
  //   },
  //   {
  //     nama: 'Yohan',
  //     email: 'yohan@email.id'
  //   },
  //   {
  //     nama: 'Ridho',
  //     email: 'ridho@email.id'
  //   },
  // ]);

  await client.close();
  console.log('koneksi ke mongodb sukses dan selesai!');
})
  .catch(error => { throw error; });