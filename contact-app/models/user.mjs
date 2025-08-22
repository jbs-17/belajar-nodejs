import mongoose, { Schema } from 'mongoose';

const ContactSchema = new Schema(
  {
    nama: {
      type: String,
      required: [true, 'Nama kontak wajib diisi'],
      trim: true
    }
  },
  {
    strict: false, // memungkinkan field dinamis lain
    timestamps: false
  }
);

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, 'Email required'],
      unique: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password required'],
      trim: true
    },
    contacts: {
      type: [ContactSchema],
      default: []
    }
  },
  { timestamps: true }
);

const User = mongoose.model('User', UserSchema);
export default User;
