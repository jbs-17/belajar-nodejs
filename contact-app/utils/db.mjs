import mongoose from 'mongoose';

export const connectToDB = () =>
   new Promise(async (resolve, reject) => {
      try {
      await  mongoose.connect(process.env.DB_URI, {
            dbName: "contact-manager",
        });
        resolve('success to connect to database!');
      } catch (error) {
        reject('failed to connect to database!');
      }
    });
export default connectToDB;